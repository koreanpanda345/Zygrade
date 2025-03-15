import { User } from "discord.js";

export default abstract class BaseSimulator {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  async createBattle(user: User): Promise<any> {
    throw "not yet implemented";
  }
}
