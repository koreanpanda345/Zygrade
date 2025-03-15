import { ObjectId } from "mongodb";
import BaseProcess from "../../base/BaseProcess.ts";
import Databases from "../../databases/index.ts";
import ClientCache from "../../core/cache.ts";

export default class CreateTrainerProcess extends BaseProcess {
  constructor() {
    super("create-trainer");
  }

  override async invoke(userId: string, pokemonId: ObjectId) {
    const check = await Databases.TrainerCollection.findOne({
      discordUserId: userId,
    });

    if (check) return check;

    return await Databases.TrainerCollection.insertOne({
      discordUserId: userId,
      team: [pokemonId],
      inventory: [],
      money: 200,
      route: "savanna",
      allowedRoutes: ["savanna"],
      quests: [
        {
          questid: "savanna_quest_1",
          progress: [0, 1],
          completed: false,
        },
      ],
    });
  }
}
