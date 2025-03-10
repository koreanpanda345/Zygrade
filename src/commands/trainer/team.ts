import {
  AttachmentBuilder,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import Databases from "../../databases/index.ts";
import { Dex } from "@pkmn/dex";

export default class TeamCommand extends BaseCommand {
  constructor() {
    super("team", "Displays your team", (data) => data);
  }

  override async invoke(interaction: CommandInteraction) {
    await interaction.deferReply();
    const trainer = await Databases.TrainerCollection.findOne({
      discordUserId: interaction.user.id,
    });

    if (!trainer) {
      return await interaction.editReply("Could not find any data on you!");
    }

    const trainerTeam = trainer.team;

    const pokemon = [];

    for (const poke of trainerTeam) {
      const _pokemon = await Databases.PokemonCollection.findOne({ _id: poke });

      if (!_pokemon) continue;

      pokemon.push(_pokemon);
    }

    const embed = new EmbedBuilder();

    let pos = 1;
    for (const poke of pokemon) {
      const dex = Dex.species.get(poke.species);
      embed.addFields({
        name: `Level ${poke.level} ${dex.name}`,
        value: `Position: ${pos}`,
      });
      pos += 1;
    }

    embed.setTitle("Your Team");

    await interaction.editReply({ embeds: [embed] });
  }
}
