import { ObjectId } from "mongodb";

export interface TrainerSchema {
  discordUserId: string;
  money: number;
  team: ObjectId[];
  inventory: {
    name: string;
    amount: number;
  }[];
  route: string;
}
