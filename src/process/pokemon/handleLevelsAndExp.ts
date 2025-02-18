import { PokemonClient } from "pokenode-ts";
import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";
import Databases from "../../databases/index.ts";

export default class HandleLevelsAndExpProcess extends BaseProcess {
  constructor() {
    super("handle-levels-and-exp");
  }

  override async invoke(pokemon: PokemonSchema, expAmount: number) {
    pokemon.exp! += expAmount;

    const growthRate =
      (await new PokemonClient().getPokemonSpeciesByName(pokemon.species!))
        .growth_rate;

    if (pokemon.exp! >= pokemon.neededExp!) {
      pokemon.level += 1;
      pokemon.exp = 0;
      pokemon.neededExp = await ClientCache.invokeProcess(
        "handle-growth-rate",
        growthRate.name,
        pokemon.level,
      );
    }

    await Databases.PokemonCollection.updateOne({ _id: pokemon._id }, {
      $set: {
        level: pokemon.level,
        exp: pokemon.exp!,
        neededExp: pokemon.neededExp!,
      },
    });
  }
}
