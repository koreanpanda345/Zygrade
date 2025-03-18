import BaseProcess from "../../base/BaseProcess.ts";
import Databases from "../../databases/index.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";
import logger from "../../utils/logger.ts";

export default class UpdatePokemonProcess extends BaseProcess {
  constructor() {
    super("update-pokemon");
  }

  override async invoke(pokemon: PokemonSchema) {
    logger.debug(
      "process - update-pokemon",
      `Updating ${pokemon._id} (Species: ${pokemon.species}) for ${pokemon.discordUserId}...`,
    );
    const _id = pokemon._id;
    delete pokemon._id; //hopefully this works as I was thinking it would work.
    await Databases.PokemonCollection.updateOne({
      _id: _id,
    }, { $set: pokemon });
    logger.info(
      "process - update-pokemon",
      `Updated ${pokemon.species} (Species: ${pokemon.species}) for ${pokemon.discordUserId}!`,
    );
  }
}
