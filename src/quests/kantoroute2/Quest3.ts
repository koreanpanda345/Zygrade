import { CommandInteraction } from "discord.js";
import BaseQuest from "../../base/BaseQuest.ts";
import Databases from "../../databases/index.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";
import ClientCache from "../../core/cache.ts";

export default class KantoQuest3 extends BaseQuest {
  constructor() {
    super(
      "Catch 5 Pokemon",
      "kanto_quest_3",
      "catch",
      "Catch at least 5 pokemon in the kanto route 2 area",
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

    await Databases.TrainerCollection.updateOne({
      discordUserId: trainer.discordUserId,
    }, { $set: { money: trainer.money, quests: trainer.quests } });
    return "You received 1000 coins! For Catching 5 pokemon total in Kanto Route 2";
  }
}
