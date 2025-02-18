import BaseProcess from "../../base/BaseProcess.ts";
import Databases from "../../databases/index.ts";

export default class GetTrainerProcess extends BaseProcess {
  constructor() {
    super("get-trainer");
  }

  override async invoke(discordUserId: string) {
    const trainer = await Databases.TrainerCollection.findOne({
      discordUserId,
    });

    return trainer;
  }
}
