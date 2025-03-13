import BaseProcess from "../../base/BaseProcess.ts";
import Databases from "../../databases/index.ts";
import { TrainerSchema } from "../../databases/models/Trainer/Trainer.ts";

export default class UpdateTrainerProcess extends BaseProcess {
  constructor() {
    super("update-trainer");
  }

  override async invoke(trainer: TrainerSchema) {
    this.logger.debug(`Updating ${trainer.discordUserId}...`);
    await Databases.TrainerCollection.updateOne({
      discordUserId: trainer.discordUserId,
    }, { $set: trainer });
    this.logger.info(`Updated ${trainer.discordUserId}!`);
  }
}
