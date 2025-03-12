import { CommandInteraction } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import Databases from "../../databases/index.ts";
import ClientCache from "../../core/cache.ts";
import { TrainerSchema } from "../../databases/models/Trainer/Trainer.ts";
import { ObjectId } from "mongodb";

export default class MoveCommand extends BaseCommand {
  constructor() {
    super("move", "Moves a pokemon to your team from the pc.", (data) => {
      data.addNumberOption((option) => {
        option.setName("slot");
        option.setDescription("The team slot to place the pokemon in");
        option.setMaxValue(6);
        option.setMinValue(1);
        option.setRequired(true);
        return option;
      });

      data.addNumberOption((option) => {
        option.setName("id");
        option.setDescription("The pokemon id in the pc.");
        option.setRequired(true);
        return option;
      });
      return data;
    });
  }

  override async invoke(interaction: CommandInteraction) {
    await interaction.deferReply();
    const slot = interaction.options.get("slot")?.value as number - 1;
    const id = interaction.options.get("id")?.value as number - 1;

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

    const arr = await pokemons.toArray();

    if (!arr[id]) {
      await interaction.editReply({
        content: `Doesn't seem like you have a pokemon under that id.`,
      });
      return;
    }

    trainer.team[slot] = arr[id]._id as ObjectId;

    await Databases.TrainerCollection.updateOne({
      discordUserId: interaction.user.id,
    }, { $set: { team: trainer.team } });

    await interaction.editReply(
      `Added Level ${arr[id].level} ${
        arr[id].species
      } to your team in slot ${slot + 1}`,
    );
  }
}
