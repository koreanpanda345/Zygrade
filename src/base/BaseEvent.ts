import { Logger } from "winston";
import createLogger from "../utils/logger.ts";

export default abstract class BaseEvent {
  name: string;
  onlyOnce?: boolean;
  logger: Logger;
  constructor(name: string, onlyOnce: boolean = false) {
    this.name = name;
    this.onlyOnce = onlyOnce;
    this.logger = createLogger(`events - ${this.name}`);
  }

  public async invoke(...args: any[]): Promise<any> {
    throw "Not yet implemented";
  }
}
