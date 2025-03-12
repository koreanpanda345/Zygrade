import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Logger } from "winston";
import createLogger from "../utils/logger.ts";

export default abstract class BaseCommand {
  data: SlashCommandBuilder;
  cooldown?: number;
  devOnly?: boolean;
  logger: Logger;
  constructor(
    name: string,
    description: string,
    builder: (data: SlashCommandBuilder) => SlashCommandBuilder,
  ) {
    this.data = new SlashCommandBuilder();
    this.data.setName(name);
    this.data.setDescription(description);
    builder(this.data);
    this.logger = createLogger(`command - ${name}`);
  }

  invoke(interaction: CommandInteraction): Promise<any> {
    throw "not yet implemented";
  }
}
