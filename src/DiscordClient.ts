import { Collection, IntentsBitField, Client, CommandInteraction } from 'discord.js';
import BaseMod from './base/BaseMod';
import { loadMods } from './utils/fs';
import logger from './utils/logger';
import SlashCommandContext from './context/SlashCommand';

export default class DiscordClient extends Client {
    constructor() {
        super({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.DirectMessages,
                IntentsBitField.Flags.MessageContent,
            ],
        });
    }

    mods = {
        cache: new Collection<string, BaseMod>(),
		get: (name: string) => this.mods.cache.get(name),
        load: async () => {
            const mods = await loadMods();
            for (const mod of mods) {
                this.mods.cache.set(mod.name, mod);
                logger.debug(`[${mod.name} mod] Loaded!`);
            }
        },
        loadRequiredModFiles: async () => {
            for (const mod of this.mods.cache.toJSON()) {
                await mod.loadRequiredModFiles();
            }
        },

        invokeEvents: async () => {
            for (const mod of this.mods.cache.toJSON()) {
                for (const event of mod.events.cache.toJSON()) {
                    if (event.disabled) continue;
                    if (event.onlyOnce)
                        this.once(event.eventName, async (...args: any[]) => await event.invoke(...args));
                    else this.on(event.eventName, async (...args: any[]) => await event.invoke(...args));
                }
            }
        },
        invokeCommands: async (name: string, interaction: CommandInteraction) => {
            return this.mods.cache
                .find(async (mod) => (await mod.commands.get(name)) !== undefined)
                ?.commands.invoke(name, interaction);
        },
    };

    public async run() {
        await this.mods.load();
        await this.mods.loadRequiredModFiles();
        await this.mods.invokeEvents();
        await this.login(Bun.env.DISCORD_CLIENT_TOKEN);
    }
}
