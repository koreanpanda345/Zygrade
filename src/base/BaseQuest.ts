import { Logger } from "winston";
import Databases from "../databases/index.ts";
import createLogger from "../utils/logger.ts";

export default abstract class BaseQuest {
  name: string;
  questId: string;
  questType: string;
  description: string;
  progress: [number, number] = [0, 1];
  nextQuestId: string = "";
  logger: Logger;
  constructor(
    name: string,
    questId: string,
    questType: string,
    description: string,
  ) {
    this.name = name;
    this.description = description;
    this.questId = questId;
    this.questType = questType;
    this.logger = createLogger(`quest - ${this.name}`);
  }

  async invoke(...args: any[]): Promise<any> {
  }

  attachTo() {
    return {
      process: ["wild-battle"],
    };
  }

  async updateProgress(userid: string, amount: number) {
    const trainer = await Databases.TrainerCollection.findOne({
      discordUserId: userid,
    });

    if (!trainer) return false;

    const quest = trainer.quests.find((x) => x.questid === this.questId);

    if (!quest) return false;

    quest.progress[0] += amount;

    if (quest.completed) return false;

    if (quest.progress[0] >= quest.progress[1]) quest.completed = true;

    await Databases.TrainerCollection.updateOne({
      discordUserId: trainer.discordUserId,
    }, { $set: { quests: trainer.quests } });
    if (quest.completed) return true;
    else return false;
  }

  async getProgress(userid: string) {
    const trainer = await Databases.TrainerCollection.findOne({
      discordUserId: userid,
    });

    if (!trainer) return false;

    return trainer.quests.find((x) => x.questid === this.questId)?.progress;
  }

  async getRewards(userid: string): Promise<any> {
    return {
      money: 3000,
      pokemon: "Eevee",
      quest: [],
    };
  }
}
