import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";
import { RouteSchema } from "../../databases/models/Game/Route.ts";
import { TrainerSchema } from "../../databases/models/Trainer/Trainer.ts";
import logger from "../../utils/logger.ts";

export default class CheckTrainerAndRouteProcess extends BaseProcess {
  constructor() {
    super("check-trainer-and-route");
  }

  override async invoke(userid: string) {
    const trainer = await ClientCache.invokeProcess(
      "get-trainer",
      userid,
    ) as TrainerSchema;
    logger.debug("process - check-trainer-and-route", trainer);
    if (!trainer) return false;

    const route = await ClientCache.invokeProcess(
      "get-route",
      trainer.route,
    ) as RouteSchema;
    logger.debug("process - check-trainer-and-route", route);
    if (!route) return false;

    return { trainer, route };
  }
}
