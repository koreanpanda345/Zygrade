import { CommandInteraction, MessageFlags } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import ClientCache from "../../core/cache.ts";
import { TrainerSchema } from "../../databases/models/Trainer/Trainer.ts";
import { RouteSchema } from "../../databases/models/Game/Route.ts";
import logger from "../../utils/logger.ts";

export default class EncounterCommand extends BaseCommand {
  constructor() {
    super("encounter", `Allows you to encounter wild pokemon`, (data) => data);
  }

  override async invoke(interaction: CommandInteraction) {
    await interaction.deferReply();
    if (ClientCache.battles.has(interaction.user.id)) {
      return await interaction.editReply({
        content:
          "You are already in an encounter. Please finished your current encounter before starting a new one.",
      });
    }
    const result = await ClientCache.invokeProcess(
      "check-trainer-and-route",
      interaction.user.id,
    ) as false | { trainer: TrainerSchema; route: RouteSchema };
    logger.debug('command - encounter', `${interaction.user.id} - ${result}`);
    if (!result) {
      await interaction.editReply("Something happened");
      return;
    }

    const route = result.route;

    // Disabling it because my brain hurt so only wild battle for now.
    return await ClientCache.invokeProcess('wild-battle', interaction);

    // if (route.trainers.length === 0) {
    //   return await ClientCache.invokeProcess("wild-battle", interaction);
    // }

    // const rng = Math.floor(Math.random() * 100);
    // if (rng <= 70) { // 70%
    //   await ClientCache.invokeProcess("wild-battle", interaction);
    // } else if (rng >= 70) { // 30%
    //   await ClientCache.invokeProcess("npc-battle", interaction);
    // }
  }
}
