import BaseProcess from "../../base/BaseProcess.ts";
import Databases from "../../databases/index.ts";
import { TrainerSchema } from "../../databases/models/Trainer/Trainer.ts";
import logger from "../../utils/logger.ts";

export default class UpdateTrainerProcess extends BaseProcess {
  constructor() {
    super("update-trainer");
  }

  override async invoke(trainer: TrainerSchema) {
    logger.debug(
      "process - update-trainer",
      `Updating ${trainer.discordUserId}...`,
    );
    await Databases.TrainerCollection.updateOne({
      discordUserId: trainer.discordUserId,
    }, { $set: trainer });
    logger.info(
      "process - update-trainer",
      `Updated ${trainer.discordUserId}!`,
    );
  }
}
