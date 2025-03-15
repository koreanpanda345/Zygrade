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

  override async invoke(interaction: CommandInteraction, error: any) {
    const embed = new EmbedBuilder();

    embed.setTitle(`There was an error`);
    embed.setColor("Red");
    embed.setDescription(`\`\`\`${error}\`\`\``);

    if (interaction.deferred) await interaction.editReply({ embeds: [embed] });
    else if (interaction.replied) await interaction.followUp({ embeds: [embed] });
    else await interaction.reply({ embeds: [embed]});
    
  }
}
