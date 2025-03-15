import { CommandInteraction, MessageFlags } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import ClientCache from "../../core/cache.ts";

export default class DeleteBattleSessionCommand extends BaseCommand {
    constructor() {
        super('delete-battle-session', 'Deletes the battle session for someone [DEV PERMS REQUIRED]', (data) => {
            data.addUserOption((option) => {
                option.setName('user');
                option.setDescription('The user to delete battle session for.');
                option.setRequired(true);
                return option;
            })
            return data;
        });
    }

    override async invoke(interaction: CommandInteraction) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const user = interaction.options.get('user')?.user;

      if (!ClientCache.battles.has(user!.id)) return await interaction.editReply({ content: "This user does not have a battle session at the moment."});

      ClientCache.battles.delete(user!.id);

      await interaction.editReply({ content: `Deleted battle session for ${user!.id}`});
    }
}