import {
  CommandInteraction,
  EmbedBuilder,
  Message,
  TextChannel,
} from "discord.js";
import BaseMonitor from "../../base/BaseMonitor.ts";

export default class HandleErrorMonitor extends BaseMonitor {
  constructor() {
    super("handle-error");
  }

  override async invoke(ctx: Message | CommandInteraction, error: any) {
    const embed = new EmbedBuilder();

    embed.setTitle(`There was an error`);
    embed.setColor("Red");
    embed.setDescription(`\`\`\`${error}\`\`\``);

    if (ctx instanceof Message) {
      await (ctx.channel as TextChannel).send({ embeds: [embed] });
    } else {
      await ctx.reply({ embeds: [embed] });
    }
  }
}
