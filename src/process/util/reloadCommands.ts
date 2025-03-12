import { REST, Routes } from "discord.js";
import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";

export default class ReloadCommandProcess extends BaseProcess {
  constructor() {
    super("reload-command");
  }

  override async invoke() {
    const commands = ClientCache.commands.toJSON();
    const commandData = [];

    for (const command of commands) {
      commandData.push(command.data);
    }

    const rest = new REST().setToken(
      Deno.env.get("DISCORD_CLIENT_TOKEN") as string,
    );

    try {
      this.logger.info(
        `Started refreshing ${commandData.length} application (/) commands.`,
      );

      const data = await rest.put(
        Routes.applicationGuildCommands(
          Deno.env.get("discord_client_id".toUpperCase()) as string,
          Deno.env.get("discord_server_id".toUpperCase()) as string,
        ),
        { body: commandData },
      );
      // @ts-ignore
      this.logger.info(
        // @ts-ignore
        `Successfully reloaded ${data.length} application (/) commands.`,
      );
    } catch (error) {
      this.logger.error(error);
    }
  }
}
