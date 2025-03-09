import { CommandInteraction, Message, MessageFlags } from "discord.js";
import BaseMonitor from "../../base/BaseMonitor.ts";
import BaseCommand from "../../base/BaseCommand.ts";

export default class HandleDevOnlyCommandsMonitor extends BaseMonitor {
  constructor() {
    super("handle-dev-only-commands");
  }

  override async invoke(interaction: CommandInteraction, command: BaseCommand) {
    if (!command.devOnly) return true;

    const devIds = ["304446682081525772"];

    if (devIds.includes(interaction.user.id)) {
      return true;
    }
    await interaction.reply({
      content:
        `You can not use dev commands due to not being a developer of the bot.`,
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }
}
