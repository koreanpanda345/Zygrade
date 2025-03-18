import BaseProcess from "../../base/BaseProcess.ts";
import Databases from "../../databases/index.ts";
import logger from "../../utils/logger.ts";

export default class GetAllTrainersProcess extends BaseProcess {
  constructor() {
    super("get-all-trainer");
  }

  override async invoke() {
    logger.debug("process - get-all-trainer", `Grabbing all Trainers....`);
    const trainers = Databases.TrainerCollection.find();
    const data = await trainers.toArray();
    logger.info(
      "process - get-all-trainer",
      `Grabbed ${data.length} trainers!`,
    );

    return data;
  }
}
