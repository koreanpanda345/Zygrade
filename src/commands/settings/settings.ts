import { CommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import ClientCache from "../../core/cache.ts";
import { UserSettingsSchema } from "../../databases/models/Trainer/UserSettings.ts";

export default class SettingsCommand extends BaseCommand {
  constructor() {
    super(
      "settings",
      "Allows you to edit your own user settings for the bot.",
      (data) => {
        data.addBooleanOption((option) => {
          option.setName("allow_encounter_pvp");
          option.setDescription(
            "Allows the chance of encounter other players when using the encounter command.",
          );
          return option;
        });
        data.addBooleanOption((option) => {
          option.setName("display_level_up_message");
          option.setDescription(
            "Allows the bot to send level up messages in discord.",
          );
          return option;
        });

        return data;
      },
    );
  }

  override async invoke(interaction: CommandInteraction) {
    const userSettings = await ClientCache.invokeProcess(
      "get-or-create-user-settings",
      interaction.user.id,
    ) as UserSettingsSchema;

    const allowEncounterPvp = interaction.options.get("allow_encounter_pvp")
      ?.value as boolean | undefined;
    const displayLevelUpMessage = interaction.options.get(
      "display_level_up_message",
    )?.value as boolean | undefined;

    if (allowEncounterPvp !== undefined) {
      userSettings.allowEncounterPvP = allowEncounterPvp;
    }
    if (displayLevelUpMessage !== undefined) {
      userSettings.displayLevelUpMessage = displayLevelUpMessage;
    }

    const embed = new EmbedBuilder();

    embed.setTitle(`User Settings`);
    embed.setAuthor({
      name: `${interaction.user.username}`,
      iconURL: interaction.user.displayAvatarURL(),
    });
    embed.addFields(
      {
        name: `Allow Encounter PVP: ${
          userSettings.allowEncounterPvP ? "✅" : "❌"
        }`,
        value:
          `If enabled, you will have a chance of encountering another player when using the \`/encounter\` command. [Defaults: ✅]`,
      },
      {
        name: `Display Level Up Message: ${
          userSettings.displayLevelUpMessage ? "✅" : "❌"
        }`,
        value:
          `If enabled, will send a message that your pokemon leveled up in the channel that you last sent a message in. [Defaults: ✅]`,
      },
    );

    await interaction.reply({
      embeds: [embed],
      flags: [MessageFlags.Ephemeral],
    });
  }
}
