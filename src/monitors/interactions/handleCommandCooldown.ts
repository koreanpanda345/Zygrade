import { Collection, CommandInteraction, MessageFlags } from "discord.js";
import BaseMonitor from "../../base/BaseMonitor.ts";
import BaseCommand from "../../base/BaseCommand.ts";
import ClientCache from "../../core/cache.ts";

export default class HandleCommandCooldownMonitor extends BaseMonitor {
  constructor() {
    super("handle-command-cooldown");
  }

  override async invoke(interaction: CommandInteraction, command: BaseCommand) {
    if (!ClientCache.cooldowns.has(command.data.name)) {
      ClientCache.cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = ClientCache.cooldowns.get(command.data.name);
    const defaultCooldownDuration = 3;
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) *
      1_000;

    if (timestamps?.has(interaction.user.id)) {
      const expirationTime = timestamps.get(interaction.user.id)! +
        cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1_000);
        await interaction.reply({
          content:
            `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>`,
          flags: MessageFlags.Ephemeral,
        });
        return false;
      }
    }

    timestamps?.set(interaction.user.id, now);
    setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmount);
    return true;
  }
}
