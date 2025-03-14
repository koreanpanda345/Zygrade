import { CommandInteraction, EmbedBuilder } from "discord.js";
import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";
import { TrainerSchema } from "../../databases/models/Trainer/Trainer.ts";
import { Dex } from "@pkmn/dex";

export default class FoundItemProcess extends BaseProcess {
    constructor() {
        super('found-item')
    }

    override async invoke(interaction: CommandInteraction) {
      const trainer = await ClientCache.invokeProcess('get-trainer', interaction.user.id) as TrainerSchema;

      // TODO: make a global erroring system to use so everything is consistent.
      if (!trainer) return await interaction.editReply({ content: "Seems like I could not find any data for you."});

      const item = await ClientCache.invokeProcess('get-random-item', trainer.route, trainer.discordUserId);

      const itemData = Dex.items.get(item);

      if (!itemData.exists) return await interaction.editReply(`Something Happened!`);
        
      if (trainer.inventory.inBag.some(x => x.name === itemData.id)) trainer.inventory.inBag.find(x => x.name === itemData.id)!.amount += 1;
      else trainer.inventory.inBag.push({ name: itemData.id, amount: 1 });

      await ClientCache.invokeProcess('update-trainer', trainer);

      const embed = new EmbedBuilder();
      embed.setTitle(`You found a ${itemData.name}!`);
      embed.setDescription(`The item was placed in your inventory!`);
      embed.setColor(`Blue`);
      embed.addFields({ name: `Item: ${itemData.name}`, value: `Description: ${itemData.desc}`});

      await interaction.editReply({ embeds: [embed] });
    }
}