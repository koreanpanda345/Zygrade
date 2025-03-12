import { PokemonClient } from "pokenode-ts";
import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";
import Databases from "../../databases/index.ts";
import {
  CommandInteraction,
  EmbedBuilder,
  Message,
  TextChannel,
} from "discord.js";
import { UserSettingsSchema } from "../../databases/models/Trainer/UserSettings.ts";

export default class HandleLevelsAndExpProcess extends BaseProcess {
  constructor() {
    super("handle-levels-and-exp");
  }

  override async invoke(
    pokemon: PokemonSchema,
    expAmount: number,
    interaction: CommandInteraction | Message,
  ) {
    pokemon.exp! += expAmount;

    const growthRate =
      (await new PokemonClient().getPokemonSpeciesByName(pokemon.species!))
        .growth_rate;

    if (pokemon.exp! >= pokemon.neededExp!) {
      pokemon.level += 1;
      pokemon.exp = 0;
      pokemon.neededExp = await ClientCache.invokeProcess(
        "handle-growth-rate",
        growthRate.name,
        pokemon.level,
      );

      const embed = new EmbedBuilder();

      embed.setTitle(`${pokemon.species} leveled up!`);
      embed.setDescription(`Now Level ${pokemon.level}`);
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
      embed.setImage(
        `https://play.pokemonshowdown.com/sprites/ani/${pokemon.species}.gif`,
      );
      embed.setColor("Green");

      const settings = await ClientCache.invokeProcess(
        "get-or-create-user-settings",
        pokemon.discordUserId,
      ) as UserSettingsSchema;

      if (!settings.displayLevelUpMessage) return;

      if (interaction instanceof Message) {
        await (interaction.channel as TextChannel).send({ embeds: [embed] });
      } else await interaction.followUp({ embeds: [embed] });
    }

    await Databases.PokemonCollection.updateOne({ _id: pokemon._id }, {
      $set: {
        level: pokemon.level,
        exp: pokemon.exp!,
        neededExp: pokemon.neededExp!,
      },
    });

    await ClientCache.invokeProcess(
      "handle-level-evolution",
      pokemon,
      interaction,
    );
  }
}
