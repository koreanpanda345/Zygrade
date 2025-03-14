import { CommandInteraction, EmbedBuilder } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import ClientCache from "../../core/cache.ts";
import { TrainerSchema } from "../../databases/models/Trainer/Trainer.ts";
import Databases from "../../databases/index.ts";
import { Dex } from "@pkmn/dex";

export default class LearnCommand extends BaseCommand {
  constructor() {
    super(
      "learn",
      "Allows you to see what your pokemon can learn, or makes them learn a new move.",
      (data) => {
        data.addNumberOption((option) => {
          option.setName("id");
          option.setDescription(
            'The id of the pokemon. You can find this out using the "/pc" command.',
          );
          option.setRequired(true);
          option.setMinValue(1);
          return option;
        });

        data.addStringOption((option) => {
          option.setName("move_name");
          option.setDescription("The move that you want the pokemon to learn.");
          return option;
        });

        data.addNumberOption((option) => {
          option.setName("slot");
          option.setDescription(
            "The move slot you would like the pokemon to learn the new move.",
          );
          option.setMinValue(1);
          option.setMaxValue(4);
          return option;
        });

        return data;
      },
    );
  }

  override async invoke(interaction: CommandInteraction) {
    await interaction.deferReply();
    const id = interaction.options.get("id")?.value as number;
    const moveName = interaction.options.get("move_name")?.value as
      | string
      | undefined;
    const moveSlot = interaction.options.get("slot")?.value as
      | number
      | undefined;

    const embed = new EmbedBuilder();

    const trainer = await ClientCache.invokeProcess(
      "get-trainer",
      interaction.user.id,
    ) as TrainerSchema;

    if (!trainer) {
      await interaction.editReply({
        content: "Could not find any data for you!",
      });
      return;
    }

    const pokemons = await Databases.PokemonCollection.find({
      discordUserId: interaction.user.id,
    });
    const pokemonArr = await pokemons.toArray();

    if (pokemonArr.length === 0) {
      await interaction.editReply({
        content: `It seems like you don't have any pokemon for some reason.`,
      });
      return;
    }

    if (!pokemonArr[id - 1]) {
      await interaction.editReply({
        content: `It doesn't seem like you have a pokemon under that id.`,
      });
      return;
    }

    const pokemon = pokemonArr[id - 1];
    const learnableMoves = await ClientCache.invokeProcess(
      "get-learnable-moves",
      pokemon.species,
      pokemon.level,
    ) as string[];

    if (!moveName) {
      embed.setTitle(
        `List of all of the learnable moves for ${pokemon.species}`,
      );

      const description: string[] = [];
      for (const move of learnableMoves) {
        const moveData = Dex.moves.get(move);
        if (pokemon.moves.includes(move)) {
          description.push(`❌ - ${moveData.name} | ${moveData.type}`);
        } else description.push(`✅ - ${moveData.name} | ${moveData.type}`);
      }

      embed.setDescription(description.join("\n"));
      embed.setFooter({ text: `✅ - Can Learn | ❌ - Already Learned` });

      embed.setColor("Random");

      await interaction.editReply({ embeds: [embed] });

      return;
    }

    if (!moveSlot) {
      await interaction.editReply({
        content:
          `Please try this command again, but supply the \`slot\` parameter so I know where to place the move.`,
      });
      return;
    }

    if (
      !learnableMoves.includes(
        moveName.replace(" ", "").replace("-", "").toLowerCase().trim(),
      )
    ) {
      await interaction.editReply({
        content: `There doesn't seem to be a move called \`${moveName}\``,
      });
      return;
    }

    if (
      pokemon.moves.includes(
        moveName.replace(" ", "").replace("-", "").toLowerCase().trim(),
      )
    ) {
      await interaction.editReply({
        content:
          `It already seems that ${pokemon.species} already learn ${moveName}`,
      });
      return;
    }

    if (pokemon.moves[moveSlot - 1]) {
      pokemon.moves[moveSlot - 1] = moveName.replace(" ", "").replace("-", "")
        .toLowerCase().trim();
    } else {pokemon.moves.push(
        moveName.replace(" ", "").replace("-", "").toLowerCase().trim(),
      );}

    await ClientCache.invokeProcess("update-pokemon", pokemon);
    embed.setTitle(`${pokemon.species} learned ${moveName}`);
    embed.setColor(`Green`);

    await interaction.editReply({ embeds: [embed] });
  }
}
