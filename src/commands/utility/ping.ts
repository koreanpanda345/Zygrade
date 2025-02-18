import { CommandInteraction } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";

export default class PingCommand extends BaseCommand {
  constructor() {
    super("ping", "Replies with Pong!", (data) => data);
    this.cooldown = 5;
  }

  override async invoke(interaction: CommandInteraction) {
    await interaction.reply("Pong!");
  }
}
