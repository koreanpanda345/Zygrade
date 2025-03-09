import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Collection,
  Colors,
  CommandInteraction,
  ComponentType,
  EmbedBuilder,
} from "discord.js";
import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";
import Databases from "../../databases/index.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";
import { Dex } from "@pkmn/dex";
import { BattleStreams, RandomPlayerAI } from "@pkmn/sim";
import { filledBar } from "string-progressbar";
import { PokemonClient } from "pokenode-ts";

export default class WildBattleProcess extends BaseProcess {
  didCatch: boolean = false;
  wildPokemon: PokemonSchema | null = null;
  userId: string = "";
  location: string = "";
  constructor() {
    super("wild-battle");
  }

  override async invoke(interaction: CommandInteraction) {
    await interaction.deferReply();
    this.userId = interaction.user.id;
    const streams = BattleStreams.getPlayerStreams(
      new BattleStreams.BattleStream(),
    );

    const spec = { formatId: "gen9customgame" };

    const trainer = await Databases.TrainerCollection.findOne({
      discordUserId: interaction.user.id,
    });

    const unparsedTeam = [];
    const trainerPokemon: PokemonSchema[] = [];
    for (const pokeid of trainer!.team) {
      const pokemon = await Databases.PokemonCollection.findOne({
        _id: pokeid,
      });
      trainerPokemon.push(pokemon!);
      unparsedTeam.push({
        pokemon: pokemon,
        species: Dex.species.get(pokemon!.species),
      });
    }

    const team = await ClientCache.invokeProcess("pack-team", unparsedTeam);

    const p1spec = { name: interaction.user.username, team: team };
    const wildName = await ClientCache.invokeProcess(
      "get-random-pokemon",
      trainer!.route,
    );
    const wildLevel = await ClientCache.invokeProcess(
      "get-random-level",
      trainer!.route,
      wildName,
    );

    const wildPokemon: PokemonSchema = {
      species: wildName,
      shiny: false,
      level: wildLevel,
      ivs: await ClientCache.invokeProcess("get-random-ivs"),
      moves: await ClientCache.invokeProcess(
        "get-learnable-moves",
        wildName,
        wildLevel,
      ) as string[],
      ability: Dex.species.get(wildName)
        .abilities[`${Math.floor(Math.random()) as 0 | 1}`]!,
      nature: (await ClientCache.invokeProcess("get-random-nature")).name,
    };

    this.wildPokemon = wildPokemon;
    this.location = trainer!.route;

    const wild = await ClientCache.invokeProcess("pack-team", [{
      pokemon: wildPokemon,
      species: Dex.species.get(wildName),
    }]);
    const p2spec = { name: "ZygardeBot", team: wild };

    const p2 = new RandomPlayerAI(streams.p2);
    void p2.start();

    const battle = new Collection<string, any>();

    battle.set("p1:team", trainerPokemon);
    battle.set("p2:team", [wildPokemon]);

    for (let i = 0; i < trainerPokemon.length; i++) {
      battle.set(`p1:team:${i}`, trainerPokemon[i]);
      const stats = await ClientCache.invokeProcess(
        "handle-stats",
        Dex.species.get(trainerPokemon[i].species),
        trainerPokemon[i],
      );
      console.log(stats);
      battle.set(`p1:team:${i}:level`, trainerPokemon[i].level);
      battle.set(
        `p1:team:${i}:species`,
        Dex.species.get(trainerPokemon[i].species).name,
      );
      battle.set(`p1:team:${i}:stats:hp`, stats.hp);
      battle.set(`p1:team:${i}:stats:maxhp`, stats.hp);
      battle.set(`p1:team:${i}:stats:atk`, stats.atk);
      battle.set(`p1:team:${i}:stats:def`, stats.def);
      battle.set(`p1:team:${i}:stats:spa`, stats.spa);
      battle.set(`p1:team:${i}:stats:spd`, stats.spd);
      battle.set(`p1:team:${i}:stats:spe`, stats.spe);
      battle.set(`p1:team:${i}:boosts`, {});
      battle.set(`p1:team:${i}:volatile`, []);
      battle.set(`p1:team:${i}:active`, false);
      battle.set(`p1:team:${i}:fainted`, false);

      for (const pokemonMove of trainerPokemon[i].moves) {
        const move = Dex.moves.get(pokemonMove);
        if (!move.exists) continue;
        battle.set(`p1:team:${i}:moves:${move.id}:pp`, move.pp);
        battle.set(`p1:team:${i}:moves:${move.id}:maxpp`, move.pp);
      }
    }
    battle.set(`p2:team:0`, wildPokemon);
    const wildStats = await ClientCache.invokeProcess(
      "handle-stats",
      Dex.species.get(wildPokemon.species),
      wildPokemon,
    );
    battle.set(`p2:team:0:level`, wildLevel);
    battle.set(`p2:team:0:species`, wildPokemon.species);
    battle.set(`p2:team:0:stats:hp`, wildStats.hp);
    battle.set(`p2:team:0:stats:maxhp`, wildStats.hp);
    battle.set(`p2:team:0:stats:atk`, wildStats.atk);
    battle.set(`p2:team:0:stats:def`, wildStats.def);
    battle.set(`p2:team:0:stats:spa`, wildStats.spa);
    battle.set(`p2:team:0:stats:spd`, wildStats.spd);
    battle.set(`p2:team:0:stats:spe`, wildStats.spe);
    battle.set(`p2:team:0:boosts`, {});
    battle.set(`p2:team:0:volatile`, []);
    battle.set(`p2:team:0:active`, false);
    battle.set(`p2:team:0:fainted`, false);

    battle.set(`p1:current`, 0);
    battle.set(`p2:current`, 0);

    battle.set("streams", streams);
    battle.set("p1", p1spec);
    battle.set("p2", p2spec);
    battle.set("wild", wildPokemon);
    battle.set("trainer", trainer!);
    battle.set("trainerPokemon", trainerPokemon);
    battle.set("wildLevel", wildLevel);
    battle.set("wildName", wildName);

    void streams.omniscient.write(
      `>start ${JSON.stringify(spec)}\n>player p1 ${
        JSON.stringify(p1spec)
      }\n>player p2 ${JSON.stringify(p2spec)}`,
    );

    ClientCache.battles.set(interaction.user.id, battle);

    const embed = new EmbedBuilder();
    embed.setTitle("Wild Battle");
    embed.setDescription(`A wild ${Dex.species.get(wildName).name} appeared!`);
    embed.setColor("Green");
    embed.setThumbnail(
      `https://play.pokemonshowdown.com/sprites/xyani/${wildName.toLowerCase()}.gif`,
    );
    embed.setImage(
      `https://play.pokemonshowdown.com/sprites/xyani/${
        trainerPokemon[0].species.toLowerCase()
      }.gif`,
    );
    embed.setFooter({ text: "Select a move to battle!" });

    const [p1HpBar, p1HpPercent] = filledBar(
      battle.get(`p1:team:0:stats:maxhp`) as number,
      battle.get(`p1:team:0:stats:hp`) as number,
      20,
    );
    const [p2HpBar, p2HpPercent] = filledBar(
      battle.get(`p2:team:0:stats:maxhp`) as number,
      battle.get(`p2:team:0:stats:hp`) as number,
      20,
    );
    embed.addFields(
      {
        name: `Level ${trainerPokemon[0].level} ${
          Dex.species.get(trainerPokemon[0].species).name
        }`,
        value: `HP: ${p1HpBar} (${
          Math.floor(Math.round(Number(p1HpPercent)))
        }%) [${battle.get(`p1:team:0:stats:hp`)}/${
          battle.get(`p2:team:0:stats:maxhp`)
        }]`,
        inline: true,
      },
      { name: "\u200b", value: `\u200b`, inline: true },
      {
        name: `Level ${wildLevel} ${Dex.species.get(wildName).name}`,
        value: `HP: ${p2HpBar} (${
          Math.floor(Math.round(Number(p2HpPercent)))
        }%)`,
        inline: true,
      },
    );

    const p1StatsBoost = () => {
      const str: string[] = [];
      const boost = battle.get(`p1:team:0:boosts`);
      if (boost.atk !== undefined) str.push(`${boost.atk} ATK`);
      if (boost.def !== undefined) str.push(`${boost.def} DEF`);
      if (boost.spa !== undefined) str.push(`${boost.spa} SPA`);
      if (boost.spd !== undefined) str.push(`${boost.spd} SPD`);
      if (boost.spe !== undefined) str.push(`${boost.spe} SPE`);
      return str.join(" | ");
    };
    const p2StatsBoost = () => {
      const str: string[] = [];
      const boost = battle.get(`p2:team:0:boosts`);
      if (boost.atk !== undefined) str.push(`${boost.atk} ATK`);
      if (boost.def !== undefined) str.push(`${boost.def} DEF`);
      if (boost.spa !== undefined) str.push(`${boost.spa} SPA`);
      if (boost.spd !== undefined) str.push(`${boost.spd} SPD`);
      if (boost.spe !== undefined) str.push(`${boost.spe} SPE`);
      return str.join(" | ");
    };

    embed.addFields(
      { name: `Stat Boost`, value: `${p1StatsBoost()}`, inline: true },
      { name: `\u200b`, value: "\u200b", inline: true },
      { name: `Stat Boost`, value: `${p2StatsBoost()}`, inline: true },
    );

    let moveButtons: ButtonBuilder[] = [];
    for (const pokemonMove of trainerPokemon[0].moves) {
      const move = Dex.moves.get(pokemonMove);
      if (!move.exists) continue;
      const button = new ButtonBuilder();
      button.setCustomId(`move-${move.id}`);
      button.setLabel(
        move.exists
          ? `${move.name} [PP: ${battle.get(`p1:team:0:moves:${move.id}:pp`)}/${
            battle.get(`p1:team:0:moves:${move.id}:maxpp`)
          }]`
          : "---",
      );
      button.setDisabled(!move.exists);
      button.setStyle(ButtonStyle.Primary);
      moveButtons.push(button);
    }

    const optionsButtons: ButtonBuilder[] = [];

    const runButton = new ButtonBuilder();
    runButton.setCustomId("run");
    runButton.setLabel("Run Away");
    runButton.setStyle(ButtonStyle.Danger);

    let switchButtons: ButtonBuilder[] = [];
    let switchButtons2: ButtonBuilder[] = [];
    let pokemonAmount = 0;
    for (let i = 0; i < trainerPokemon.length; i++) {
      const dex = Dex.species.get(trainerPokemon[i].species);

      if (!dex.exists) continue;
      pokemonAmount += 1;
      const button = new ButtonBuilder();
      button.setCustomId(`switch-${i}`);
      button.setLabel(`${dex.name}`);
      button.setStyle(ButtonStyle.Secondary);
      button.setDisabled(
        battle.get(`p1:team:${i}:fainted`) || i == battle.get(`p1:current`),
      );
      if (pokemonAmount >= 4) switchButtons2.push(button);
      else switchButtons.push(button);
    }

    optionsButtons.push(runButton);

    const moveRow = new ActionRowBuilder<ButtonBuilder>();
    const switchRow = new ActionRowBuilder<ButtonBuilder>();
    const switchRow2 = new ActionRowBuilder<ButtonBuilder>();
    const optionsRow = new ActionRowBuilder<ButtonBuilder>();

    moveRow.addComponents(moveButtons);
    switchRow.addComponents(switchButtons);
    switchRow2.addComponents(switchButtons2);
    optionsRow.addComponents(optionsButtons);
    if (pokemonAmount > 3) {
      await interaction.editReply({
        embeds: [embed],
        components: [moveRow, switchRow, switchRow2, optionsRow],
      });
    } else {await interaction.editReply({
        embeds: [embed],
        components: [moveRow, switchRow, optionsRow],
      });}

    console.log(battle);

    for await (const chunk of streams.omniscient) {
      console.log(chunk);
      for (const line of chunk.split("\n")) {
        const sections = line.split("|");

        if (sections[1] === "win") {
          const winEmbed = new EmbedBuilder();

          if (sections[2] !== interaction.user.username) {
            winEmbed.setTitle(
              `You failed to beat Level ${battle.get(`p2:team:0:level`)} ${
                battle.get(`p2:team:0:species`)
              }`,
            );
            winEmbed.setImage(
              `https://play.pokemonshowdown.com/sprites/xyani/${
                battle.get(`p2:team:0:species`).toLowerCase()
              }.gif`,
            );
            winEmbed.setColor("Red");

            await interaction.editReply({
              content: "Battle Done",
              embeds: [winEmbed],
              components: [],
            });

            ClientCache.battles.delete(interaction.user.id);
            return;
          }

          winEmbed.setTitle(
            `You beat Level ${battle.get(`p2:team:0:level`)} ${
              battle.get(`p2:team:0:species`)
            }!`,
          );
          winEmbed.setImage(
            `https://play.pokemonshowdown.com/sprites/xyani/${
              battle.get(`p2:team:0:species`).toLowerCase()
            }.gif`,
          );
          winEmbed.setColor("Green");

          const catchButton = new ButtonBuilder().setCustomId("catch").setLabel(
            "Catch Pokemon",
          ).setStyle(ButtonStyle.Success);
          const leaveButton = new ButtonBuilder().setCustomId("leave").setLabel(
            "Leave Pokemon",
          ).setStyle(ButtonStyle.Danger);

          const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            catchButton,
            leaveButton,
          );

          const wildData = await new PokemonClient().getPokemonByName(
            wildPokemon.species,
          );
          // TODO: When adding in items, edit the equation to include Lucky Egg into exp equation
          const egg = 1;
          const favor = 1; // This is something to do with Gen VI where you can increase their affection which yields more experience.
          const level = wildPokemon.level;
          const levelPlayer = Number(battle.get(`p1:team:0:level`));
          const ppower = 1; // This has to do with Roto Powers in Gen VI
          // TODO: Once we get everything working, I need to adjust this equation to allow Exp. Share.
          const share = 1; // This has to do with Exp. Share
          const originalTrainer = 1; // This has to deal with the owner of the pokemon. for now this will remain one till trading becomes a thing.
          const isPastEvolutionAmount = 1; // This has to deal with if the level is past the level in which would cause the pokemon to evolve.

          const gainedExp = await ClientCache.invokeProcess(
            "handle-gain-exp",
            wildData.base_experience,
            egg,
            favor,
            level,
            levelPlayer,
            ppower,
            share,
            originalTrainer,
            isPastEvolutionAmount,
          );

          await ClientCache.invokeProcess(
            "handle-levels-and-exp",
            battle.get(`p1:team:0`),
            gainedExp,
          );
          const msg = await interaction.editReply({
            content: "Battle Done",
            embeds: [winEmbed],
            components: [row],
          });
          const mc = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
          });

          mc.on("collect", async (i) => {
            await i.deferUpdate();
            if (i.customId == "leave") {
              const leaveEmbed = new EmbedBuilder();

              leaveEmbed.setTitle("Wild Encounter: Success | Did not catch!");
              leaveEmbed.setDescription(
                `You decided to leave the wild ${
                  Dex.species.get(wildPokemon.species!).name
                } alone!`,
              );
              leaveEmbed.setColor(Colors.Yellow);
              leaveEmbed.setThumbnail(
                `https://play.pokemonshowdown.com/sprites/ani/${
                  Dex.species.get(wildPokemon.species!).id
                }.gif`,
              );

              await msg.edit({
                embeds: [leaveEmbed],
                components: [],
              });

              mc.stop();
            }

            if (i.customId === "catch") {
              const neededExp = await ClientCache.invokeProcess(
                "handle-growth-rate",
                (await new PokemonClient().getPokemonSpeciesByName(
                  wildPokemon.species,
                )).growth_rate.name,
                wildPokemon.level,
              );

              const pokemon: PokemonSchema = {
                discordUserId: interaction.user.id,
                species: wildPokemon.species,
                level: wildPokemon.level,
                exp: 0,
                neededExp,
                ivs: wildPokemon.ivs,
                evs: wildPokemon.evs ||
                  { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
                nature: wildPokemon.nature,
                moves: wildPokemon.moves,
                shiny: wildPokemon.shiny,
                ability: wildPokemon.ability,
              };

              await ClientCache.invokeProcess("add-pokemon", pokemon);

              const catchEmbed = new EmbedBuilder();

              catchEmbed.setTitle(
                `Successfully Caught a Level ${pokemon.level} ${
                  Dex.species.get(wildPokemon.species!).name
                }!`,
              );
              catchEmbed.setDescription(
                "You can look them up using the `/info` command",
              );

              embed.setThumbnail(
                `https://play.pokemonshowdown.com/sprites/xyani/${wildPokemon.species.toLowerCase()}.gif`,
              );

              await msg.edit({
                embeds: [catchEmbed],
                components: [],
              });

              this.didCatch = true;
              await this.processQuests();
              mc.stop();
            }
          });

          mc.on("end", () => {
            ClientCache.battles.delete(interaction.user.id);
          });

          return;
        }

        if (sections[1] === "turn") {
          battle.set(`turn`, Number(sections[2]));

          embed.setImage(
            `https://play.pokemonshowdown.com/sprites/xyani/${
              battle.get(`p1:team:${battle.get(`p1:current`)}:species`)
                .toLowerCase()
            }.gif`,
          );
          moveButtons = [];
          for (
            const pokemonMove of trainerPokemon[battle.get("p1:current")].moves
          ) {
            const move = Dex.moves.get(pokemonMove);
            if (!move.exists) continue;
            const button = new ButtonBuilder();
            button.setCustomId(`move-${move.id}`);
            button.setLabel(
              move.exists
                ? `${move.name} [PP: ${
                  battle.get(
                    `p1:team:${battle.get(`p1:current`)}:moves:${move.id}:pp`,
                  )
                }/${
                  battle.get(
                    `p1:team:${
                      battle.get(`p1:current`)
                    }:moves:${move.id}:maxpp`,
                  )
                }]`
                : "---",
            );
            button.setDisabled(!move.exists);
            button.setStyle(ButtonStyle.Primary);
            moveButtons.push(button);
          }

          moveRow.setComponents(moveButtons);

          switchButtons = [];
          switchButtons2 = [];
          pokemonAmount = 0;
          for (let i = 0; i < trainerPokemon.length; i++) {
            const dex = Dex.species.get(trainerPokemon[i].species);
            const current = battle.get("p1:current");

            if (!dex.exists) continue;
            pokemonAmount += 1;
            console.log(trainerPokemon[i].species, i);
            const button = new ButtonBuilder();
            button.setCustomId(i === current ? `switch-0` : `switch-${i}`);

            button.setLabel(`${dex.name}`);
            button.setStyle(
              battle.get(`p1:team:${i}:fainted`)
                ? ButtonStyle.Danger
                : ButtonStyle.Secondary,
            );
            button.setDisabled(
              battle.get(`p1:team:${i}:fainted`) || i == current,
            );
            if (pokemonAmount >= 4) switchButtons2.push(button);
            else switchButtons.push(button);
          }

          switchRow.setComponents(switchButtons);
          switchRow2.setComponents(switchButtons2);

          if (pokemonAmount > 3) {
            await interaction.editReply({
              embeds: [embed],
              components: [moveRow, switchRow, switchRow2, optionsRow],
            });
          } else {await interaction.editReply({
              embeds: [embed],
              components: [moveRow, switchRow, optionsRow],
            });}
        }

        if (sections[1] === "move") {
          // Handle the moves being used
          const side = sections[2].split(":")[0].split("a")[0];
          const current = battle.get(`${side}:current`);
          const path = `${side}:team:${current}`;
          const turn = battle.get(`turn`);

          const move = Dex.moves.get(sections[3]);

          const oldpp = battle.get(`${path}:moves:${move.id}:pp`);
          battle.set(`${path}:moves:${move.id}:pp`, oldpp - 1);

          battle.set(`${path}:turn:${turn}:used`, move.name);

          moveButtons = [];
          for (const pokemonMove of trainerPokemon[0].moves) {
            const move = Dex.moves.get(pokemonMove);
            if (!move.exists) continue;
            const button = new ButtonBuilder();
            button.setCustomId(`move-${move.id}`);
            button.setLabel(
              move.exists
                ? `${move.name} [PP: ${
                  battle.get(`p1:team:0:moves:${move.id}:pp`)
                }/${battle.get(`p1:team:0:moves:${move.id}:maxpp`)}]`
                : "---",
            );
            button.setDisabled(!move.exists);
            button.setStyle(ButtonStyle.Primary);
            moveButtons.push(button);
          }

          moveRow.setComponents(moveButtons);
        }

        if (sections[1] === "-damage") {
          const side = sections[2].split(":")[0].split("a")[0];
          const current = battle.get(`${side}:current`);
          const path = `${side}:team:${current}`;

          const [hp, maxhp] = sections[3].split("/");

          battle.set(`${path}:stats:hp`, Number(hp));
          battle.set(`${path}:stats:maxhp`, Number(maxhp));
        }

        if (sections[1] === "-boost") {
          const side = sections[2].split(":")[0].split("a")[0];
          const current = battle.get(`${side}:current`);
          const stat = sections[3];
          const amount = sections[4];
          const boosts = battle.get(`${side}:team:${current}:boosts`);
          if (boosts[stat]) boosts[stat] += Number(amount);
          else boosts[stat] = Number(amount);
          battle.set(`${side}:team:${current}:boosts`, boosts);
        } else if (sections[1] === "-unboost") {
          const side = sections[2].split(":")[0].split("a")[0];
          const current = battle.get(`${side}:current`);
          const stat = sections[3];
          const amount = sections[4];
          const boosts = battle.get(`${side}:team:${current}:boosts`);
          if (boosts[stat]) boosts[stat] -= Number(amount);
          else boosts[stat] = -Number(amount);
          battle.set(`${side}:team:${current}:boosts`, boosts);
        }

        const p1Path = `p1:team:${battle.get(`p1:current`)}`;
        const p2Path = `p2:team:${battle.get(`p2:current`)}`;
        const turn = battle.get("turn");
        if (
          battle.get(`${p1Path}:turn:${turn}:used`) &&
          battle.get(`${p2Path}:turn:${turn}:used`)
        ) {
          embed.setDescription(
            `${battle.get(`${p1Path}:species`)} used ${
              battle.get(`${p1Path}:turn:${turn}:used`)
            }\n${battle.get(`${p2Path}:species`)} used ${
              battle.get(`${p2Path}:turn:${turn}:used`)
            }`,
          );
        }

        if (Number.isNaN(battle.get(`${p1Path}:stats:hp`))) continue;
        if (Number.isNaN(battle.get(`${p2Path}:stats:hp`))) continue;

        const [p1HpBar, p1HpPercent] = filledBar(
          battle.get(`${p1Path}:stats:maxhp`) as number,
          battle.get(`${p1Path}:stats:hp`) as number,
          20,
        );
        const [p2HpBar, p2HpPercent] = filledBar(
          battle.get(`${p2Path}:stats:maxhp`) as number,
          battle.get(`${p2Path}:stats:hp`) as number,
          20,
        );
        const p1StatsBoost = () => {
          const str: string[] = [];
          const boost = battle.get(`${p1Path}:boosts`);
          if (boost.atk !== undefined) str.push(`${boost.atk} ATK`);
          if (boost.def !== undefined) str.push(`${boost.def} DEF`);
          if (boost.spa !== undefined) str.push(`${boost.spa} SPA`);
          if (boost.spd !== undefined) str.push(`${boost.spd} SPD`);
          if (boost.spe !== undefined) str.push(`${boost.spe} SPE`);
          return str.join(" | ");
        };
        const p2StatsBoost = () => {
          const str: string[] = [];
          const boost = battle.get(`${p2Path}:boosts`);
          if (boost.atk !== undefined) str.push(`${boost.atk} ATK`);
          if (boost.def !== undefined) str.push(`${boost.def} DEF`);
          if (boost.spa !== undefined) str.push(`${boost.spa} SPA`);
          if (boost.spd !== undefined) str.push(`${boost.spd} SPD`);
          if (boost.spe !== undefined) str.push(`${boost.spe} SPE`);
          if (boost.accuracy !== undefined) str.push(`${boost.accuracy} ACC`);
          return str.join(" | ");
        };
        embed.setFields(
          {
            name: `Level ${battle.get(`${p1Path}:level`)} ${
              battle.get(`${p1Path}:species`)
            }`,
            value: `HP: ${p1HpBar} (${
              Math.floor(Math.round(Number(p1HpPercent)))
            }%) [${battle.get(`${p1Path}:stats:hp`)}/${
              battle.get(`${p1Path}:stats:maxhp`)
            }]`,
            inline: true,
          },
          { name: "\u200b", value: "\u200b", inline: true },
          {
            name: `Level ${battle.get(`${p2Path}:level`)} ${
              battle.get(`${p2Path}:species`)
            }`,
            value: `HP: ${p2HpBar} (${
              Math.floor(Math.round(Number(p2HpPercent)))
            }%)`,
            inline: true,
          },
          { name: `Stat Boost`, value: `${p1StatsBoost()}`, inline: true },
          { name: `\u200b`, value: "\u200b", inline: true },
          { name: `Stat Boost`, value: `${p2StatsBoost()}`, inline: true },
        );
      }
    }
  }

  override async processQuests() {
    await ClientCache.handleQuests(
      "catch",
      this.userId,
      this.didCatch,
      this.wildPokemon,
      this.location,
    );
  }
}
