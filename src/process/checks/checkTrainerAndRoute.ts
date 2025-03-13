import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";

export default class CheckTrainerAndRouteProcess extends BaseProcess {
  constructor() {
    super("check-trainer-and-route");
  }

  override async invoke(userid: string) {
    const trainer = await ClientCache.invokeProcess("get-trainer", userid);

    if (!trainer) return false;

    const route = await ClientCache.invokeProcess("get-route", userid);

    if (!route) return false;

    return { trainer, route };
  }
}
