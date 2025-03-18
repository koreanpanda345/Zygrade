import { CommandInteraction, MessageFlags } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import { loadFiles } from "../../utils/fs.ts";
import { exec, execSync } from "node:child_process";
import ClientCache from "../../core/cache.ts";
import logger from "../../utils/logger.ts";

export default class ReloadCommand extends BaseCommand {
  constructor() {
    super("reload", "Reloads the bot!", (data) => data);
    this.devOnly = true;
  }

  override async invoke(interaction: CommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      execSync("git pull", { cwd: "." });
      logger.info("command - reload", "Pulled Everything from Github");

      ["commands", "events", "monitors", "process", "quests"].map(
        async (
          dir,
        ) => await loadFiles(dir),
      );

      await interaction.editReply({ content: `The bot was reloaded!` });
    } catch (error) {
      logger.error("command - reload", error);
      await ClientCache.invokeMonitor("handle-error", error);
    } finally {
      await ClientCache.invokeProcess("reload-command");
    }
  }
}
