import BaseQuest from "../../base/BaseQuest.ts";
import Databases from "../../databases/index.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";

export default class KantoQuest1 extends BaseQuest {
  constructor() {
    super(
      "Catch 1 Pokemon",
      "kanto_quest_1",
      "catch",
      "Catch at least 1 pokemon in the kanto route 1 area",
    );
  }

  override async invoke(
    userid: string,
    didCatch: boolean,
    pokemon: PokemonSchema,
    location: string,
  ) {
    const trainer = await Databases.TrainerCollection.findOne({
      discordUserId: userid,
    });

    if (!trainer) return;

    if (!didCatch) return;

    if (location !== "kantoroute1") return;

    const canGetReward = await this.updateProgress(userid, 1) as boolean;

    if (canGetReward) {
      await this.getRewards(userid);
    }
  }

  override async getRewards(userid: string) {
    const trainer = await Databases.TrainerCollection.findOne({
      discordUserId: userid,
    });

    if (!trainer) return;

    trainer.money += 3000;

    await Databases.TrainerCollection.updateOne({
      discordUserId: trainer.discordUserId,
    }, { $set: { money: trainer.money } });
    return "You received 3000 coins!";
  }
}
