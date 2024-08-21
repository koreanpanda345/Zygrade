import { Collection } from "discord.js";

export default interface BaseMemory {
	name: string;
	data: Collection<string, any>;
}

export default abstract class BaseMemory {
	constructor(name: string) {
		this.name = name;
		this.data = new Collection();
	}
}