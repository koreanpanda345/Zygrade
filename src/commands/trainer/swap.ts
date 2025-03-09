import { CommandInteraction } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import Databases from "../../databases/index.ts";

export default class SwapCommand extends BaseCommand {
  constructor() {
    super("swap", "Swaps around the pokemon in your team.", (data) => {
      data.addNumberOption((option) => {
        option.setName("swapper");
        option.setDescription("The pokemon that will be swapping.");
        option.setRequired(true);
        return option;
      });
      data.addNumberOption((option) => {
        option.setName("swappe");
        option.setDescription("The pokemon to swap with");
        option.setRequired(true);
        return option;
      });
      return data;
    });
  }

  override async invoke(interaction: CommandInteraction) {
    await interaction.deferReply();
    const trainer = await Databases.TrainerCollection.findOne({
      discordUserId: interaction.user.id,
    });
    if (!trainer) {
      return await interaction.editReply("Could not find any data for you.");
    }

    const swapper = interaction.options.get("swapper")?.value as number;
    const swappe = interaction.options.get("swappe")?.value as number;

    const temp = trainer.team[swappe - 1];
    trainer.team[swappe - 1] = trainer.team[swapper - 1];
    trainer.team[swapper - 1] = temp;

    await Databases.TrainerCollection.updateOne({
      discordUserId: interaction.user.id,
    }, { $set: { team: trainer.team } });

    await interaction.editReply(
      `Swapped pokemon in positions ${swapper} and ${swappe}`,
    );
  }
}
