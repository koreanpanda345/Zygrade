import { CommandInteraction } from "discord.js";
import BaseQuest from "../../base/BaseQuest.ts";
import ClientCache from "../../core/cache.ts";
import Databases from "../../databases/index.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";
import { TrainerSchema } from "../../databases/models/Trainer/Trainer.ts";

export default class KantoQuest2 extends BaseQuest {
  constructor() {
    super(
      "Catch 2 Pokemon",
      "kanto_quest_2",
      "catch",
      "Catch at least 2 pokemon in the kanto route 2 area.",
    );
    this.progress = [0, 2];
    this.nextQuestId = 'kanto_quest_3';
  }

  override async invoke(
    userid: string,
    didCatch: boolean,
    pokemon: PokemonSchema,
    location: string,
    interaction: CommandInteraction,
  ) {
    const trainer = await ClientCache.invokeProcess(
      "get-trainer",
      userid,
    ) as TrainerSchema;

    if (!trainer) return;
    if (!didCatch) return;
    if (location !== "kantoroute1") return;

    const canGetReward = await this.updateProgress(userid, 1) as boolean;

    if (canGetReward) {
      const result = await this.getRewards(userid);
      await interaction.followUp({ content: result });
    }
  }

  override async getRewards(userid: string) {
    const trainer = await ClientCache.invokeProcess(
      "get-trainer",
      userid,
    ) as TrainerSchema;

    if (!trainer) return;

    trainer.money += 300;
    trainer.allowedRoutes.push("kantoroute2");
    trainer.quests.push({
      questid: "kanto_quest_3",
      progress: [0, 5],
      completed: false,
    });
    await Databases.TrainerCollection.updateOne({
      discordUserId: trainer.discordUserId,
    }, {
      $set: {
        money: trainer.money,
        allowedRoutes: trainer.allowedRoutes,
        quests: trainer.quests,
      },
    });
    return "You received 300 coins! For Catching 2 pokemon total in Kanto Route 1. You are now able to travel to `Kanto Route 2`. Use the `/goto` command to travel there.";
  }
}
