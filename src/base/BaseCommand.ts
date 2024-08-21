import { Collection, SlashCommandBuilder } from "discord.js";
import type SlashCommandContext from "../context/SlashCommand";

export default interface BaseCommand {
	info: SlashCommandBuilder;
	errors: Collection<string, string>;
	invoke(ctx: SlashCommandContext): Promise<unknown>;
	precondition(ctx: SlashCommandContext): Promise<boolean>;
}

export default abstract class BaseCommand {
	constructor(name: string, description: string, builder?: (data: SlashCommandBuilder) => SlashCommandBuilder) {
		this.info = new SlashCommandBuilder();
		this.errors = new Collection();
		this.info.setName(name);
		this.info.setDescription(description);
		if (typeof builder !== "undefined") builder(this.info);
	}

	public async invoke(ctx: SlashCommandContext) {
		throw "Not yet implemented";
	}

	public async precondition(ctx: SlashCommandContext) {
		return true;
	}
}