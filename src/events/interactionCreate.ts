import { Interaction } from "discord.js";
import BaseEvent from "../base/BaseEvent.ts";
import ClientCache from "../core/cache.ts";

export default class InteractionCreateEvent extends BaseEvent {
  constructor() {
    super("interactionCreate");
  }

  public override async invoke(interaction: Interaction) {
    if (interaction.isButton()) {
      await ClientCache.invokeMonitor(
        "handle-wild-battle-actions",
        interaction,
      );
      await ClientCache.invokeMonitor(
        "handle-npc-battle-actions",
        interaction,
      );
    }
    if (!interaction.isChatInputCommand()) return;
    await ClientCache.invokeMonitor("handle-command", interaction);
  }
}
