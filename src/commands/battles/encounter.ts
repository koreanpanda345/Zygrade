import { CommandInteraction, MessageFlags } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import ClientCache from "../../core/cache.ts";
import { TrainerSchema } from "../../databases/models/Trainer/Trainer.ts";
import { RouteSchema } from "../../databases/models/Game/Route.ts";

export default class EncounterCommand extends BaseCommand {
  constructor() {
    super("encounter", `Allows you to encounter wild pokemon`, (data) => data);
  }

  override async invoke(interaction: CommandInteraction) {
    await interaction.deferReply();
    if (ClientCache.battles.has(interaction.user.id)) {
      return await interaction.reply({
        content:
          "You are already in an encounter. Please finished your current encounter before starting a new one.",
        flags: MessageFlags.Ephemeral,
      });
    }
    const result = await ClientCache.invokeProcess(
      "check-trainer-and-route",
      interaction.user.id,
    ) as false | { trainer: TrainerSchema; route: RouteSchema };
    this.logger.debug(`${interaction.user.id} - ${result}`);
    if (!result) {
      await interaction.editReply("Something happened");
      return;
    }

    const route = result.route;

    if (route.trainers.length === 0 && route.items.length === 0) {
      return await ClientCache.invokeProcess("wild-battle", interaction);
    }
    const rng = Math.floor(Math.random() * 100);
    
    this.logger.debug(`RNG: ${rng}`);
    if (rng <= 60) { // 60%
      await ClientCache.invokeProcess("wild-battle", interaction);
    } else if (rng >= 60 && rng <= 90) { // 30%
      if (route.trainers.length === 0) await ClientCache.invokeProcess('wild-battle', interaction);
      else await ClientCache.invokeProcess("npc-battle", interaction);
    } else if (rng >= 90 && rng <= 100) { // 10%
      if (route.items.length === 0) await ClientCache.invokeProcess('wild-battle', interaction);
      else await ClientCache.invokeProcess('found-item', interaction);
    }
  }
}
