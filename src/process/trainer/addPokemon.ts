import { CommandInteraction } from "discord.js";
import BaseProcess from "../../base/BaseProcess.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";
import Databases from "../../databases/index.ts";
import ClientCache from "../../core/cache.ts";
import { TrainerSchema } from "../../databases/models/Trainer/Trainer.ts";
import { ObjectId } from "mongodb";

export default class AddPokemonProcess extends BaseProcess {
  constructor() {
    super("add-pokemon");
  }

  override async invoke(pokemon: PokemonSchema) {
    const trainer = await ClientCache.invokeProcess(
      "get-trainer",
      pokemon.discordUserId,
    ) as TrainerSchema;

    if (!trainer) return false;

    const _id = await Databases.PokemonCollection.insertOne(pokemon);

    if (trainer.team.length >= 6) return;

    this.logger.debug(trainer.team);

    trainer.team.push(_id.insertedId as ObjectId);

    await ClientCache.invokeProcess('update-trainer', trainer);

    return true;
  }
}
