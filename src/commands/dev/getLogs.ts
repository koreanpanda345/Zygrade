import {
  AttachmentBuilder,
  CommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import logger from "../../utils/logger.ts";

export default class GetLogCommand extends BaseCommand {
  constructor() {
    super("get-log", "Grabs Logs [Dev Permissions Required]", (data) => {
      data.addStringOption((option) => {
        option.setName("log_type");
        option.setDescription("The type of log to get.");
        option.addChoices([
          {
            name: "Error",
            value: "errors",
          },
          {
            name: "Information",
            value: "info",
          },
          {
            name: "Warnings",
            value: "warnings",
          },
          {
            name: "Debugs",
            value: "debug",
          },
          {
            name: "Full",
            value: "full",
          },
        ]);
        option.setRequired(true);
        return option;
      });

      data.addNumberOption((option) => {
        option.setName("year");
        option.setDescription(
          `The year of the log. [Defaults: Current Year] [Format: xxxx]`,
        );
        return option;
      });

      data.addNumberOption((option) => {
        option.setName("month");
        option.setDescription(
          `The month of the log. [Defaults: Current Month] [ Formt: x] [Max: 12] [Min: 1]`,
        );
        option.setMaxValue(12);
        option.setMinValue(1);
        return option;
      });

      data.addNumberOption((option) => {
        option.setName("day");
        option.setDescription(
          `The day of the log. [Defaults: Current Day] [ Format: x] [Max: 31] [Min: 1]`,
        );
        option.setMaxValue(31);
        option.setMinValue(1);
        return option;
      });

      return data;
    });
    this.devOnly = true;
  }

  override async invoke(interaction: CommandInteraction) {
    const date = new Date(Date.now());
    const logType = interaction.options.get("log_type")?.value as string;
    const year = interaction.options.get("year")?.value as number ||
      date.getFullYear();
    const month = interaction.options.get("month")?.value as number ||
      date.getMonth();
    const day = interaction.options.get("day")?.value as number ||
      date.getDate();

    try {
      const decoder = new TextDecoder("utf-8");
      const file = Deno.readFileSync(
        `./logs/${year}/${month}/${day}/${logType}.log`,
      );

      const log = decoder.decode(file);

      const lines = log.split("\r\n").reverse();
      const embed = new EmbedBuilder();
      embed.setTitle(`${logType} logs`);
      embed.setTimestamp(new Date(year, month, day));
      embed.setColor("Random");

      for (let i = 0; i < (lines.length < 20 ? lines.length : 20); i++) {
        if (
          lines[i].split("\t↳")[0] === undefined ||
          lines[i].split("\t↳")[1] === undefined
        ) continue;
        embed.addFields({
          name: `${lines[i].split("\t↳")[0]}`,
          value: `${lines[i].split("\t↳")[1]}`,
        });
      }

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      logger.error('command - get-logs',error);
    }
  }
}
