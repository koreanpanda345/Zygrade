import { Collection, CommandInteraction } from "discord.js";
import BaseProcess from "../../base/BaseProcess.ts";
import { BattleStreams, RandomPlayerAI } from "@pkmn/sim";
import Databases from "../../databases/index.ts";
import ClientCache from "../../core/cache.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";
import { TrainerSchema } from "../../databases/models/Trainer/Trainer.ts";
import { RouteSchemaTrainers } from "../../databases/models/Game/Route.ts";
import { Dex, Species } from "@pkmn/dex";

export default class NPCBattleProcess extends BaseProcess {
  didWin: boolean = false;
  userId: string = "";
  location: string = "";
  interaction: CommandInteraction | null = null;

  constructor() {
    super("npc-battle");
  }

  override async invoke(interaction: CommandInteraction) {
    this.interaction = interaction;

    await interaction.deferReply();

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
              "get-learnable-moves",
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

    for (let i = 0; i < opponentTrainerTeam.length; i++) {
        battle.set(`p2:team:${i}`, opponentTrainerTeam[i]);
        const stats = await ClientCache.invokeProcess('handle-stats', Dex.species.get(opponentTrainerTeam[i].species), opponentTrainerTeam[i]);
        battle.set(`p2:team:${i}:level`, opponentTrainerTeam[i].level);
        battle.set(`p2:team:${i}:species`, Dex.species.get(opponentTrainerTeam[i].species).name);
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

    battle.set('p1:current', 0);
    battle.set('p2:current', 0);

    battle.set('streams', streams);
    battle.set('p1', p1spec);
    battle.set('p2', p2spec);
    battle.set('npc', npc);
    battle.set('trainer', trainer!);
    battle.set('npcPokemon', opponentTrainerTeam);
    battle.set('trainerPokemon', trainerPokemon);

    void streams.omniscient.write(
        `>start ${JSON.stringify(spec)}\n>player p1 ${JSON.stringify(p1spec)}\n>player p2 ${JSON.stringify(p2spec)}`
    );

    ClientCache.battles.set(interaction.user.id, battle);
  }
}
