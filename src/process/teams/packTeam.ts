import { PokemonSet, Species } from "@pkmn/dex";
import BaseProcess from "../../base/BaseProcess.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";
import ClientCache from "../../core/cache.ts";

export default class PackTeamProcess extends BaseProcess {
  constructor() {
    super("pack-team");
  }

  override async invoke(team: { pokemon: PokemonSchema; species: Species }[]) {
    const teamSet = [];
    for (const poke of team) {
      teamSet.push(
        await ClientCache.invokeProcess(
          "pack-set",
          poke.pokemon,
          poke.species,
        ) as PokemonSet,
      );
    }

    return teamSet;
  }
}
