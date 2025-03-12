import { Logger } from "winston";
import createLogger from "../utils/logger.ts";

export default abstract class BaseProcess {
  name: string;
  logger: Logger;
  constructor(name: string) {
    this.name = name;
    this.logger = createLogger(`process - ${this.name}`);
  }

  invoke(...args: any[]): Promise<any> {
    throw "not yet implemented";
  }

  processQuests() {
    throw "not yet implemented";
  }
}
