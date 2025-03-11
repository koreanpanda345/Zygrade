import { CommandInteraction, MessageFlags } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import ClientCache from "../../core/cache.ts";

export default class EncounterCommand extends BaseCommand {
  constructor() {
    super("encounter", `Allows you to encounter wild pokemon`, (data) => data);
  }

  override async invoke(interaction: CommandInteraction) {

    if (ClientCache.battles.has(interaction.user.id)) return await interaction.reply({ content: 'You are already in an encounter. Please finished your current encounter before starting a new one.', flags: MessageFlags.Ephemeral });
    const rng = Math.floor(Math.random() * 100);
    console.log(rng);
    if (rng <= 70) { // 70%
      await ClientCache.invokeProcess("wild-battle", interaction);
    } else if (rng >= 70) { // 30%
      await ClientCache.invokeProcess("npc-battle", interaction);
    }
  }
}
