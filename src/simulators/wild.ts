import { Collection, User } from "discord.js";
import BaseSimulator from "../base/BaseSimulator.ts";
import { BattleStreams, RandomPlayerAI } from "@pkmn/sim";
import ClientCache from "../core/cache.ts";
import { TrainerSchema } from "../databases/models/Trainer/Trainer.ts";
import { PokemonSchema } from "../databases/models/Trainer/Pokemon.ts";
import Databases from "../databases/index.ts";
import { Dex, Nature, SpeciesName } from "@pkmn/dex";

export default class WildSimulator extends BaseSimulator {
  constructor() {
    super("wild");
  }

  override async createBattle(user: User) {
    if (ClientCache.battles.has(user.id)) {
      return false;
    }

    ClientCache.battles.set(user.id, new Collection());
    const battle = ClientCache.battles.get(user.id)!;
    const streams = BattleStreams.getPlayerStreams(
      new BattleStreams.BattleStream(),
    );

    const spec = { formatId: "gen9customgame" };
    const trainer: TrainerSchema = await ClientCache.invokeProcess(
      "get-trainer",
      user.id,
    );

    const unparsedTeam = [];
    const trainerPokemon: PokemonSchema[] = [];
    for (const pokeId of trainer!.team) {
      const poke = await Databases.PokemonCollection.findOne({ _id: pokeId });
      if (!poke) continue;
      trainerPokemon.push(poke);
      unparsedTeam.push({
        pokemon: poke,
        species: Dex.species.get(poke.species!),
      });
    }

    const team = await ClientCache.invokeProcess("pack-team", unparsedTeam);
    const p1spec = { name: user.username, team: team };
    const wildName = await ClientCache.invokeProcess(
      "get-random-pokemon",
      trainer!.route,
    ) as SpeciesName;
    let wildLevel = await ClientCache.invokeProcess(
      "get-random-level",
      trainer!.route,
      wildName,
    ) as number;
    if (wildLevel === 0) wildLevel = 1;
    const wildPokemon: PokemonSchema = {
      species: wildName,
      shiny: false,
      level: wildLevel,
      ivs: await ClientCache.invokeProcess("get-random-ivs"),
      moves: (await ClientCache.invokeProcess(
        "get-learnable-moves",
        wildName,
        wildLevel,
      ) as string[]).reverse().splice(0, 4),
      ability: Dex.species.get(wildName)
        .abilities[`${Math.floor(Math.random()) as 0 | 1}`]!,
      nature:
        (await ClientCache.invokeProcess("get-random-nature") as Nature).name,
    };

    const wild = await ClientCache.invokeProcess("pack-team", [{
      pokemon: wildPokemon,
      species: Dex.species.get(wildName),
    }]);
    const p2spec = { name: "ZygardeBot", team: wild };
    const p2 = new RandomPlayerAI(streams.p2);
    void p2.start();

    battle.set("type", "wild");
    battle.set("p1:team", trainerPokemon);
    for (let i = 0; i < trainer!.team.length; i++) {
      battle.set(`p1:${i}`, trainerPokemon[i].species);
    }
    battle.set("p2:team", [wildPokemon]);
    battle.set("p2:0", wildPokemon.species!);
    battle.set("p1:current", 0);
    battle.set("p2:current", 0);

    battle.set("streams", streams);

    void streams.omniscient.write(
      `>start ${JSON.stringify(spec)}\n>player p1 ${
        JSON.stringify(p1spec)
      }\n>player p2 ${JSON.stringify(p2spec)}`,
    );

    return true;
  }
}
