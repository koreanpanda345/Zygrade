import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  ComponentType,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import Databases from "../../databases/index.ts";
import { Dex } from "@pkmn/dex";

export default class PCCommand extends BaseCommand {
  constructor() {
    super(
      "pc",
      "Allows you to see all of the pokemon you have caught!",
      (data) => data,
    );
  }

  override async invoke(interaction: CommandInteraction) {
    await interaction.deferReply();

    const pokemons = Databases.PokemonCollection.find({
      discordUserId: interaction.user.id,
    });

    const list = await pokemons.toArray(); // This is x
    let page = 1; // This is a
    const y = 24; // this is y
    const pages: EmbedBuilder[] = []; // This i z
    let pageIndex = 0;
    for (let i = 0; i < list.length; i++) {
      if (i >= y * page) page++;
      const index = page - 1;
      const embed = pages[index] ? pages[index] : new EmbedBuilder();
      const dex = Dex.species.get(list[i].species);
      embed.setTitle(`PC`);
      embed.addFields({
        name: `ID: ${i + 1} - Level ${list[i].level} ${dex.name}`,
        value: `Ability: ${list[i].ability}`,
      });

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
