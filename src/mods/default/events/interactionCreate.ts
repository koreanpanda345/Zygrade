import type { Interaction } from "discord.js";
import BaseEvent from "../../../base/BaseEvent";
import { discordClient } from "../../../..";

export default class InteractionCreateEvent extends BaseEvent {
	constructor() {
		super('interaction-create', 'interactionCreate');
	}

	public async invoke(interaction: Interaction) {
		if (interaction.isCommand()) {
			await discordClient.mods.invokeCommands(interaction.commandName, interaction);
		}
	}
}