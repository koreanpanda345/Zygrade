import { CommandInteraction, MessageFlags } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import { loadFiles } from "../../utils/fs.ts";

export default class ReloadCommand extends BaseCommand {
  constructor() {
    super("reload", "Reloads the bot!", (data) => data);
  }

  override async invoke(interaction: CommandInteraction) {
    if (interaction.user.id !== Deno.env.get("discord_bot_owner") as string) {
      await interaction.reply({
        content: "You do not have permissions to use this command!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply();

    try {
      ["commands", "monitors", "process", "simulators", "quests"].map(async (
        dir,
      ) => await loadFiles(dir));

      await interaction.editReply({ content: `The bot was reloaded!` });
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content:
          // @ts-ignore
          `There was an error while reloading the bot:\n\`${error.message}\``,
      });
    }
  }
}
