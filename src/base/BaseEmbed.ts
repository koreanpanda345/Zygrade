import { EmbedBuilder } from 'discord.js';

export default interface BaseEmbed {
    name: string;
    embed: EmbedBuilder;
    generate(...args: any[]): Promise<EmbedBuilder>;
}

export default abstract class BaseEmbed {
    constructor(name: string) {
        this.name = name;
        this.embed = new EmbedBuilder();
    }

	public async generate(...args: any[]): Promise<EmbedBuilder> {
		return this.embed;
	}
}
