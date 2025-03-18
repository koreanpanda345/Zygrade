import { REST, Routes } from "discord.js";
import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";
import logger from "../../utils/logger.ts";

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
      logger.info(
        "process - reload-command",
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
      logger.info(
        "process - reload-command",
        // @ts-ignore
        `Successfully reloaded ${data.length} application (/) commands.`,
      );
    } catch (error) {
      logger.error("process - reload-command", error);
    }
  }
}
