import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";
import { RouteSchema } from "../../databases/models/Game/Route.ts";
import { TrainerSchema } from "../../databases/models/Trainer/Trainer.ts";

export default class GetRandomPokemonProcess extends BaseProcess {
  constructor() {
    super("get-random-pokemon");
  }

  override async invoke(routeName: string, userid: string) {
    const route: RouteSchema = await ClientCache.invokeProcess(
      "get-route",
      routeName,
    );
    if (!route) return false;

    const trainer = await ClientCache.invokeProcess('get-trainer', userid) as TrainerSchema;

    if (!trainer) return false;

    const encounters = route.encounters;

    const wheel = [];

    for (const encounter of encounters) {
      if (encounter.requiredQuestId && !trainer.quests.some((x) => x.questid === encounter.requiredQuestId && x.completed === true)) continue;
      for (const pool of encounter.encounters) {
        switch (pool.rarity) {
          case 0: // Very Common
          for (let i = 7; i > 0; i--) wheel.push(pool.species);
          break;
        case 1: // Common
          for (let i = 6; i > 0; i--) wheel.push(pool.species);
          break;
        case 2: // Uncommon
          for (let i = 5; i > 0; i--) wheel.push(pool.species);
          break;
        case 3: // Rare
          for (let i = 4; i > 0; i--) wheel.push(pool.species);
          break;
        case 4: // Very Rare
          for (let i = 3; i > 0; i--) wheel.push(pool.species);
          break;
        case 5:
          for (let i = 2; i > 0; i--) wheel.push(pool.species);
          break;
        case 6: // Mythical
        case 7: // Legendary
          for (let i = 1; i > 0; i--) wheel.push(pool.species);
          break;
        default:
          for (let i = 1; i > 0; i--) wheel.push(pool.species);
        }
      }
    }

    let rng = Math.floor(Math.random() * wheel.length - 1);
    let isReal = false;

    while (!isReal) { // This is for quality check. We always want to make sure the player is getting a real pokemon everytime.
      const poke = wheel[rng];
      if (poke !== undefined) isReal = true;
      else rng = Math.floor(Math.random() * wheel.length - 1);
    }
    return wheel[rng];
  }
}
