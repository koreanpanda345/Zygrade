import { Collection, CommandInteraction } from 'discord.js';
import logger from '../utils/logger';
import BaseCommand from './BaseCommand';
import BaseEmbed from './BaseEmbed';
import BaseEvent from './BaseEvent';
import BaseMemory from './BaseMemory';
import BaseMonitor from './BaseMonitor';
import BasePagination from './BasePagination';
import BaseTask from './BaseTask';
import BaseError from './BaseError';
import BaseFunc from './BaseFunc';
import { loadFiles } from '../utils/fs';
import SlashCommandContext from '../context/SlashCommand';

export default interface BaseMod {
    name: string;
    description: string;
    disabled?: boolean;

    init(): Promise<void>;
}

export default abstract class BaseMod {
    constructor(name: string, description: string = 'No description was provided', disabled: boolean = false) {
        this.name = name;
        this.description = description;
        this.disabled = disabled;
    }

    public async init() {
        logger.info(`[${this.name} mod] Initialized!`);
    }

    public async loadRequiredModFiles() {
        try {
            logger.info(`Loading files for Mod ${this.name}!`);
            await this.commands.load();
            await this.embeds.load();
            await this.errors.load();
            await this.events.load();
            await this.func.load();
            await this.memories.load();
            await this.monitors.load();
            await this.paginations.load();
            await this.tasks.load();
        } catch (error) {
            console.log(error);
            logger.error(error);
        } finally {
            logger.info(`Finished Loading Files for Mod ${this.name}!`);
        }
    }
    commands = {
        cache: new Collection<string, BaseCommand>(),
        invoke: async (name: string, interaction: CommandInteraction) => {
            const command = await this.commands.get(name);

            if (!command) return;

            return await command.invoke(new SlashCommandContext(interaction));
        },
        get: async (name: string) => this.commands.cache.get(name),
        load: async () => {
            const commands = await loadFiles<BaseCommand>(this.name, 'commands');

            for (const command of commands) {
                if (this.commands.cache.has(command.info.name)) {
                    logger.warn(`[${this.name} mod] [${command.info.name} command] seems to already exist in the mod!`);
                    continue;
                }

                this.commands.cache.set(command.info.name, command);
                logger.debug(`[${this.name} mod] [${command.info.name} command] Loaded!`);
            }
        },
    };

    embeds = {
        cache: new Collection<string, BaseEmbed>(),
        generate: async (name: string, ...args: any[]) => {
            const embed = await this.embeds.get(name);

            if (!embed) return;

            return await embed.generate(...args);
        },
        get: async (name: string) => this.embeds.cache.get(name),
        load: async () => {
            const embeds = await loadFiles<BaseEmbed>(this.name, 'embeds');

            for (const embed of embeds) {
                if (this.embeds.cache.has(embed.name)) {
                    logger.warn(`[${this.name} mod] [${embed.name} embed] seems to already exist in the mod!`);
                    continue;
                }

                this.embeds.cache.set(embed.name, embed);
                logger.debug(`[${this.name} mod] [${embed.name} embed] Generated!`);
            }
        },
    };

    errors = {
        cache: new Collection<string, BaseError>(),
        generate: async (name: string, ...args: any[]) => {},
        get: async (name: string) => this.errors.cache.get(name),
        load: async () => {
            const errors = await loadFiles<BaseError>(this.name, 'errors');
            for (const error of errors) {
                if (this.errors.cache.has(error.name)) {
                    logger.warn(`[${this.name} mod] [${error.name} error] seems to already exist in the mod!`);
                    continue;
                }
                this.errors.cache.set(error.name, error);
                logger.debug(`[${this.name} mod] [${error.name} error] Loaded!`);
            }
        },
    };

    events = {
        cache: new Collection<string, BaseEvent>(),
        invoke: async (name: string, ...args: any[]) => {
            const event = await this.events.get(name);

            if (!event) return false;

            await event.invoke(...args);
        },
        get: async (name: string) => this.events.cache.get(name),
        load: async () => {
            const events = await loadFiles<BaseEvent>(this.name, 'events');
            for (const event of events) {
                if (this.events.cache.has(event.name)) {
                    logger.warn(`[${this.name} mod] [${event.name} event] seems to already exist in the mod!`);
                    continue;
                }

                this.events.cache.set(event.name, event);
                logger.debug(`[${this.name} mod] [${event.name} event] Loaded!`);
            }
        },
    };

    func = {
        cache: new Collection<string, BaseFunc>(),
        get: (name: string) => this.func.cache.get(name),
        invoke: async (name: string, ...args: any[]) => {
            const func = this.func.get(name);

            if (!func) return false;

            return await func.invoke(...args);
        },
        load: async () => {
            const funcs = await loadFiles<BaseFunc>(this.name, 'functions');

            for (const func of funcs) {
                if (this.func.cache.has(func.name)) {
                    logger.warn(`[${this.name} mod] [${func.name} function] seems to already exist in the mod!`);
                    continue;
                }

                this.func.cache.set(func.name, func);
                logger.debug(`[${this.name} mod] [${func.name} function] Loaded!`);
            }
        },
    };

    memories = {
        cache: new Collection<string, BaseMemory>(),
        get: async (name: string) => this.memories.cache.get(name),
        load: async () => {
            const memories = await loadFiles<BaseMemory>(this.name, 'memories');

            for (const memory of memories) {
                if (this.memories.cache.has(memory.name)) {
                    logger.warn(`[${this.name} mod] [${memory.name} memory] seems to already exist in the mod!`);
                    continue;
                }

                this.memories.cache.set(memory.name, memory);
                logger.debug(`[${this.name} mod] [${memory.name} memory] Loaded!`);
            }
        },
    };

    monitors = {
        cache: new Collection<string, BaseMonitor>(),
        get: async (name: string) => this.monitors.cache.get(name),
        invoke: async (name: string, ...args: any[]) => {
            const monitor = await this.monitors.get(name);
            if (!monitor) return false;

            await monitor.invoke(...args);
        },
        load: async () => {
            const monitors = await loadFiles<BaseMonitor>(this.name, 'monitors');

            for (const monitor of monitors) {
                if (this.monitors.cache.has(monitor.name)) {
                    logger.warn(`[${this.name} mod] [${monitor.name} monitor] seems to already exist in the mod!`);
                    continue;
                }

                this.monitors.cache.set(monitor.name, monitor);
                logger.debug(`[${this.name} mod] [${monitor.name} monitor] Loaded!`);
            }
        },
    };

    paginations = {
        cache: new Collection<string, BasePagination>(),
        get: async (name: string) => this.paginations.cache.get(name),
        load: async () => {
            const paginations = await loadFiles<BasePagination>(this.name, 'paginations');

            for (const pagination of paginations) {
                if (this.paginations.cache.has(pagination.name)) {
                    logger.warn(
                        `[${this.name} mod] [${pagination.name} pagination] seems to already exist in the mod!`
                    );
                    continue;
                }
                this.paginations.cache.set(pagination.name, pagination);
                logger.debug(`[${this.name} mod] [${pagination.name} pagination] Loaded!`);
            }
        },
    };

    tasks = {
        cache: new Collection<string, BaseTask>(),
        get: async (name: string) => this.tasks.cache.get(name),
        load: async () => {
            const tasks = await loadFiles<BaseTask>(this.name, 'tasks');

            for (const task of tasks) {
                if (this.tasks.cache.has(task.name)) {
                    logger.warn(`[${this.name} mod] [${task.name} task] seems to already exist in the mod!`);
                    continue;
                }
                this.tasks.cache.set(task.name, task);
                logger.debug(`[${this.name} mod] [${task.name} task] Loaded!`);
            }
        },
    };
}
