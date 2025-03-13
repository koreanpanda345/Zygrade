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
    if (ClientCache.battles.has(interaction.user.id)) {
      return await interaction.reply({
        content:
          "You are already in an encounter. Please finished your current encounter before starting a new one.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const trainer = await ClientCache.invokeProcess('get-trainer', interaction.user.id) as TrainerSchema;

    if (!trainer) return await interaction.reply("Could not find any data for you.");

    const route = await ClientCache.invokeProcess('get-route', trainer.route) as RouteSchema;

    if (!route) return await interaction.reply('Could not find your current route');

    if (route.trainers.length === 0) return await ClientCache.invokeProcess('wild-battle', interaction);
    
    const rng = Math.floor(Math.random() * 100);
    if (rng <= 70) { // 70%
      await ClientCache.invokeProcess("wild-battle", interaction);
    } else if (rng >= 70) { // 30%
      await ClientCache.invokeProcess("npc-battle", interaction);
    }
  }
}
