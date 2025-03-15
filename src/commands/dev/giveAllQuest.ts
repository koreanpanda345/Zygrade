import { CommandInteraction, MessageFlags } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import ClientCache from "../../core/cache.ts";
import logger from "../../utils/logger.ts";

export default class GiveAllQuestCommand extends BaseCommand {
  constructor() {
    super("give-all-quest", "Gives all players a quest", (data) => {
      data.addStringOption((option) => {
        option.setName("quest_id");
        option.setDescription("The id of the quest to give");
        option.setRequired(true);
        return option;
      });
      return data;
    });
    this.devOnly = true;
  }

  override async invoke(interaction: CommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const trainers = await ClientCache.invokeProcess("get-all-trainers");

    const quest = ClientCache.quests.get(
      interaction.options.get("quest_id")?.value as string,
    );

    if (!quest) {
      return await interaction.editReply({
        content: "Could not find that quest!",
      });
    }

    if (!trainers) {
      return await interaction.editReply({ content: "Something happened" });
    }

    for (const trainer of trainers) {
      trainer.quests.push({
        questid: quest.questId,
        progress: quest.progress,
        completed: false,
      });
      logger.info(
        'command - give-all-quests',
        `Added Quest ${quest.questId} to ${trainer.discordUserId}`,
      );
      await ClientCache.invokeProcess("update-trainer", trainer);
    }

    await interaction.editReply({ content: `Updated quest for all trainers.` });
  }
}
