import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";
import { RouteSchema } from "../../databases/models/Game/Route.ts";

export default class GetRandomNPCProcess extends BaseProcess {
  constructor() {
    super("get-random-npc");
  }

  override async invoke(routeName: string) {
    const route: RouteSchema = await ClientCache.invokeProcess(
      "get-route",
      routeName,
    );

    if (!route) return false;
    const trainers = route!.trainers;
    const index = Math.floor(Math.random() * (trainers.length - 0) + 0);
    return trainers[index];
  }
}
