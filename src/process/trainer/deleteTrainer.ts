import BaseProcess from "../../base/BaseProcess.ts";
import Databases from "../../databases/index.ts";
import logger from "../../utils/logger.ts";

export default class DeleteTrainerProcess extends BaseProcess {
  constructor() {
    super("delete-trainer");
  }

  public override async invoke(userId: string) {
    const trainer = await Databases.TrainerCollection.deleteOne({
      discordUserId: userId,
    });

    if (!trainer.acknowledged) {
      return false;
    } else {
      logger.info(
        'process - delete-trainer',
        `Deleted ${trainer.deletedCount} trainers with user id ${userId}`,
      );
    }

    const pokemon = await Databases.PokemonCollection.deleteMany({
      discordUserId: userId,
    });

    if (!pokemon.acknowledged) {
      return false;
    } else {
      logger.info(
        'process - delete-trainer',
        `Deleted ${pokemon.deletedCount} pokemon with user id ${userId}`,
      );
    }

    return true;
  }
}
