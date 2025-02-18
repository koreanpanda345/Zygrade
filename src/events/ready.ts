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

    const commands = ClientCache.commands.toJSON();
    const commandData = [];

    for (const command of commands) {
      commandData.push(command.data);
    }

    const rest = new REST().setToken(
      Deno.env.get("discord_client_token") as string,
    );

    try {
      console.log(
        `Started refreshing ${commandData.length} application (/) commands.`,
      );
      // console.log(discordClient.user?.id);
      const data = await rest.put(
        Routes.applicationGuildCommands(
          Deno.env.get("discord_client_id") as string,
          Deno.env.get("discord_server_id") as string,
        ),
        { body: commandData },
      );
      // @ts-ignore
      console.log(
        `Successfully reloaded ${data.length} application (/) commands.`,
      );
    } catch (error) {
      console.error(error);
    }
  }
}
