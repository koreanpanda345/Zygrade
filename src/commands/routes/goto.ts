import { CommandInteraction } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import ClientCache from "../../core/cache.ts";
import { RouteSchema } from "../../databases/models/Game/Route.ts";
import { TrainerSchema } from "../../databases/models/Trainer/Trainer.ts";
import Databases from "../../databases/index.ts";

export default class GoToCommand extends BaseCommand {
  constructor() {
    super("goto", "Allows you to go to different routes.", (data) => {
      data.addStringOption((option) => {
        option.setName("route_name");
        option.setDescription("The route you want to go to!");
        option.setRequired(true);
        return option;
      });
      return data;
    });
  }

  override async invoke(interaction: CommandInteraction) {
    await interaction.deferReply();
    const routeName = interaction.options.get("route_name")?.value as string;

    if (!routeName) return;

    const route = await ClientCache.invokeProcess(
      "get-route",
      routeName,
    ) as RouteSchema;

    if (!route) {
      // TODO: Add a message that will state that the route provided doesn't exist in the bot.
      await interaction.editReply({
        content: `It doesn't seem like \`${routeName}\` is a real route.`,
      });
      return;
    }

    const trainer = await ClientCache.invokeProcess(
      "get-trainer",
      interaction.user.id,
    ) as TrainerSchema;

    if (!trainer) {
      return;
    }

    if (!trainer.allowedRoutes.includes(route.routeid)) {
      await interaction.editReply({
        content:
          "You can not explore that area just yet. Try completing quests and catch more pokemon to unlock this area.",
      });
      return;
    }

    trainer.route = route.routeid!;

    await Databases.TrainerCollection.updateOne({
      discordUserId: trainer.discordUserId,
    }, { $set: { route: trainer.route } });

    await interaction.editReply({
      content: `You have traveled to ${route.name}!`,
    });
  }
}
