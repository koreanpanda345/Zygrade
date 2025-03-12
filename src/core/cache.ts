import { Collection, User } from "discord.js";
import BaseEvent from "../base/BaseEvent.ts";
import BaseCommand from "../base/BaseCommand.ts";
import BaseMonitor from "../base/BaseMonitor.ts";
import BaseTask from "../base/BaseTask.ts";
import BaseProcess from "../base/BaseProcess.ts";
import BaseSimulator from "../base/BaseSimulator.ts";
import BaseQuest from "../base/BaseQuest.ts";
import { Logger } from "winston";
import createLogger from "../utils/logger.ts";

export default class ClientCache {
  public static commands: Collection<string, BaseCommand> = new Collection();
  public static cooldowns: Collection<string, Collection<string, number>> =
    new Collection();
  public static events: Collection<string, BaseEvent> = new Collection();
  public static monitors: Collection<string, BaseMonitor> = new Collection();
  public static process: Collection<string, BaseProcess> = new Collection();
  public static tasks: Collection<string, BaseTask> = new Collection();
  public static quests: Collection<string, BaseQuest> = new Collection();
  public static logger: Logger = createLogger("core - cache");

  public static battles: Collection<string, Collection<string, any>> =
    new Collection();
  public static simulators: Collection<string, BaseSimulator> =
    new Collection();

  public static async invokeMonitor(name: string, ...args: any[]) {
    const monitor = this.monitors.get(name);
    if (!monitor) return false;

    try {
      return await monitor.invoke(...args);
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  public static async invokeProcess(name: string, ...args: any[]) {
    const process = this.process.get(name);
    if (!process) return false;

    try {
      return await process.invoke(...args);
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  public static async getSimulator(name: string, user: User) {
    const simulator = this.simulators.get(name);
    if (!simulator) return false;

    try {
      return await simulator.createBattle(user);
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  static async handleQuests(type: string, userid: string, ...args: any[]) {
    try {
      this.quests.forEach(async (quest) => {
        if (quest.questType === type) {
          await quest.invoke(userid, ...args);
        }
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
