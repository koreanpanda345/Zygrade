import { CommandInteraction, MessageFlags } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import { loadFiles } from "../../utils/fs.ts";
import { exec, execSync } from "node:child_process";
import ClientCache from "../../core/cache.ts";

export default class ReloadCommand extends BaseCommand {
  constructor() {
    super("reload", "Reloads the bot!", (data) => data);
    this.devOnly = true;
  }

  override async invoke(interaction: CommandInteraction) {
    await interaction.deferReply();

    try {
      execSync('git pull', { cwd: "."});
      console.log("Pulled Everything from Github");

      ["commands", "events", "monitors", "process", "simulators", "quests"].map(async (
        dir,
      ) => await loadFiles(dir));

      await ClientCache.invokeProcess('reload-command');

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
