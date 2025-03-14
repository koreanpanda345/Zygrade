import { REST, Routes } from "discord.js";
import BaseEvent from "../base/BaseEvent.ts";
import ClientCache from "../core/cache.ts";
import { discordClient } from "../../main.ts";

export default class ReadyEvent extends BaseEvent {
  constructor() {
    super("ready", true);
  }

  public override async invoke() {
    this.logger.info(`Ready!`);
    // Loading Commands
    await ClientCache.invokeProcess("reload-command");

    // Waking up the databases
    await ClientCache.invokeProcess("get-trainer", "304446682081525772");
    await ClientCache.invokeProcess("get-route", "savanna");
  }
}
