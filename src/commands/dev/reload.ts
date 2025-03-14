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
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      execSync("git pull", { cwd: "." });
      this.logger.info("Pulled Everything from Github");

      ["commands", "events", "monitors", "process", "quests"].map(
        async (
          dir,
        ) => await loadFiles(dir),
      )



      await interaction.editReply({ content: `The bot was reloaded!` });
    } catch (error) {
      this.logger.error(error);
      await ClientCache.invokeMonitor("handle-error", error);
    } finally {
      await ClientCache.invokeProcess("reload-command");
    }
  }
}
