import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";
import { RouteSchema } from "../../databases/models/Game/Route.ts";
import { TrainerSchema } from "../../databases/models/Trainer/Trainer.ts";

export default class GetRandomLevelProcess extends BaseProcess {
  constructor() {
    super("get-random-level");
  }

  override async invoke(routeName: string, species: string, userid: string) {
    const route: RouteSchema = await ClientCache.invokeProcess(
      "get-route",
      routeName,
    );

    if (!route) return false;

    const trainer = await ClientCache.invokeProcess(
      "get-trainer",
      userid,
    ) as TrainerSchema;

    const index = route.encounters.findIndex((s) =>
      s.requiredQuestId &&
      trainer.quests.some((q) => q.questid === s.requiredQuestId && q.completed)
    );

    if (index === -1) {
      return Math.floor(
        Math.random() *
            (route.encounters[0].levels[1] - route.encounters[0].levels[0]) +
          route.encounters[0].levels[0],
      );
    } else {
      return Math.floor(
        Math.random() *
            (route.encounters[index].levels[1] -
              route.encounters[index].levels[0]) +
          route.encounters[index].levels[0],
      );
    }
  }
}
