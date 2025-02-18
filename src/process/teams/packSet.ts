import { type PokemonSet, Sets } from "@pkmn/sets";
import BaseProcess from "../../base/BaseProcess.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";
import { Species } from "@pkmn/dex";
export default class PackSetProcess extends BaseProcess {
  constructor() {
    super("pack-set");
  }

  override async invoke(pokemon: PokemonSchema, species: Species) {
    return this.generateSetTemplate(pokemon, species);
  }

  private generateSetTemplate(pokemon: PokemonSchema, species: Species) {
    return {
      name: "",
      species: species.name,
      level: pokemon.level,
      gender: "",
      item: "",
      ability: pokemon.ability!,
      evs: pokemon.evs!,
      ivs: pokemon.ivs!,
      nature: pokemon.nature!,
      moves: pokemon.moves!,
    } as PokemonSet;
  }
}
