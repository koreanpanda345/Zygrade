import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";
import { RouteSchema } from "../../databases/models/Game/Route.ts";

export default class GetRandomPokemonProcess extends BaseProcess {
  constructor() {
    super("get-random-pokemon");
  }

  override async invoke(routeName: string) {
    const route: RouteSchema = await ClientCache.invokeProcess(
      "get-route",
      routeName,
    );
    if (!route) return false;

    const encounters = route.encounters;

    const wheel = [];

    for (const encounter of encounters) {
      switch (encounter.rarity) {
        case 0: // Very Common
          for (let i = 6; i > 0; i--) wheel.push(encounter.species);
          break;
        case 1: // Common
          for (let i = 5; i > 0; i--) wheel.push(encounter.species);
          break;
        case 2: // Uncommon
          for (let i = 4; i > 0; i--) wheel.push(encounter.species);
          break;
        case 3: // Rare
          for (let i = 3; i > 0; i--) wheel.push(encounter.species);
          break;
        case 4: // Very Rare
          for (let i = 2; i > 0; i--) wheel.push(encounter.species);
          break;
        case 6: // Mythical
        case 7: // Legendary
          for (let i = 1; i > 0; i--) wheel.push(encounter.species);
          break;
        default:
          for (let i = 1; i > 0; i--) wheel.push(encounter.species);
      }
    }

    let rng = Math.floor(Math.random() * wheel.length - 1);
    let isReal = false;

    while (!isReal) { // This is for quality check. We always want to make sure the player is getting a real pokemon everytime.
      const poke = wheel[rng];
      if (poke !== undefined) isReal = true;
      else rng = Math.floor(Math.random() * wheel.length - 1);
    }
    console.log(wheel[rng]);
    return wheel[rng];
  }
}
