import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";
import { RouteSchema } from "../../databases/models/Game/Route.ts";

export default class GetRandomLevelProcess extends BaseProcess {
  constructor() {
    super("get-random-level");
  }

  override async invoke(routeName: string, species: string) {
    const route: RouteSchema = await ClientCache.invokeProcess(
      "get-route",
      routeName,
    );

    if (!route) return false;

    const index = route.encounters.findIndex((s) =>
      s.species.toLowerCase().replace(" ", "") ===
        species.toLowerCase().replaceAll(" ", "")
    );

    const encounter = route.encounters[index];

    if (!encounter) return false;

    if (encounter.levels.length === 1) return encounter.levels[0];
    else {
      return Math.floor(
        Math.random() * (encounter.levels[1] - encounter.levels[0]) +
          encounter.levels[0],
      );
    }
  }
}
