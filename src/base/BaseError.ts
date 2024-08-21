import { Colors, EmbedBuilder } from "discord.js";

export default interface BaseError {
	name: string;
	embed: EmbedBuilder;

	generate(...args: any[]): Promise<EmbedBuilder>;
}

export default abstract class BaseError {
	constructor(name: string) {
		this.name = name;
		this.embed = new EmbedBuilder();
	}

	public async generate(...args: any[]): Promise<EmbedBuilder> {
		this.embed.setTitle(`Something Happened!!!`);
		this.embed.setColor(Colors.Red);
		this.embed.setDescription(`Something happened when doing this action!`);

		return this.embed;
	}
}