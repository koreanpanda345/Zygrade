import { AttachmentBuilder, CommandInteraction, EmbedBuilder } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import Databases from "../../databases/index.ts";

export default class TeamCommand extends BaseCommand {
    constructor() {
        super('team', 'Displays your team', (data) => data);
    }

    override async invoke(interaction: CommandInteraction) {
        await interaction.deferReply();
      const trainer = await Databases.TrainerCollection.findOne({ discordUserId: interaction.user.id });

      if (!trainer) {
        return await interaction.editReply("Could not find any data on you!");
      }

      const trainerTeam = trainer.team;

      const pokemon = [];

      for (const poke of trainerTeam) {
        const _pokemon = await Databases.PokemonCollection.findOne({ _id: poke.id });

        if (!_pokemon) continue;

        pokemon.push(_pokemon);
      }

      const embed = new EmbedBuilder();

      for (const poke of pokemon) {
        embed.addFields({ name: `Level ${poke.level} ${poke.species}`, value: `\u200b`});
      }

      embed.setTitle('Your Team');
      
      await interaction.editReply({ embeds: [embed] });
    }
}