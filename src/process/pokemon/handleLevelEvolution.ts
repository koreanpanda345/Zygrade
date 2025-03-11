import {
  CommandInteraction,
  EmbedBuilder,
  Message,
  TextChannel,
} from "discord.js";
import BaseProcess from "../../base/BaseProcess.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";
import { Dex } from "@pkmn/dex";
import Databases from "../../databases/index.ts";

export default class HandleLevelEvolutionProcess extends BaseProcess {
  constructor() {
    super("handle-level-evolution");
  }

  override async invoke(
    pokemon: PokemonSchema,
    interaction: CommandInteraction | Message,
  ) {
    const dex = Dex.species.get(pokemon.species);
    console.log(pokemon);
    if (!dex.exists) return false;

    if (!dex.evos) return false;

    if (dex.evos && dex.evos.length <= 0) return false;

    const nextEvoDex = Dex.species.get(dex.evos[0]);

    if (!nextEvoDex.exists) return false;

    if (!nextEvoDex.evoLevel) return false;

    if (nextEvoDex.evoLevel - 1 >= pokemon.level) return false;

    pokemon.species = nextEvoDex.id;
    if (dex.abilities[0] === pokemon.ability) {
      pokemon.ability = nextEvoDex.abilities[0];
    }
    if (dex.abilities[1] === pokemon.ability) {
      pokemon.ability = nextEvoDex.abilities[1]!;
    }
    if (dex.abilities["H"] === pokemon.ability) {
      pokemon.ability = nextEvoDex.abilities["H"]!;
    }

    await Databases.PokemonCollection.updateOne({
      _id: pokemon._id,
    }, { $set: { species: pokemon.species, ability: pokemon.ability } });

    const embed = new EmbedBuilder();

    embed.setTitle(`${dex.name} Evolved into ${nextEvoDex.name}!`);
    embed.setImage(
      `https://play.pokemonshowdown.com/sprites/ani/${nextEvoDex.id}.gif`,
    );
    embed.setAuthor({
      name: `${
        interaction instanceof Message
          ? interaction.author.username
          : interaction.user.username
      }`,
      iconURL: interaction instanceof Message
        ? interaction.author.displayAvatarURL()
        : interaction.user.displayAvatarURL(),
    });
    embed.setColor("Green");

    if (interaction instanceof Message) {
      await (interaction.channel as TextChannel).send({ embeds: [embed] });
    } else await interaction.followUp({ embeds: [embed] });
  }
}
