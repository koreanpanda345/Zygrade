import type { CommandInteraction, CommandInteractionOptionResolver } from "discord.js";

export default interface SlashCommandContext {
	interaction: CommandInteraction;
	options: CommandInteractionOptionResolver;
}
export default class SlashCommandContext {
	constructor(interaction: CommandInteraction) {
		this.interaction = interaction;
		this.options = interaction.options as CommandInteractionOptionResolver;
	}
}