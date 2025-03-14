import {
  ActionRowBuilder,
  APIEmbedField,
  ButtonBuilder,
  ButtonStyle,
  Collection,
  CommandInteraction,
  EmbedBuilder,
  RestOrArray,
} from "discord.js";
import BaseProcess from "../../base/BaseProcess.ts";
import { BattleStreams, RandomPlayerAI } from "@pkmn/sim";
import Databases from "../../databases/index.ts";
import ClientCache from "../../core/cache.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";
import { TrainerSchema } from "../../databases/models/Trainer/Trainer.ts";
import { RouteSchemaTrainers } from "../../databases/models/Game/Route.ts";
import { Dex, Species } from "@pkmn/dex";
import { filledBar } from "string-progressbar";

export default class NPCBattleProcess extends BaseProcess {
  didWin: boolean = false;
  userId: string = "";
  npc: RouteSchemaTrainers | null = null;
  location: string = "";
  interaction: CommandInteraction | null = null;

  constructor() {
    super("npc-battle");
  }

  override async invoke(interaction: CommandInteraction) {
    this.interaction = interaction;

    // await interaction.deferReply();

    this.userId = interaction.user.id;

    const streams = BattleStreams.getPlayerStreams(
      new BattleStreams.BattleStream(),
    );

    const spec = { formatId: "gen9customgame" };

    const trainer = await ClientCache.invokeProcess(
      "get-trainer",
      interaction.user.id,
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

    this.location = trainer.route;
    const team = await ClientCache.invokeProcess("pack-team", unparsedTeam);

    const p1spec = { name: interaction.user.username, team: team };
    const npc = await ClientCache.invokeProcess(
      "get-random-npc",
      trainer.route,
    ) as RouteSchemaTrainers;
    const opponentTrainerTeam: PokemonSchema[] = [];
    const opponentUnparsedTeam: { pokemon: PokemonSchema; species: Species }[] =
      [];

    for (const poke of npc.team) {
      const schema = {
        species: poke.species,
        shiny: false,
        level: poke.level,
        ability: poke.ability || Dex.species.get(poke.species).abilities[0],
        moves: (
          (await ClientCache
            .invokeProcess(
              "get-random-moves",
              poke.species,
              poke.level,
            )) as string[]
        )
          .reverse()
          .splice(0, 4),
        nature: await ClientCache.invokeProcess("get-random-nature"),
        ivs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
        evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      };
      opponentUnparsedTeam.push({
        pokemon: schema,
        species: Dex.species.get(poke.species),
      });

      opponentTrainerTeam.push(schema);
    }

    const opponentTeam = await ClientCache.invokeProcess(
      "pack-team",
      opponentUnparsedTeam,
    );

    const p2spec = { name: npc.name, team: opponentTeam };

    const p2 = new RandomPlayerAI(streams.p2);
    void p2.start();

    const battle = new Collection<string, any>();

    battle.set("type", "npc");

    battle.set("p1:team", trainerPokemon);
    battle.set("p2:team", opponentTrainerTeam);

    for (let i = 0; i < trainerPokemon.length; i++) {
      battle.set(`p1:team:${i}`, trainerPokemon[i]);
      const stats = await ClientCache.invokeProcess(
        "handle-stats",
        Dex.species.get(trainerPokemon[i].species),
        trainerPokemon[i],
      );
      battle.set(`p1:team:${i}:level`, trainerPokemon[i].level);
      battle.set(
        `p1:team:${i}:species`,
        Dex.species.get(trainerPokemon[i].species).name,
      );
      battle.set(`p1:team:index:${trainerPokemon[i].species}`, i);
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
      battle.set(`p1:team:${i}:moves`, trainerPokemon[i].moves);
      for (const pokemonMove of trainerPokemon[i].moves) {
        const move = Dex.moves.get(pokemonMove);
        if (!move.exists) continue;
        battle.set(`p1:team:${i}:moves:${move.id}:pp`, move.pp);
        battle.set(`p1:team:${i}:moves:${move.id}:maxpp`, move.pp);
      }
    }

    for (let i = 0; i < opponentTrainerTeam.length; i++) {
      battle.set(`p2:team:${i}`, opponentTrainerTeam[i]);
      const stats = await ClientCache.invokeProcess(
        "handle-stats",
        Dex.species.get(opponentTrainerTeam[i].species),
        opponentTrainerTeam[i],
      );
      battle.set(`p2:team:${i}:level`, opponentTrainerTeam[i].level);
      battle.set(
        `p2:team:${i}:species`,
        Dex.species.get(opponentTrainerTeam[i].species).name,
      );
      battle.set(`p2:team:index:${opponentTrainerTeam[i].species}`, i);
      battle.set(`p2:team:${i}:stats:hp`, stats.hp);
      battle.set(`p2:team:${i}:stats:maxhp`, stats.hp);
      battle.set(`p2:team:${i}:stats:atk`, stats.atk);
      battle.set(`p2:team:${i}:stats:def`, stats.def);
      battle.set(`p2:team:${i}:stats:spa`, stats.spa);
      battle.set(`p2:team:${i}:stats:spd`, stats.spd);
      battle.set(`p2:team:${i}:stats:spe`, stats.spe);
      battle.set(`p2:team:${i}:boosts`, {});
      battle.set(`p2:team:${i}:volatile`, []);
      battle.set(`p2:team:${i}:active`, false);
      battle.set(`p2:team:${i}:fainted`, false);
    }

    battle.set("p1:current", 0);
    battle.set("p2:current", 0);

    battle.set("streams", streams);
    battle.set("p1", p1spec);
    battle.set("p2", p2spec);
    battle.set("npc", npc);
    this.npc = npc;
    battle.set("trainer", trainer!);
    battle.set("npcPokemon", opponentTrainerTeam);
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

    let updated = await ClientCache.invokeProcess(
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
        const sections = line.split("|");

        if (sections[1] === "turn" || sections[1] === "upkeep") {
          if (sections[1] === "turn") battle.set(`turn`, Number(sections[2]));
          updated = await ClientCache.invokeProcess(
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
        } else if (sections[1] === "win") {
          this.didWin = sections[2] === interaction.user.username;
          const winEmbed = new EmbedBuilder();

          winEmbed.setTitle("Success");
          winEmbed.setDescription(`Did Win: ${this.didWin}`);

          await interaction.editReply({
            content: "Battle Done",
            embeds: [winEmbed],
            components: [],
          });

          this.processQuests();

          ClientCache.battles.delete(interaction.user.id);
          return;
        } else if (sections.length > 2) {
          const side = sections[2].split(":")[0].split("a")[0];
          const current = battle.get(`${side}:current`);
          const path = `${side}:team:${current}`;
          if (sections[1] === "move") {
            const turn = battle.get("turn");

            const move = Dex.moves.get(sections[3]);

            const oldpp = battle.get(`${path}:moves:${move.id}:pp`);
            battle.set(`${path}:moves:${move.id}:pp`, oldpp - 1);
            battle.set(`${path}:turn:${turn}:action`, move.name);
          } else if (sections[1] === "-damage") {
            const hp = sections[3].split("/")[0];
            battle.set(`${path}:stats:hp`, Number(hp));
          } else if (sections[1] === "-status") {
            const lookForVolatiles = [
              "psn",
              "par",
              "frz",
              "fzn",
              "tox",
              "brn",
              "slp",
            ];
            if (!lookForVolatiles.includes(sections[3])) continue;
            battle.get(`${path}:volatile`).push(sections[3]);
          } else if (sections[1] === "-start") {
            // Some This is for Volatiles
            const lookForVolatiles = ["confusion"];
            if (!lookForVolatiles.includes(sections[3])) continue;
            battle.get(`${path}:volatile`).push(sections[3]);
          } else if (sections[1] === "-end") {
            const lookForVolatiles = ["confusion"];
            if (!lookForVolatiles.includes(sections[3])) continue;
            const list = battle.get(`${path}:volatile`) as string[];
            battle.set(
              `${path}:volatile`,
              list.filter((x) => x !== sections[3]),
            );
          } else if (sections[1] === "-boost" || sections[1] === "-unboost") {
            const stat = sections[3];
            const amount = Number(sections[4]);
            const boosts = battle.get(`${path}:boosts`);

            if (boosts[stat] && sections[1] === "-boost") {
              boosts[stat] += amount;
            } else if (boosts[stat] && sections[1] === "-unboost") {
              boosts[stat] -= amount;
            } else if (!boosts[stat] && sections[1] === "-boost") {
              boosts[stat] = amount;
            } else if (!boosts[stat] && sections[1] === "-unboost") {
              boosts[stat] = -amount;
            }
          } else if (sections[1] === "switch") {
            const pokemon = sections[2].split(":")[1].trim();
            const [hp, maxhp] = sections[4].split("/");

            battle.set(
              `${side}:current`,
              battle.get(`${side}:team:index:${pokemon.toLowerCase()}`),
            );
            const newPath = `${side}:team:${
              battle.get(`${side}:team:index:${pokemon.toLowerCase()}`)
            }`;
            battle.set(`${path}:boosts`, {});
            battle.set(`${newPath}:stats:hp`, Number(hp));
            battle.set(`${newPath}:stats:maxhp`, Number(maxhp));
          } else if (sections[1] === "faint") {
            battle.set(`${path}:fainted`, true);

            if (side === "p2") {
              await ClientCache.invokeProcess(
                "handle-battle-exp",
                battle.get("p1:team"),
                battle.get(`p2:team:${battle.get("p2:current")}`),
                interaction,
              );
            }
          }
        }
      }
    }
  }

  override async processQuests() {
    await ClientCache.handleQuests(
      "beat",
      this.userId,
      this.didWin,
      this.npc,
      this.location,
      this.interaction,
    );
  }
}
