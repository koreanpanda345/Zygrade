import { CommandInteraction } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import ClientCache from "../../core/cache.ts";

export default class DeleteTrainerCommand extends BaseCommand {
  constructor() {
    super(
      "delete-trainer",
      "Deletes a trainer. [REQUIRES DEV PERMS]",
      (data) => {
        data.addUserOption((options) => {
          options.setName("user");
          options.setDescription("The user to delete data for.");
          options.setRequired(true);
          return options;
        });
        return data;
      },
    );
    this.devOnly = true;
  }

  override async invoke(interaction: CommandInteraction) {
    const user = interaction.options.get("user")?.user;
    await interaction.deferReply();

    const result = await ClientCache.invokeProcess("delete-trainer", user!.id);

    if (!result) {
      return await interaction.editReply("Could not find that trainer data.");
    }

    return await interaction.editReply(`Deleted trainer data for ${user}`);
  }
}
