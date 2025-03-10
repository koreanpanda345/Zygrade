import { REST, Routes } from "discord.js";
import BaseEvent from "../base/BaseEvent.ts";
import ClientCache from "../core/cache.ts";
import { discordClient } from "../../main.ts";

export default class ReadyEvent extends BaseEvent {
  constructor() {
    super("ready", true);
  }

  public override async invoke() {
    console.log(`Ready!`);

    await ClientCache.invokeProcess('reload-command');
  }
}
