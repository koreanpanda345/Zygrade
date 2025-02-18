import BaseMonitor from "../../base/BaseMonitor.ts";
import ClientCache from "../../core/cache.ts";

export default class HandleDamageMonitor extends BaseMonitor {
  constructor() {
    super("handle-damage");
  }

  override async invoke(line: string, userId: string) {
    const battle = ClientCache.battles.get(userId)!;

    const side = line.split("|")[2].split(":")[0].replace("a", "");

    const hp = [
      Number.parseInt(line.split("|")[3].split("/")[0]),
      Number.parseInt(line.split("|")[3].split("/")[1]),
    ];

    const minPath = `${side}:${battle.get(`${side}:current`)}:hp:min`;
    const maxPath = `${side}:${battle.get(`${side}:current`)}:hp:max`;

    battle.set(minPath, hp[0]);
    battle.set(maxPath, hp[1]);

    if (line.split("|")[3] !== "0 fnt") {
      await ClientCache.invokeProcess("update-scene", userId);
    }
  }
}
