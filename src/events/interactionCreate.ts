import { Collection, Interaction, MessageFlags } from "discord.js";
import BaseEvent from "../base/BaseEvent.ts";
import ClientCache from "../core/cache.ts";

export default class InteractionCreateEvent extends BaseEvent {
  constructor() {
    super("interactionCreate");
  }

  public override async invoke(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;
    await ClientCache.invokeMonitor("handle-command", interaction);
  }
}
