import { CommandInteraction, MessageFlags } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import Databases from "../../databases/index.ts";
import ClientCache from "../../core/cache.ts";

export default class GiveAllQuestCommand extends BaseCommand {
    constructor() {
        super('give-all-quest', 'Gives all players a quest', (data) => {
            data.addStringOption((option) => {
                option.setName('quest_id');
                option.setDescription('The id of the quest to give');
                option.setRequired(true);
                return option;
            });
            return data;
        });
        this.devOnly = true;
    }

    override async invoke(interaction: CommandInteraction) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const trainers = Databases.TrainerCollection.find();

      const quest = ClientCache.quests.get(interaction.options.get('quest_id')?.value as string);

      if (!quest) return await interaction.editReply({ content: "Could not find that quest!" });

      if (!trainers) return await interaction.editReply({ content: "Something happened" });

      for (const trainer of await trainers.toArray()) {
        trainer.quests.push({
            questid: quest.questId,
            progress: quest.progress,
            completed: false,
        });
        this.logger.info(`Added Quest ${quest.questId} to ${trainer.discordUserId}`);
        await Databases.TrainerCollection.updateOne({ discordUserId: trainer.discordUserId}, { $set: { quests: trainer.quests }});
      }

      await interaction.editReply({ content: `Updated quest for all trainers.` });
    }
}