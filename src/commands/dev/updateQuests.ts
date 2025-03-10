import { CommandInteraction } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import ClientCache from "../../core/cache.ts";
import Databases from "../../databases/index.ts";

export default class UpdateQuestCommand extends BaseCommand {
    constructor () {
        super('update_quests', 'Updates all quests for every player.', (data) => data);
        this.devOnly = true;
    }

    override async invoke(interaction: CommandInteraction) {
      await interaction.deferReply();

      const trainers = Databases.TrainerCollection.find();
      const trainersArr = await trainers.toArray();

      for (const trainer of trainersArr) {
        const trainerQuests = trainer.quests;

        for (const trainerQuest of trainerQuests) {
            if (trainerQuest.completed) {
                const quest = ClientCache.quests.get(trainerQuest.questid);
                if (quest?.nextQuestId === "") continue;
                if (trainerQuests.find(x => x.questid === quest?.nextQuestId)) continue;
                const nextQuest = ClientCache.quests.get(quest?.nextQuestId!);
                trainer.quests.push({ questid: nextQuest!.questId, progress: nextQuest!.progress, completed: false });
            }
        }

        await Databases.TrainerCollection.updateOne({ discordUserId: trainer.discordUserId }, { $set: { quests: trainer.quests }});
        
        console.log(`Updated Quests for ${trainer.discordUserId}`);
    }

        await interaction.editReply({ content: "Updated All Quests" });
    }
}