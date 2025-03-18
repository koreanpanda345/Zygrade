import { CommandInteraction, MessageFlags } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import ClientCache from "../../core/cache.ts";
import Databases from "../../databases/index.ts";

export default class DeletePokemonCommand extends BaseCommand {
  constructor() {
    super(
      "delete-pokemon",
      "Deletes a pokemon from a user [DEV PERMS REQUIRED]",
      (data) => {
        data.addUserOption((option) => {
          option.setName("user");
          option.setDescription("The user to delete the pokemon from");
          option.setRequired(true);
          return option;
        });

        data.addNumberOption((option) => {
          option.setName("id");
          option.setDescription(`The pokemon's id`);
          option.setRequired(true);
          return option;
        });
        return data;
      },
    );
    this.devOnly = true;
  }

  override async invoke(interaction: CommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const user = interaction.options.get("user")?.user!;
    const id = interaction.options.get("id")?.value! as number;

    const trainer = await ClientCache.invokeProcess("get-trainer", user.id);

    if (!trainer) {
      return await interaction.editReply(
        `There is no trainer that has the id of ${user.id}`,
      );
    }

    const pokemon = Databases.PokemonCollection.find({
      discordUserId: user.id,
    });

    const pokemons = await pokemon.toArray();

    const pkmn = pokemons[id - 1];

    if (!pkmn) {
      return await interaction.editReply(`There is no pokemon under that id.`);
    }

    await Databases.PokemonCollection.deleteOne({ _id: pkmn._id });

    await interaction.editReply(
      `Deleted Level ${pkmn.level} ${pkmn.species} from ${user.username} (ID: ${user.id})`,
    );
  }
}
