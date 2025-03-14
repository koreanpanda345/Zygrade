import { ObjectId } from "mongodb";

export interface TrainerSchema {
  discordUserId: string;
  money: number;
  team: ObjectId[];
  inventory: TrainerSchemaInventory;
  route: string;
  allowedRoutes: string[];
  quests: TrainerSchemaQuest[];
}

interface TrainerSchemaQuest {
  questid: string;
  progress: [number, number];
  completed: boolean;
}

interface TrainerSchemaInventory {
  inBag: {
    name: string;
    amount: number;
  }[],
  onPokemon: {
    name: string;
    id: ObjectId;
  }[];
}
