import BaseMonitor from "../../base/BaseMonitor.ts";
import ClientCache from "../../core/cache.ts";

export default class HandleMovesMonitor extends BaseMonitor {
  constructor() {
    super("handle-moves");
  }

  override async invoke(line: string, userId: string) {
    const battle = ClientCache.battles.get(userId)!;
    // |move|p1a: Snivy|Tackle|p2a:Patrat
    // | 0	|	1	   |	2 |		3
    const side = line.split("|")[2].split(":")[0].replace("a", "");
    const move = line.split("|")[3];
    battle.set(`${side}:used`, move);

    await ClientCache.invokeProcess("update-scene", userId);
  }
}
