import { Logger } from "winston";
import createLogger from "../utils/logger.ts";

export default abstract class BaseMonitor {
  name: string;
  ignoreBots?: boolean;
  ignoreOthers?: boolean;
  ignoreEdits?: boolean;
  ignoreDM?: boolean;
  logger: Logger;
  constructor(name: string) {
    this.name = name;
    this.logger = createLogger(`monitor - ${this.name}`);
  }
  invoke(...args: any[]): Promise<any> {
    throw "not yet implemented";
  }
}
