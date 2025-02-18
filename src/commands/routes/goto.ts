import { CommandInteraction } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import ClientCache from "../../core/cache.ts";
import { RouteSchema } from "../../databases/models/Game/Route.ts";
import { TrainerSchema } from "../../databases/models/Trainer/Trainer.ts";

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
      return;
    }

    const trainer = await ClientCache.invokeProcess(
      "get-trainer",
      interaction.user.id,
    ) as TrainerSchema;

    if (!trainer) {
      return;
    }

    trainer.route = route.routeid!;

    // @ts-ignore
    await trainer.save();

    await interaction.editReply({
      content: `You have traveled to ${route.name}!`,
    });
  }
}
