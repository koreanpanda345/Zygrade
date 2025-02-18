import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  ComponentType,
  EmbedBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextChannel,
} from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import { Dex, Nature } from "@pkmn/dex";
import ClientCache from "../../core/cache.ts";
import {
  PokemonSchema,
  PokemonSchemaStats,
} from "../../databases/models/Trainer/Pokemon.ts";
import { PokemonClient } from "pokenode-ts";
import Databases from "../../databases/index.ts";
import logger from "../../utils/logger.ts";

export default class StartCommand extends BaseCommand {
  constructor() {
    super("start", "Allows you to start your adventure", (data) => data);
  }

  override async invoke(interaction: CommandInteraction) {
    const starterPokemon = [
      ["Gen 1", "bulbasaur", "charmander", "squirtle"],
      ["Gen 2", "chikorita", "cyndaquil", "totodile"],
      ["Gen 3", "treecko", "torchic", "mudkip"],
      ["Gen 4", "turtwig", "chimchar", "Piplup"],
      ["Gen 5", "snivy", "tepig", "oshawott"],
      ["Gen 6", "chespin", "fennekin", "froakie"],
      ["Gen 7", "rowlet", "litten", "popplio"],
      ["Gen 8", "grookey", "scorbunny", "sobble"],
      ["Gen 9", "sprigatito", "fuecoco", "quaxly"],
    ];

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

    const pages: EmbedBuilder[] = [];
    const menus: StringSelectMenuBuilder[] = [];

    try {
      await interaction.deferReply();

      for (const gen of starterPokemon) {
        const embed = new EmbedBuilder();
        const select = new StringSelectMenuBuilder().setCustomId(
          "select_starter",
        );
        embed.setTitle(`Starter Pokemon`);
        embed.setDescription(
          `Welcome to the Land of Pokemon!\n` +
            `Here you can catch pokemon, trade pokemon, and even battle with them!\n` +
            `My name is Discord Pokemon, or Dismon for short. I will be your PokeDex as well your Professor!\n` +
            `It seems like you don't have a pokemon yet. Lets fix that!\n` +
            `Below is a list of pokemon that you can pick from!\n`,
        );
        gen.shift();
        for (const pokemon of gen) {
          const data = Dex.species.get(pokemon);
          select.addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel(`${data.name}`)
              .setDescription(`Type: ${data.types.join("|")}`)
              .setValue(`${data.id}`),
          );
          embed.addFields({
            name: `${data.name}`,
            value: `Type: ${data.types.join("|")}`,
          });
        }

        pages.push(embed);
        menus.push(select);
      }

      if (pages.length === 1) {
        return await interaction.editReply({
          embeds: pages,
          components: [],
        });
      }

      let index = 0;

      const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
        buttons.back,
        buttons.forward,
      );
      const selectMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
          menus[index],
        );

      const msg = await interaction.editReply({
        embeds: [pages[index]],
        components: [button, selectMenu],
      });

      const buttonCollector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60_000,
      });

      const selectCollector = msg.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
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

        if (i.customId === "back" && index > 0) return index--;
        else if (i.customId === "forward" && index < pages.length - 1) index++;

        if (pages.length === 1) {
          buttons.back.setDisabled(true);
          buttons.forward.setDisabled(true);
        }

        if (index === 0) {
          buttons.back.setDisabled(true);
          buttons.forward.setDisabled(false);
        } else if (index === pages.length - 1) {
          buttons.back.setDisabled(false);
          buttons.forward.setDisabled(true);
        } else {
          buttons.back.setDisabled(false);
          buttons.forward.setDisabled(false);
        }

        await msg.edit({
          embeds: [pages[index]],
          components: [button, selectMenu.setComponents(menus[index])],
        });

        buttonCollector.resetTimer();
      });

      buttonCollector.on("end", async () => {
        await msg.edit({
          embeds: [pages[index]],
          components: [],
        });
      });
      selectCollector.on("collect", async (i) => {
        const species = Dex.species.get(i.values[0]);
        const moves = (await ClientCache.invokeProcess(
          "get-learnable-moves",
          species.name,
          5,
        )) as string[];
        const nature =
          (await ClientCache.invokeProcess("get-randome-nature")) as Nature;
        const ivs = (await ClientCache.invokeProcess(
          "get-random-ivs",
        )) as PokemonSchemaStats;
        const growthRate =
          (await new PokemonClient().getPokemonSpeciesByName(species.id))
            .growth_rate.name;
        const neededExp = await ClientCache.invokeProcess(
          "handle-growth-rate",
          growthRate,
          5,
        );
        const pokemon: PokemonSchema = {
          discordUserId: i.user.id,
          species: species.id,
          shiny: false,
          level: 5,
          exp: 0,
          neededExp: neededExp,
          ability: species.abilities[0],
          ivs,
          evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
          moves,
          nature: nature.name,
        };

        const _id = await Databases.PokemonCollection.insertOne(pokemon);
        await ClientCache.invokeProcess(
          "create-trainer",
          i.user.id,
          _id.insertedId,
        );
        await (msg.channel as TextChannel).send(
          `You received a **Level 5** ${species.name}!`,
        );
        selectCollector.stop();
      });

      selectCollector.on("end", async () => {
        await msg.edit({
          embeds: [pages[index]],
          components: [],
        });
      });
    } catch (error) {
      console.error(error);
      logger.error(error);
    }
  }
}
