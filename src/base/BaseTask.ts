import { Logger } from "winston";
import createLogger from "../utils/logger.ts";

export default abstract class BaseTask {
  name: string;
  interval?: number;
  logger: Logger;
  constructor(name: string, interval: number = 0) {
    this.name = name;
    this.interval = interval;
    this.logger = createLogger(`task - ${this.name}`);
  }

  invoke(...args: any[]): Promise<any> {
    throw "not yet implemented!";
  }
}
