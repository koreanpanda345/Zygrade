import { Collection, type ActionRowBuilder, type EmbedBuilder, type Message } from "discord.js";

export default interface BaseScene {
	name: string;
	scenes: Collection<string, {embed: EmbedBuilder, rows: ActionRowBuilder[]}>;
	msg: Message | null;
}

export default abstract class BaseScene {
	constructor(name: string) {
		this.name = name;
		this.scenes = new Collection();
		this.msg = null;
	}

	public async generate(...args: any[]) {
		throw 'Not yet implemented'
	}

	public async update(...args: any[]) {
		throw 'Not yet implemented'
	}

	public async switch(...args: any[]) {
		throw 'Not yet implemented'
	}
}