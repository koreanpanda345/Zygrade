import { ButtonBuilder, EmbedBuilder } from "discord.js";
import BaseMonitor from "../../base/BaseMonitor.ts";
import ClientCache from "../../core/cache.ts";

export default class HandleBoostsMonitor extends BaseMonitor {
  constructor() {
    super("handle-boosts");
  }

  override async invoke(line: string, userId: string) {
    const battle = ClientCache.battles.get(userId)!;

    // |-boost|p1a: Minccino|atk|1
    // |-unboost|p1a: Minccino|atk|1
    // 0	1		2			3	4

    const action = line.split("|")[1];
    const side = line.split("|")[2].split(":")[0].replace("a", "");
    const stat = line.split("|")[3];
    const amount = Number.parseInt(line.split("|")[4]);

    const index = battle.get(`${side}:current`);

    const path = `${side}:${index}:stat:${stat}`;

    if (!battle.has(path)) {
      battle.set(path, action === "-boost" ? 0 + amount : 0 - amount);
    } else if (action === "-boost") {
      battle.set(path, Number.parseInt(battle.get(path)) + amount);
    } else if (action === "-unboost") {
      battle.set(path, Number.parseInt(battle.get(path)) - amount);
    }

    await ClientCache.invokeProcess("update-scene", userId);
  }
}
