import BaseProcess from "../../base/BaseProcess.ts";

export default class RandomChanceProcess extends BaseProcess {
  constructor() {
    super("random-chance");
  }

  override async invoke(rate: number = 1, max: number = 100) {
    const rng = Math.floor(Math.random() * (max - 1) + 1);
    this.logger.debug(`${rng} - ${rng <= rate}`);
    if (rng <= rate) return true;
    else return false;
  }
}
