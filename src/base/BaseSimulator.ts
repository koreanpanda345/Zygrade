import { User } from "discord.js";
import { Logger } from "winston";
import createLogger from "../utils/logger.ts";

export default abstract class BaseSimulator {
  name: string;
  logger: Logger;
  constructor(name: string) {
    this.name = name;
    this.logger = createLogger(`simulator - ${this.name}`);
  }

  async createBattle(user: User): Promise<any> {
    throw "not yet implemented";
  }
}
