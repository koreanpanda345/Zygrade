import { CommandInteraction } from "discord.js";
import BaseQuest from "../../base/BaseQuest.ts";
import Databases from "../../databases/index.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";
import ClientCache from "../../core/cache.ts";

export default class KantoQuest4 extends BaseQuest {
  constructor() {
    super(
      "Catch 10 Pokemon",
      "kanto_quest_4",
      "catch",
      "Catch at least 10 pokemon in the kanto route 2 area",
    );
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

    if (location !== "kantoroute2") return;

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

    trainer.money += 1000;
    trainer.allowedRoutes.push("viridianforest");

    trainer.quests.push({
      questid: 'kanto_quest_5',
      progress: [0, 1],
      completed: false
    });

    await Databases.TrainerCollection.updateOne({
      discordUserId: trainer.discordUserId,
    }, {
      $set: {
        money: trainer.money,
        quests: trainer.quests,
        allowedRoutes: trainer.allowedRoutes,
      },
    });
    return "You received 1000 coins! For Catching 5 pokemon total in Kanto Route 2. You are now able to travel to `Viridian Forest`. Use the `/goto` command to travel there.";
  }
}
