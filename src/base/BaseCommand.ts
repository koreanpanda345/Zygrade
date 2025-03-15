import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export default abstract class BaseCommand {
  data: SlashCommandBuilder;
  cooldown?: number;
  devOnly?: boolean;
  constructor(
    name: string,
    description: string,
    builder: (data: SlashCommandBuilder) => SlashCommandBuilder,
  ) {
    this.data = new SlashCommandBuilder();
    this.data.setName(name);
    this.data.setDescription(description);
    builder(this.data);
  }

  invoke(interaction: CommandInteraction): Promise<any> {
    throw "not yet implemented";
  }
}
