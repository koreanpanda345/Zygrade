import {
	ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Collection,
    ComponentType,
    type CommandInteraction,
    type EmbedBuilder,
    type Message,
} from 'discord.js';
import logger from '../utils/logger';

export default interface BasePagination {
    name: string;
    buttons: Collection<string, ButtonBuilder>;
    pages: EmbedBuilder[];
    msg: Message | null;

    addPage(embed: EmbedBuilder): number;
    generate(interaction: CommandInteraction): Promise<unknown>;
    dispose(): Promise<boolean>;
}

export default abstract class BasePagination {
    constructor(name: string) {
        this.name = name;
        this.buttons = new Collection();
        this.buttons.set(
            'back',
            new ButtonBuilder().setCustomId('back').setStyle(ButtonStyle.Secondary).setLabel('Back').setEmoji('⬅')
        );
        this.buttons.set(
            'forward',
            new ButtonBuilder().setCustomId('forward').setStyle(ButtonStyle.Secondary).setLabel('Next').setEmoji('➡')
        );
        this.pages = [];
        this.msg = null;
    }

    addPage = (embed: EmbedBuilder) => this.pages.push(embed);

    async generate(interaction: CommandInteraction) {
        try {
            await interaction.deferReply();
            if (this.pages.length === 1)
                return await interaction.editReply({
                    embeds: this.pages,
                    components: [],
                });

			const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents([
				this.buttons.get('back')!,
				this.buttons.get('forward')!,
			]);

			let index = 0;

			this.msg = await interaction.editReply({
				embeds: [this.pages[index]],
				components: [buttons]
			});

			const mc = await this.msg.createMessageComponentCollector({
				componentType: ComponentType.Button,
				filter: (i) => i.user.id === interaction.user.id
			});

			mc.on('collect', async (i) => {
				await i.deferUpdate();

				if (i.customId === 'back' && index > 0) index--;
				if (i.customId === 'forward' && index < this.pages.length - 1) index++;

				if (this.pages.length === 1) {
					this.buttons.get('back')!.setDisabled(true);
					this.buttons.get('forward')!.setDisabled(true);
				}

				if (index === 0) {
					this.buttons.get('back')!.setDisabled(true);
					this.buttons.get('forward')!.setDisabled(false);
				} else if (index === this.pages.length -1) {
					this.buttons.get('back')!.setDisabled(false);
					this.buttons.get('forward')!.setDisabled(true);
				} else {
					this.buttons.get('back')!.setDisabled(false);
					this.buttons.get('forward')!.setDisabled(false);
				}


				await this.msg!.edit({
					embeds: [this.pages[index]],
					components: [buttons],
				});

				mc.resetTimer();
			});

			mc.on('end', async () => {
				await this.msg!.edit({
					embeds: [this.pages[index]],
					components: []
				});
			});

			return this.msg;
        } catch (error) {
            console.log(error);
            logger.error(error);
            return null;
        }
    }
}
