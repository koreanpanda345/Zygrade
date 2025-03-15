import BaseProcess from "../../base/BaseProcess.ts";
import logger from "../../utils/logger.ts";

export default class RandomChanceProcess extends BaseProcess {
  constructor() {
    super("random-chance");
  }

  override async invoke(rate: number = 1, max: number = 100) {
    const rng = Math.floor(Math.random() * (max - 1) + 1);
    logger.debug('process - random-chance', `${rng} - ${rng <= rate}`);
    if (rng <= rate) return true;
    else return false;
  }
}
