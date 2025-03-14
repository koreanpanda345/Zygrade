import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";
import { RouteSchema } from "../../databases/models/Game/Route.ts";
import { TrainerSchema } from "../../databases/models/Trainer/Trainer.ts";

export default class GetRandomItemProcess extends BaseProcess {
  constructor() {
    super("get-random-item");
  }

  override async invoke(routeName: string, userid: string) {
    const route: RouteSchema = await ClientCache.invokeProcess(
      "get-route",
      routeName,
    );
    if (!route) return false;

    const trainer = await ClientCache.invokeProcess(
      "get-trainer",
      userid,
    ) as TrainerSchema;

    if (!trainer) return false;

    const wheel = [];

    for (const pool of route.items) {
      if (
        pool.requiredQuestId &&
        !trainer.quests.some((x) =>
          x.questid === pool.requiredQuestId && x.completed === true
        )
      ) continue;

      for (const item of pool.items) {
        switch (item.rarity) {
          case 0: // Common
            for (let i = 6; i > 0; i--) wheel.push(item.name);
            break;
          case 1: // Rare
            for (let i = 4; i > 0; i--) wheel.push(item.name);
            break;
          case 2: // Ultra Rare
            for (let i = 2; i > 0; i--) wheel.push(item.name);
            break;
          case 3: // Legendary
            for (let i = 1; i > 0; i--) wheel.push(item.name);
            break;
          default:
            for (let i = 1; i > 0; i--) wheel.push(item.name);
            break;
        }
      }
    }

    let rng = Math.floor(Math.random() * wheel.length - 1);
    let isReal = false;

    while (!isReal) {
      const item = wheel[rng];
      if (item !== undefined) isReal = true;
      else rng = Math.floor(Math.random() * wheel.length - 1);
    }

    return wheel[rng];
  }
}
