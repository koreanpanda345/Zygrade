import { CommandInteraction } from "discord.js";
import BaseQuest from "../../base/BaseQuest.ts";
import Databases from "../../databases/index.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";
import ClientCache from "../../core/cache.ts";

export default class KantoQuest1 extends BaseQuest {
  constructor() {
    super(
      "Catch 5 Pokemon",
      "savanna_quest_3",
      "catch",
      "Catch at least 5 pokemon in the savanna area",
    );
    this.progress = [0, 5];
    this.nextQuestId = "savanna_quest_4";
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
      questid: "savanna_quest_4",
      progress: [0, 10],
      completed: false,
    });

    await ClientCache.invokeProcess("update-trainer", trainer);
    return "You received 600 coins! For Catching 5 pokemon total in the Savanna Area.";
  }
}
