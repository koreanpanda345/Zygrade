import { Dex } from "@pkmn/dex";
import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";

export default class GenearteWildPokemon extends BaseProcess {
  constructor() {
    super("generate-wild-pokemon");
  }

  override async invoke(
    species: string,
    level: number = 100,
    shiny: boolean = false,
  ) {
    const dex = Dex.species.get(species);
    const pokemon: PokemonSchema = {
      species,
      level,
      shiny,
      ivs: await ClientCache.invokeProcess("get-random-ivs"),
      moves: await ClientCache.invokeProcess(
        "get-random-moves",
        species,
        level,
      ),
      ability: dex.abilities[`${Math.floor(Math.random()) as 0 | 1}`]!,
      nature: (await ClientCache.invokeProcess("get-random-nature")).name,
    };

    return pokemon;
  }
}
