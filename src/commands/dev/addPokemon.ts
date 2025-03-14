import { CommandInteraction, MessageFlags } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import ClientCache from "../../core/cache.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";
import { Dex } from "@pkmn/dex";
import { PokemonClient } from "pokenode-ts";

export default class AddPokemonCommand extends BaseCommand {
  constructor() {
    super(
      "add-pokemon",
      "Adds a pokemon to a trainer. [REQUIRES DEV PERMS]",
      (data) => {
        data.addUserOption((options) => {
          options.setName("user");
          options.setDescription("The user to add the pokemon to.");
          options.setRequired(true);
          return options;
        });

        data.addStringOption((options) => {
          options.setName("species");
          options.setDescription("The pokemon");
          options.setRequired(true);
          return options;
        });

        data.addNumberOption((option) => {
          option.setName("level");
          option.setDescription("The level of the pokemon");
          option.setMaxValue(100);
          option.setMinValue(1);
          return option;
        });

        data.addBooleanOption((option) => {
          option.setName("shiny");
          option.setDescription("Make the pokemon to be shiny.");
          return option;
        });

        data.addStringOption((option) => {
          option.setName("ability");
          option.setDescription("The ability of the pokemon");
          return option;
        });

        data.addStringOption((option) => {
          option.setName("nature");
          option.setDescription("The nature of the pokemon");
          return option;
        });

        data.addNumberOption((option) => {
          option.setName("iv_hp");
          option.setDescription("The iv for hp");
          option.setMaxValue(31);
          option.setMinValue(0);
          return option;
        });

        data.addNumberOption((option) => {
          option.setName("iv_atk");
          option.setDescription("The iv for atk");
          option.setMaxValue(31);
          option.setMinValue(0);
          return option;
        });
        data.addNumberOption((option) => {
          option.setName("iv_def");
          option.setDescription("The iv for def");
          option.setMaxValue(31);
          option.setMinValue(0);
          return option;
        });
        data.addNumberOption((option) => {
          option.setName("iv_spa");
          option.setDescription("The iv for spa");
          option.setMaxValue(31);
          option.setMinValue(0);
          return option;
        });
        data.addNumberOption((option) => {
          option.setName("iv_spd");
          option.setDescription("The iv for spd");
          option.setMaxValue(31);
          option.setMinValue(0);
          return option;
        });
        data.addNumberOption((option) => {
          option.setName("iv_spe");
          option.setDescription("The iv for spe");
          option.setMaxValue(31);
          option.setMinValue(0);
          return option;
        });
        data.addNumberOption((option) => {
          option.setName("ev_hp");
          option.setDescription("The iv for hp");
          option.setMaxValue(252);
          option.setMinValue(0);
          return option;
        });
        data.addNumberOption((option) => {
          option.setName("ev_atk");
          option.setDescription("The iv for atk");
          option.setMaxValue(252);
          option.setMinValue(0);
          return option;
        });
        data.addNumberOption((option) => {
          option.setName("ev_def");
          option.setDescription("The iv for def");
          option.setMaxValue(252);
          option.setMinValue(0);
          return option;
        });
        data.addNumberOption((option) => {
          option.setName("ev_spa");
          option.setDescription("The iv for spa");
          option.setMaxValue(252);
          option.setMinValue(0);
          return option;
        });
        data.addNumberOption((option) => {
          option.setName("ev_spd");
          option.setDescription("The iv for spd");
          option.setMaxValue(252);
          option.setMinValue(0);
          return option;
        });
        data.addNumberOption((option) => {
          option.setName("ev_spe");
          option.setDescription("The iv for spe");
          option.setMaxValue(252);
          option.setMinValue(0);
          return option;
        });
        data.addStringOption((option) => {
          option.setName("move_1");
          option.setDescription("Add this move to slot 1");
          return option;
        });
        data.addStringOption((option) => {
          option.setName("move_2");
          option.setDescription("Add this move to slot 2");
          return option;
        });
        data.addStringOption((option) => {
          option.setName("move_3");
          option.setDescription("Add this move to slot 3");
          return option;
        });
        data.addStringOption((option) => {
          option.setName("move_4");
          option.setDescription("Add this move to slot 4");
          return option;
        });
        return data;
      },
    );

    this.devOnly = true;
  }

  override async invoke(interaction: CommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const user = interaction.options.get("user")?.user;
    const species = interaction.options.get("species");
    const level = interaction.options.get("level")?.value === undefined
      ? 100
      : Number(interaction.options.get("level")!.value);
    const shiny = interaction.options.get("shiny")?.value || false;
    const ability = interaction.options.get("ability")?.value || undefined;
    const nature = interaction.options.get("nature")?.value ||
      await ClientCache.invokeProcess("get-random-nature");
    const ivs = await ClientCache.invokeProcess(
      "get-random-ivs",
      interaction.options.get("iv_hp")?.value === undefined
        ? -1
        : Number(interaction.options.get("iv_hp")!.value),
      interaction.options.get("iv_atk")?.value === undefined
        ? -1
        : Number(interaction.options.get("iv_atk")!.value),
      interaction.options.get("iv_def")?.value === undefined
        ? -1
        : Number(interaction.options.get("iv_def")!.value),
      interaction.options.get("iv_spa")?.value === undefined
        ? -1
        : Number(interaction.options.get("iv_spa")!.value),
      interaction.options.get("iv_spd")?.value === undefined
        ? -1
        : Number(interaction.options.get("iv_spd")!.value),
      interaction.options.get("iv_spe")?.value === undefined
        ? -1
        : Number(interaction.options.get("iv_spe")!.value),
    );
    const evs = {
      hp: interaction.options.get("ev_hp")?.value === undefined
        ? 0
        : Number(interaction.options.get("ev_hp")!.value),
      atk: interaction.options.get("ev_atk")?.value === undefined
        ? 0
        : Number(interaction.options.get("ev_atk")!.value),
      def: interaction.options.get("ev_def")?.value === undefined
        ? 0
        : Number(interaction.options.get("ev_def")!.value),
      spa: interaction.options.get("ev_spa")?.value === undefined
        ? 0
        : Number(interaction.options.get("ev_spa")!.value),
      spd: interaction.options.get("ev_spd")?.value === undefined
        ? 0
        : Number(interaction.options.get("ev_spd")!.value),
      spe: interaction.options.get("ev_spe")?.value === undefined
        ? 0
        : Number(interaction.options.get("ev_spe")!.value),
    };
    const moves = await ClientCache.invokeProcess(
      "get-learnable-moves",
      species?.value as string,
      level,
    ) as string[];
    const moveset = moves.length < 4 ? moves : moves.reverse().splice(0, 4);
    const move_1 = interaction.options.get("move_1");
    const move_2 = interaction.options.get("move_2");
    const move_3 = interaction.options.get("move_3");
    const move_4 = interaction.options.get("move_4");

    if (move_1?.value) {
      moves.at(0)
        ? moves[0] = move_1.value as string
        : moves.push(move_1.value as string);
    }
    if (move_2?.value) {
      moves.at(1)
        ? moves[1] = move_2.value as string
        : moves.push(move_2.value as string);
    }
    if (move_3?.value) {
      moves.at(2)
        ? moves[2] = move_3.value as string
        : moves.push(move_3.value as string);
    }
    if (move_4?.value) {
      moves.at(3)
        ? moves[3] = move_4.value as string
        : moves.push(move_4.value as string);
    }

    const dexSpecies = Dex.species.get(species?.value?.toString()!);
    if (!dexSpecies.exists) {
      return await interaction.editReply(
        `The pokemon species ${species?.value} doesn't seem to exist.`,
      );
    }

    const growthRate =
      (await new PokemonClient().getPokemonSpeciesByName(dexSpecies.id))
        .growth_rate.name;

    const neededExp = await ClientCache.invokeProcess(
      "handle-growth-rate",
      growthRate,
      level,
    );
    const pokemon: PokemonSchema = {
      species: dexSpecies.id,
      discordUserId: user?.id,
      shiny: shiny as boolean,
      level,
      exp: 0,
      neededExp: neededExp,
      ability: ability ? ability as string : dexSpecies.abilities[0],
      nature: nature.name,
      ivs,
      evs,
      moves: moveset,
    };

    const result = await ClientCache.invokeProcess(
      "add-pokemon",
      pokemon,
    ) as boolean;

    if (!result) {
      return await interaction.editReply(
        "Something happened and could not add the pokemon.",
      );
    }

    return await interaction.editReply(
      `Added Level ${level} ${dexSpecies.fullname} to ${user}`,
    );
  }
}
