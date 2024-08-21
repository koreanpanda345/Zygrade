import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Colors,
    EmbedBuilder,
    type CommandInteraction,
} from 'discord.js';
import BaseScene from '../../../base/BaseScene';
import { discordClient } from '../../../..';
import type { RouteData } from '../funcs/getRouteData';

export default class ExploreScenes extends BaseScene {
    constructor() {
        super('explore');
    }

    public async generate(interaction: CommandInteraction, routeName: string) {
        const route = (await discordClient.mods.get('route')?.func.invoke('get-route-data', routeName)) as RouteData;

        if (!route) {
            // This would fail
            return;
        }

        // There will be 6 scenes.
        // Exploring Scene
        // Combat Scene
        // Combat Switch Scene
        // Item Found Scene
        // Trainer Spotted Scene
        // Encounter Scene

        const exploreScene = new EmbedBuilder();

        exploreScene.setTitle(`Exploring ${route.name}`);
        exploreScene.setDescription(`You are currently taking a stroll!`);
        exploreScene.setColor(Colors.Yellow);

        this.scenes.set('explore', { embed: exploreScene, rows: [] });

        const encounterScene = new EmbedBuilder();

        encounterScene.setTitle(`You encounter a wild [WILD]!`);
        encounterScene.setDescription(`Would you like to fight it and maybe catch it?`);
        encounterScene.setColor(Colors.Blurple);

        this.scenes.set('encounter', {
            embed: encounterScene,
            rows: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('route-encounter-yes')
                            .setLabel('Yes')
                            .setStyle(ButtonStyle.Success)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('route-encounter-no')
                            .setLabel('No')
                            .setStyle(ButtonStyle.Danger)
                    ),
            ],
        });
    }
}
