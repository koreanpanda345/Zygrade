import { CommandInteraction, EmbedBuilder } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import ClientCache from "../../core/cache.ts";
import { TrainerSchema } from "../../databases/models/Trainer/Trainer.ts";

export default class QuestCommand extends BaseCommand {
  constructor() {
    super("quest", "Displays your current quest", (data) => data);
  }

  override async invoke(interaction: CommandInteraction) {
    await interaction.deferReply();
    const trainer = await ClientCache.invokeProcess(
      "get-trainer",
      interaction.user.id,
    ) as TrainerSchema;

    if (!trainer) {
      await interaction.editReply({
        content: "Could not find any data for you!",
      });
      return;
    }

    const quests = trainer.quests;
    const embed = new EmbedBuilder();
    embed.setTitle(`${interaction.user.username}'s Quests`);
    embed.setDescription("The following are quests that you need to complete");
    for (const quest of quests) {
      if (quest.completed) continue;
      const questData = ClientCache.quests.get(quest.questid);
      embed.addFields({
        name: `${questData!.name}`,
        value: `${questData?.description}\nProgress: [${quest.progress[0]}/${
          quest.progress[1]
        }]`,
      });
    }

    await interaction.editReply({ embeds: [embed] });
  }
}
