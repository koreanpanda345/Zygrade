import BaseMonitor from "../../base/BaseMonitor.ts";
import ClientCache from "../../core/cache.ts";

export default class HandleCantsMonitor extends BaseMonitor {
  constructor() {
    super("handle-cants");
  }

  override async invoke(line: string, userId: string) {
    const battle = ClientCache.battles.get(userId)!;
    //   |action|pokemon|reason|move
    // 0 |   1  |   2   |   3  |  4

    const pokemon = line.split("|")[2].split(":")[1];
    const side = line.split("|")[2].split(":")[0].replace("a", "");
    const reason = line.split("|")[3];

    const path = `${side}:cant`;

    battle.set(path, `${pokemon} could not act due to ${reason}`);

    await ClientCache.invokeProcess("update-scene", userId);
  }
}
