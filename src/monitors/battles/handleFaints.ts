import { EmbedBuilder, Message } from "discord.js";
import BaseMonitor from "../../base/BaseMonitor.ts";
import ClientCache from "../../core/cache.ts";

export default class HandleFaintsMonitor extends BaseMonitor {
  constructor() {
    super("handle-faints");
  }

  override async invoke(line: string, userId: string) {
    const battle = ClientCache.battles.get(userId)!;

    const side = line.split("|")[2].replace("a", "");
    const path = `${side}:${battle.get(`${side}:current`)}:fainted`;

    battle.set(path, true);

    const scene = await ClientCache.invokeProcess(
      "switch-scenes",
      userId,
      "switch",
    );

    const msg = battle.get("message") as Message<boolean> | undefined;
    const embed = battle.get("embed") as EmbedBuilder;
    await msg?.edit({
      embeds: [embed],
      components: [scene[0], scene[1]],
    });
  }
}
