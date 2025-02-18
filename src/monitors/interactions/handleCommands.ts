import { CommandInteraction } from "discord.js";
import BaseMonitor from "../../base/BaseMonitor.ts";
import ClientCache from "../../core/cache.ts";

export default class HandleCommandMonitor extends BaseMonitor {
  constructor() {
    super("handle-command");
  }

  override async invoke(interaction: CommandInteraction) {
    if (interaction.user.bot) return;

    const command = ClientCache.commands.get(interaction.commandName);
    if (!command) {
      return;
    }

    const cooldown = await ClientCache.invokeMonitor(
      "handle-command-cooldown",
      interaction,
      command,
    ) as boolean;

    if (!cooldown) {
      return;
    }

    try {
      await command.invoke(interaction);
    } catch (error) {
      console.error(error);
    }
  }
}
