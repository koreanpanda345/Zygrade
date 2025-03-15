import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, ComponentType, EmbedBuilder, MessageFlags } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import ClientCache from "../../core/cache.ts";
import { TrainerSchema } from "../../databases/models/Trainer/Trainer.ts";
import { Dex } from "@pkmn/dex";

export default class InventoryCommand extends BaseCommand {
    constructor() {
        super('inventory', 'Displays your current inventory!', (data) => data);
    }

    override async invoke(interaction: CommandInteraction) {
        await interaction.deferReply();

        const trainer = await ClientCache.invokeProcess('get-trainer', interaction.user.id) as TrainerSchema;

        if (trainer.inventory.inBag.length === 0) {
            await interaction.editReply({ content: "It seems like your bag is empty! maybe try finding some items!"});
            return;
        }
        let page = 1;
        const y = 24;
        const pages: EmbedBuilder[] = [];
        let pageIndex = 0;
        for (let i = 0; i < trainer.inventory.inBag.length; i++) {
            if (i >= y * page) page++;
            const index = page - 1;
            const embed = pages[index] ? pages[index] : new EmbedBuilder();

            const dex = Dex.items.get(trainer.inventory.inBag[i].name);

            if (!dex.exists) continue;

            embed.setTitle(`Inventory`);
            embed.addFields({
                name: `Item: ${dex.name} | Amount: ${trainer.inventory.inBag[i].amount}x`,
                value: `Description: ${dex.desc}`,
            });
            embed.setColor('Random');

            pages[index] = embed;
        }


        const buttons = {
            back: new ButtonBuilder()
              .setCustomId("back")
              .setStyle(ButtonStyle.Secondary)
              .setLabel("Back")
              .setEmoji("⬅"),
            forward: new ButtonBuilder()
              .setCustomId("forward")
              .setStyle(ButtonStyle.Secondary)
              .setLabel("Forward")
              .setEmoji("➡"),
          };

          const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
            buttons.back,
            buttons.forward,
          );
          const msg = await interaction.editReply({
            embeds: [pages[pageIndex]],
            components: [button],
          });
      
          const buttonCollector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60_000,
          });
          buttonCollector.on("collect", async (i) => {
            if (i.user.id !== interaction.user.id) {
              return await i.reply({
                content: "You are not allowed to do this!",
                flags: MessageFlags.Ephemeral,
              });
            }
      
            await i.deferUpdate();
      
            if (i.customId === "back" && pageIndex > 0) return pageIndex--;
            else if (i.customId === "forward" && pageIndex < pages.length - 1) {
              pageIndex++;
            }
      
            if (pages.length === 1) {
              buttons.back.setDisabled(true);
              buttons.forward.setDisabled(true);
            }
      
            if (pageIndex === 0) {
              buttons.back.setDisabled(true);
              buttons.forward.setDisabled(false);
            } else if (pageIndex === pages.length - 1) {
              buttons.back.setDisabled(false);
              buttons.forward.setDisabled(true);
            } else {
              buttons.back.setDisabled(false);
              buttons.forward.setDisabled(false);
            }
      
            await msg.edit({
              embeds: [pages[pageIndex]],
              components: [button],
            });
      
            buttonCollector.resetTimer();
          });
      
          buttonCollector.on("end", async () => {
            await msg.edit({
              embeds: [pages[pageIndex]],
              components: [],
            });
          });
    }
}