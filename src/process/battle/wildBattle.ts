import {
  ActionRowBuilder,
  APIEmbedField,
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
import { TrainerSchema } from "../../databases/models/Trainer/Trainer.ts";

export default class WildBattleProcess extends BaseProcess {
  battle: Collection<string, any> = new Collection();
  didCatch: boolean = false;
  didWin: boolean = false;
  wildPokemon: PokemonSchema | null = null;
  userId: string = "";
  location: string = "";
  interaction: CommandInteraction | null = null;
  constructor() {
    super("wild-battle");
  }

  override async invoke(
    interaction: CommandInteraction,
    encounterPokemon: string = "",
    encounteredLevel: number = 0,
  ) {
    this.interaction = interaction;
    // Already deferred the reply.
    // await interaction.deferReply();

    this.userId = interaction.user.id;

    const streams = BattleStreams.getPlayerStreams(
      new BattleStreams.BattleStream(),
    );

    const spec = {
      formatId: "gen9customgame",
    };

    const trainer = await ClientCache.invokeProcess(
      "get-trainer",
      this.userId,
    ) as TrainerSchema;

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

    const wildName = encounterPokemon !== ""
      ? encounterPokemon
      : await ClientCache.invokeProcess(
        "get-random-pokemon",
        trainer!.route,
        interaction.user.id,
      );
    const wildLevel = encounteredLevel !== 0
      ? encounteredLevel
      : await ClientCache.invokeProcess(
        "get-random-level",
        trainer!.route,
        wildName,
        interaction.user.id,
      );

    const wildPokemon = await ClientCache.invokeProcess(
      "generate-wild-pokemon",
      wildName,
      wildLevel,
    );

    this.wildPokemon = wildPokemon;
    this.location = trainer!.route;

    const wild = await ClientCache.invokeProcess("pack-team", [{
      pokemon: wildPokemon,
      species: Dex.species.get(wildName),
    }]);

    const p2spec = { name: `Wild ${wildName}`, team: wild };
    const p2 = new RandomPlayerAI(streams.p2);
    void p2.start();

    const battle = new Collection<string, any>();
    battle.set("type", "wild");

    battle.set("p1:team", trainerPokemon);
    battle.set("p2:team", [wildPokemon]);
    const wildPokemonList = [wildPokemon];

    for (let i = 0; i < trainerPokemon.length; i++) {
      const pokemon = trainerPokemon[i];
      battle.set(`p1:team:${i}`, pokemon);
      const stats = await ClientCache.invokeProcess(
        "handle-stats",
        Dex.species.get(pokemon.species),
        pokemon,
      );
      battle.set(`p1:team:${i}:level`, pokemon.level);
      battle.set(`p1:team:${i}:species`, Dex.species.get(pokemon.species).name);
      battle.set(`p1:team:index:${pokemon.species}`, i);
      battle.set(`p1:team:${i}:stats:hp`, stats.hp);
      battle.set(`p1:team:${i}:stats:maxhp`, stats.hp);
      battle.set(`p1:team:${i}:stats:atk`, stats.atk);
      battle.set(`p1:team:${i}:stats:def`, stats.def);
      battle.set(`p1:team:${i}:stats:spa`, stats.spa);
      battle.set(`p1:team:${i}:stats:spd`, stats.spd);
      battle.set(`p1:team:${i}:stats:spe`, stats.spe);
      battle.set(`p1:team:${i}:boosts`, {});
      battle.set(`p1:team:${i}:volatile`, []);
      battle.set(`p1:team:${i}:fainted`, false);
      battle.set(`p1:team:${i}:moves`, pokemon.moves);
      for (const pokemonMove of pokemon.moves) {
        const move = Dex.moves.get(pokemonMove);
        if (!move.exists) continue;
        battle.set(`p1:team:${i}:moves:${move.id}:pp`, move.pp);
        battle.set(`p1:team:${i}:moves:${move.id}:maxpp`, move.pp);
      }
    }

    for (let i = 0; i < wildPokemonList.length; i++) {
      battle.set(`p2:team:${i}`, wild[i]);
      const stats = await ClientCache.invokeProcess(
        "handle-stats",
        Dex.species.get(wildPokemonList[i].species),
        wildPokemonList[i],
      );
      battle.set(`p2:team:${i}:level`, wildPokemonList[i].level);
      battle.set(
        `p2:team:${i}:species`,
        Dex.species.get(wildPokemonList[i].species).name,
      );
      battle.set(`p2:team:index:${wildPokemonList[i].species}`, i);
      battle.set(`p2:team:${i}:stats:hp`, stats.hp);
      battle.set(`p2:team:${i}:stats:maxhp`, stats.hp);
      battle.set(`p2:team:${i}:stats:atk`, stats.atk);
      battle.set(`p2:team:${i}:stats:def`, stats.def);
      battle.set(`p2:team:${i}:stats:spa`, stats.spa);
      battle.set(`p2:team:${i}:stats:spd`, stats.spd);
      battle.set(`p2:team:${i}:stats:spe`, stats.spe);
      battle.set(`p2:team:${i}:boosts`, {});
      battle.set(`p2:team:${i}:volatile`, []);
      battle.set(`p2:team:${i}:fainted`, false);
    }

    battle.set(`p1:current`, 0);
    battle.set(`p2:current`, 0);

    battle.set("streams", streams);
    battle.set("p1", p1spec);
    battle.set("p2", p2spec);
    battle.set("trainer", trainer!);
    battle.set("wildPokemon", wildPokemon);
    battle.set("trainerPokemon", trainerPokemon);

    void streams.omniscient.write(
      `>start ${JSON.stringify(spec)}\n>player p1 ${
        JSON.stringify(p1spec)
      }\n>player p2 ${JSON.stringify(p2spec)}`,
    );

    ClientCache.battles.set(interaction.user.id, battle);

    let embed = new EmbedBuilder();
    let buttons = new Collection<string, ButtonBuilder[]>();
    let rows = new Collection<string, ActionRowBuilder<ButtonBuilder>>();

    const updated = await ClientCache.invokeProcess(
      "generate-battle-scene",
      embed,
      buttons,
      rows,
      this.userId,
    );

    embed = updated.embed;
    buttons = updated.buttons;
    rows = updated.rows;

    if (rows.get("switch_2")!.components.length !== 0) {
      await interaction.editReply({
        embeds: [embed],
        components: [
          rows.get("moves")!,
          rows.get("switch_1")!,
          rows.get("switch_2")!,
          rows.get("options")!,
        ],
      });
    } else {
      await interaction.editReply({
        embeds: [embed],
        components: [
          rows.get("moves")!,
          rows.get("switch_1")!,
          rows.get("options")!,
        ],
      });
    }

    for await (const chunk of streams.omniscient) {
      this.logger.debug(chunk);
      for (const line of chunk.split("\n")) {

        const result = await ClientCache.invokeProcess('handle-battle', line, interaction, this.userId, embed, buttons, rows);

        if (!result) continue;

        const sections = line.split("|");
        this.didWin = sections[2] === interaction.user.username;
        this.battle = battle;
        this.handleCatching();

        ClientCache.battles.delete(interaction.user.id);
       
      }
    }
  }

  async handleCatching() {
    const embed = new EmbedBuilder();

    if (!this.didWin) {
      embed.setTitle(
        `You failed to beat Level ${this.wildPokemon?.level} ${this.wildPokemon?.species}`,
      );
      embed.setDescription("Good Luck next time!");
      embed.setColor("Red");

      await this.interaction?.editReply({
        content: "Battle Done",
        embeds: [embed],
        components: [],
      });

      ClientCache.battles.delete(this.userId);
      return;
    }

    embed.setTitle(
      `You beat Level ${this.wildPokemon?.level} ${this.wildPokemon?.species}!`,
    );
    embed.setDescription(`Would you like to catch it?`);
    embed.setFooter({ text: "Please pick an option down below!" });
    embed.setColor("Green");

    await ClientCache.invokeProcess(
      "handle-battl-exp",
      this.battle.get("p1:team"),
      this.battle.get("p2:team:0"),
      this.interaction,
    );

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

    const msg = await this.interaction?.editReply({
      content: "Battle Done",
      embeds: [embed],
      components: [row],
    });

    const mc = msg?.createMessageComponentCollector({
      componentType: ComponentType.Button,
    });

    mc!.on("collect", async (i) => {
      await i.deferUpdate();
      await i.editReply({ embeds: [embed], components: [] });

      if (i.customId == "leave") {
        const leaveEmbed = new EmbedBuilder();

        leaveEmbed.setTitle("Wild Encounter: Success | Did not catch!");
        leaveEmbed.setDescription(
          `You decided to leave the wild ${
            Dex.species.get(this.wildPokemon!.species!).name
          } alone!`,
        );
        leaveEmbed.setColor(Colors.Yellow);
        leaveEmbed.setThumbnail(
          `https://play.pokemonshowdown.com/sprites/ani/${
            Dex.species.get(this.wildPokemon!.species!).id
          }.gif`,
        );

        await msg!.edit({
          embeds: [leaveEmbed],
          components: [],
        });

        mc!.stop();
      }

      if (i.customId === "catch") {
        const neededExp = await ClientCache.invokeProcess(
          "handle-growth-rate",
          (await new PokemonClient().getPokemonSpeciesByName(
            this.wildPokemon!.species,
          )).growth_rate.name,
          this.wildPokemon!.level,
        );

        this.wildPokemon!.discordUserId = this.userId;
        this.wildPokemon!.exp = 0;
        this.wildPokemon!.neededExp = neededExp;
        this.wildPokemon!.evs = {
          hp: 0,
          atk: 0,
          def: 0,
          spa: 0,
          spd: 0,
          spe: 0,
        };

        await ClientCache.invokeProcess("add-pokemon", this.wildPokemon);

        embed.setTitle(
          `Successfully Caught a Level ${this.wildPokemon!.level} ${
            Dex.species.get(this.wildPokemon!.species!).name
          }!`,
        );
        embed.setDescription(
          "You can look them up using the `/info` command",
        );

        embed.setThumbnail(
          `https://play.pokemonshowdown.com/sprites/xyani/${
            this.wildPokemon!.species.toLowerCase()
          }.gif`,
        );

        await msg!.edit({
          embeds: [embed],
          components: [],
        });

        this.didCatch = true;
        this.processQuests();
        mc!.stop();
      }
    });

    mc!.on("end", () => {
      ClientCache.battles.delete(this.userId);
    });
  }

  override async processQuests() {
    await ClientCache.handleQuests(
      "catch",
      this.userId,
      this.didCatch,
      this.wildPokemon,
      this.location,
      this.interaction,
    );
  }
}
