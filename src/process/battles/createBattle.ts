import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Collection,
	CommandInteraction,
	ComponentType,
	EmbedBuilder,
} from "discord.js";
import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";
import { ObjectReadStream, ObjectReadWriteStream } from "@pkmn/streams";
import {
	PokemonSchema,
	PokemonSchemaStats,
} from "../../databases/models/Trainer/Pokemon.ts";
import { Dex } from "@pkmn/dex";
import { filledBar } from "string-progressbar";

export type ShowdownStreams = {
	omniscient: ObjectReadWriteStream<string>;
	spectator: ObjectReadStream<string>;
	p1: ObjectReadWriteStream<string>;
	p2: ObjectReadWriteStream<string>;
	p3: ObjectReadWriteStream<string>;
	p4: ObjectReadWriteStream<string>;
};

export default class CreateBattleProcess extends BaseProcess {
	constructor() {
		super("create-battle");
	}

	override async invoke(interaction: CommandInteraction, battleType: string) {
		await interaction.deferReply();

		if (ClientCache.battles.has(interaction.user.id)) {
			// only one battle at a time.
			return;
		}

		const result = await ClientCache.getSimulator(battleType, interaction.user);

		if (!result) {
			// assuming something went wrong!
			return;
		}

		const battle = ClientCache.battles.get(interaction.user.id)!;

		const streams = battle.get("streams") as ShowdownStreams;
		const embed = new EmbedBuilder();

		embed.setTitle(`${battle.get("type")} Encounter`);
		embed.setDescription(`Select the buttons down below`);

		const playerTeam: PokemonSchema[] = battle.get("p1:team");
		const opponentTeam: PokemonSchema[] = battle.get("p2:team");

		const firstPlayerPokemon = playerTeam[0];
		const firstOpponentPokemon = opponentTeam[0];

		const playerPokemonSprite = new URL(
			`https://play.pokemonshowdown.com/sprites/ani/${firstPlayerPokemon.species!.trim().toLowerCase()
			}.gif`,
		);
		const opponentPokemonSprite = new URL(
			`https://play.pokemonshowdown.com/sprites/ani/${firstOpponentPokemon.species.trim().toLowerCase()}.gif`,
		);

		embed.setImage(playerPokemonSprite.toString());
		embed.setThumbnail(opponentPokemonSprite.toString());

		const firstPlayerSpecies = Dex.species.get(firstPlayerPokemon.species);
		const firstOpponentSpecies = Dex.species.get(firstOpponentPokemon.species);

		const firstPlayerStats: PokemonSchemaStats = await ClientCache
			.invokeProcess(
				"handle-stats",
				firstPlayerSpecies,
				firstPlayerPokemon,
			);

		const firstOpponentStats: PokemonSchemaStats = await ClientCache
			.invokeProcess(
				"handle-stats",
				firstOpponentSpecies,
				firstOpponentPokemon,
			);

		embed.addFields({
			name: `${firstPlayerSpecies.name} Level ${firstPlayerPokemon.level}`,
			value: `HP: ${filledBar(firstPlayerStats.hp, firstPlayerStats.hp, 20)[0]
				} ${firstPlayerStats.hp}/${firstOpponentStats.hp}`,
			inline: true,
		}, {
			name: `${firstOpponentSpecies.name} Level ${firstOpponentPokemon.level}`,
			value: `HP: ${filledBar(firstOpponentStats.hp, firstOpponentStats.hp, 20)[0]
				} ${firstOpponentStats.hp}/${firstOpponentStats.hp}`,
			inline: true,
		});

		const move1 = Dex.moves.get(firstPlayerPokemon.moves[0]);
		const move2 = Dex.moves.get(firstPlayerPokemon.moves[1]);
		const move3 = Dex.moves.get(firstPlayerPokemon.moves[2]);
		const move4 = Dex.moves.get(firstPlayerPokemon.moves[3]);

		const move1Button = new ButtonBuilder();
		move1Button.setCustomId("1");
		move1Button.setLabel(`${move1.name}`);
		move1Button.setStyle(ButtonStyle.Primary);

		const move2Button = new ButtonBuilder();
		move2Button.setCustomId("2");
		move2Button.setLabel(move2.exists ? move2.name : "---");
		move2Button.setDisabled(!move2.exists);
		move2Button.setStyle(ButtonStyle.Primary);

		const move3Button = new ButtonBuilder();
		move3Button.setCustomId("3");
		move3Button.setLabel(move3.exists ? move3.name : "---");
		move3Button.setDisabled(!move3.exists);
		move3Button.setStyle(ButtonStyle.Primary);

		const move4Button = new ButtonBuilder();
		move4Button.setCustomId("4");
		move4Button.setLabel(move4.exists ? move4.name : "---");
		move4Button.setDisabled(!move4.exists);
		move4Button.setStyle(ButtonStyle.Primary);

		const moveButtons = [move1Button, move2Button, move3Button, move4Button];
		battle.set("moveButtons", moveButtons);

		const switchButton = new ButtonBuilder();
		switchButton.setCustomId("switch");
		switchButton.setLabel("Switch Pokemon");
		switchButton.setStyle(ButtonStyle.Danger);
		switchButton.setDisabled(!(playerTeam.length > 1));

		const runButton = new ButtonBuilder();
		runButton.setCustomId("run");
		runButton.setLabel("Run Away");
		runButton.setStyle(ButtonStyle.Danger);

		battle.set("otherButtons", [switchButton, runButton]);

		const firstRow = new ActionRowBuilder<ButtonBuilder>();
		firstRow.addComponents(move1Button);
		firstRow.addComponents(move2Button);
		firstRow.addComponents(switchButton);

		const secondRow = new ActionRowBuilder<ButtonBuilder>();
		secondRow.addComponents(move3Button);
		secondRow.addComponents(move4Button);
		secondRow.addComponents(runButton);

		const msg = await interaction.editReply({
			embeds: [embed],
			components: [firstRow, secondRow],
		});

		battle.set("msg", msg);
		battle.set('embed', embed);

		const messageComponentCollector = await msg
			.createMessageComponentCollector({
				componentType: ComponentType.Button,
			});

		messageComponentCollector.on("end", async () => {
			await msg.edit({
				embeds: [embed],
				components: [],
			});
		});

		messageComponentCollector.on("collect", async (collected) => {
			if (collected.user.id !== interaction.user.id) return;

			await collected.deferUpdate();

			const switchSceen = await ClientCache.invokeProcess(
				"switch-scenes",
				collected.user.id,
				"switch",
			);

			switch (collected.customId) {
				case "1":
				case "2":
				case "3":
				case "4":
					streams.omniscient.write(`>p1 move ${collected.customId}`);
					break;
				case "switch":
					await msg.edit({
						embeds: [embed],
						components: [switchSceen[0], switchSceen[1]],
					});
					break;
				case "switch_1":
				case "switch_2":
				case "switch_3":
				case "switch_4":
				case "switch_5":
				case "switch_6":
					streams.omniscient.write(
						`>p1 switch ${battle.get(`p1:${collected.customId.split("_")[1]}`)
						}`,
					);
					await ClientCache.invokeProcess(
						"get-default-scene",
						collected.user.id,
					);
					break;
				case "switch_back":
					await ClientCache.invokeProcess(
						"get-default-scene",
						collected.user.id,
					);
					break;
				case "run":
					streams.omniscient.write(">forcewin p2");
					break;
			}

			for await (const chunk of streams.omniscient) {
				for (const line of chunk.split("\n")) {
					const action = line.split("|")[1];
					switch (action) {
						case "-boost":
						case "-unboost":
							await ClientCache.invokeMonitor(
								"handle-boosts",
								line,
								collected.user.id,
							);
							break;
						case "move":
							await ClientCache.invokeMonitor(
								"handle-moves",
								line,
								collected.user.id,
							);
							break;
						case "switch":
							await ClientCache.invokeMonitor(
								"handle-switch",
								line,
								collected.user.id,
							);
							break;
						case "cant":
							await ClientCache.invokeMonitor(
								"handle-cants",
								line,
								collected.user.id,
							);
							break;
						case "faint":
							await ClientCache.invokeMonitor(
								"handle-faints",
								line,
								collected.user.id,
							);
							break;
						case "-damage":
							await ClientCache.invokeMonitor(
								"handle-damage",
								line,
								collected.user.id,
							);
							break;
						case "turn":
							await ClientCache.invokeProcess(
								"update-scene",
								collected.user.id,
							);
							break;
						case "win":
							await ClientCache.invokeMonitor(
								"handle-win",
								line,
								collected.user.id,
							);
							break;
					}
				}
			}
		});
	}
}
