import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";

export default class IsShinyProcess extends BaseProcess {
  constructor() {
    super("is-shiny");
  }

  override async invoke(isShiny: boolean = false) {
    if (isShiny) return true;

    // For right now, we will use the base rate from gen 6 - Gen 9, which is 1/4096

    const chance = await ClientCache.invokeProcess("random-chance", 1, 4096);

    if (chance) return true;
    else return false;
  }
}
