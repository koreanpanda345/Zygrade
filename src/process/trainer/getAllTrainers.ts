import BaseProcess from "../../base/BaseProcess.ts";
import Databases from "../../databases/index.ts";

export default class GetAllTrainersProcess extends BaseProcess {
  constructor() {
    super("get-all-trainer");
  }

  override async invoke() {
    this.logger.debug(`Grabbing all Trainers....`);
    const trainers = Databases.TrainerCollection.find();
    const data = await trainers.toArray();
    this.logger.info(`Grabbed ${data.length} trainers!`);

    return data;
  }
}
