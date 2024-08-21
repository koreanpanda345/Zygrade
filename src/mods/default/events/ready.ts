import { REST, Routes } from "discord.js";
import { discordClient } from "../../../..";
import BaseEvent from "../../../base/BaseEvent";
import logger from "../../../utils/logger";

export default class ReadyEvent extends BaseEvent {
	constructor() {
		super('ready', 'ready', true);
	}

	public async invoke() {
		const commands = [];
		
		for (const mod of discordClient.mods.cache.toJSON())
			for (const cmd of mod.commands.cache.toJSON()) commands.push(cmd.info);

		const rest = new REST().setToken(Bun.env.DISCORD_CLIENT_TOKEN as string);

		try {
			logger.debug(`Started refreshing ${commands.length} application (/) commands.`);

			const data = (await rest.put(Routes.applicationGuildCommands(discordClient.user!.id, '439111274828136453'), {
				body: commands,
			})) as [];
	
			logger.debug(`Successfully reloaded ${data.length} application (/) commands.`);
		} catch (error) {
			logger.error(error);
		}
	}
}