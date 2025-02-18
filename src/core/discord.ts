import { Client } from "discord.js";
import ClientCache from "./cache.ts";
export default class DiscordClient extends Client {
  constructor() {
    super({
      intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"],
    });
  }

  public async run() {
    ClientCache.events.forEach((event) => {
      if (event.onlyOnce) {
        this.once(
          event.name,
          async (...args: any[]) => await event.invoke(...args),
        );
      } else {this.on(event.name, async (...args: any[]) =>
          await event.invoke(...args));}
    });
    await this.login(Deno.env.get("discord_client_token"));
  }
}
