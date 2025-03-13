import BaseProcess from "../../base/BaseProcess.ts";
import Databases from "../../databases/index.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";

export default class UpdatePokemonProcess extends BaseProcess {
  constructor() {
    super("update-pokemon");
  }

  override async invoke(pokemon: PokemonSchema) {
    this.logger.debug(
      `Updating ${pokemon._id} (Species: ${pokemon.species}) for ${pokemon.discordUserId}...`,
    );
    await Databases.PokemonCollection.updateOne({
      discordUserId: pokemon.discordUserId,
    }, { $set: pokemon });
    this.logger.info(
      `Updated ${pokemon._id} (Species: ${pokemon.species}) for ${pokemon.discordUserId}!`,
    );
  }
}
