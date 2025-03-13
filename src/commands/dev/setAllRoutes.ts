import { CommandInteraction, MessageFlags } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import Databases from "../../databases/index.ts";

export default class SetAllRoutesCommand extends BaseCommand {
    constructor() {
        super('set-all-routes', 'Sets all player routes to x route.', (data) => {
            data.addStringOption((option) => {
                option.setName('route');
                option.setDescription('The route to set to.');
                option.setRequired(true);
                return option;
            });
            data.addBooleanOption((option) => {
                option.setName('edit_allow_routes');
                option.setDescription("Enabled, will delete routes in the user's allowed routes if they don't exist.");
                return option;
            })
            return data;
        });

        this.devOnly = true;
    }

    override async invoke(interaction: CommandInteraction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const trainers = Databases.TrainerCollection.find();

      const route = await Databases.RouteCollection.findOne({ routeid: (interaction.options.get('route')?.value as string).toLowerCase().replaceAll(" ", "").trim()});
        const editAllowedRoutes = interaction.options.get('edit_allow_routes')?.value as boolean | undefined;
      if (!route) return await interaction.editReply({ content: "Could not find that route." });
      if (!trainers) return await interaction.editReply({ content: "Something Happened"});

      for (const trainer of await trainers.toArray()) {
        trainer.route = route.routeid;

        if (!editAllowedRoutes) {
            await Databases.TrainerCollection.updateOne({ discordUserId: trainer.discordUserId }, {$set: { route: trainer.route }});
            this.logger.info(`Changed route ${trainer.discordUserId} to ${trainer.route}`);
            continue
        }

        for (let i = 0; i < trainer.allowedRoutes.length; i ++) {
            const allowedRoute = trainer.allowedRoutes[i];
            

            const _route = await Databases.RouteCollection.findOne({ routeid: allowedRoute });
            if (_route) continue;

            trainer.allowedRoutes.splice(i);

            if (!trainer.allowedRoutes.some(x => x === route.routeid)) trainer.allowedRoutes.push(route.routeid);
        }
        await Databases.TrainerCollection.updateOne({ discordUserId: trainer.discordUserId }, {$set: { route: trainer.route, allowedRoutes: trainer.allowedRoutes}});
        this.logger.info(`Changed route ${trainer.discordUserId} to ${trainer.route} and updated allowed routes to ${trainer.allowedRoutes}`);
      }

      await interaction.editReply({ content: "Successfully set all routes for the trainers." });
    }
}