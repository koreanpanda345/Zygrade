import { CommandInteraction, MessageFlags } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import Databases from "../../databases/index.ts";
import ClientCache from "../../core/cache.ts";

export default class UpdateTrainersCommand extends BaseCommand {
    constructor() {
        super('update-all-trainers', 'Updates all of the trainer\'s schemas', (data) => data);
    }

    override async invoke(interaction: CommandInteraction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        
        const trainers = Databases.TrainerCollection.find();

        const _trainers = await trainers.toArray();

        for (const trainer of _trainers) {
            // @ts-ignore
            if (trainer.inventory === []) trainer.inventory = { inBag: [], onPokemon: []};
            await ClientCache.invokeProcess('update-trainer', trainer);
        }
        await interaction.editReply({ content: "Updated all of the trainers."});

    }
}