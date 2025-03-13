import { CommandInteraction } from "discord.js";
import BaseQuest from "../../base/BaseQuest.ts";
import Databases from "../../databases/index.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";
import ClientCache from "../../core/cache.ts";

export default class KantoQuest1 extends BaseQuest {
  constructor() {
    super(
      "Catch 10 Pokemon",
      "savanna_quest_4",
      "catch",
      "Catch at least 10 pokemon in the savanna area",
    );
    this.progress = [0, 10];
    this.nextQuestId = "savanna_quest_5";
  }

  override async invoke(
    userid: string,
    didCatch: boolean,
    pokemon: PokemonSchema,
    location: string,
    interaction: CommandInteraction,
  ) {
    const trainer = await Databases.TrainerCollection.findOne({
      discordUserId: userid,
    });

    if (!trainer) return;

    if (!didCatch) return;

    if (location !== "savanna") return;

    const canGetReward = await this.updateProgress(userid, 1) as boolean;

    if (canGetReward) {
      const result = await this.getRewards(userid);
      await interaction.followUp({ content: result });
    }
  }

  override async getRewards(userid: string) {
    const trainer = await Databases.TrainerCollection.findOne({
      discordUserId: userid,
    });

    if (!trainer) return;

    trainer.money += 300;

    trainer.quests.push({
      questid: "savanna_quest_5",
      progress: [0, 20],
      completed: false,
    });

    await Databases.TrainerCollection.updateOne({
      discordUserId: trainer.discordUserId,
    }, { $set: { money: trainer.money, quests: trainer.quests } });
    return "You received 1000 coins! For Catching 10 pokemon total in the Savanna Area.";
  }
}
