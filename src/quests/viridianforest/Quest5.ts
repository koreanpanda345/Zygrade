import { CommandInteraction } from "discord.js";
import BaseQuest from "../../base/BaseQuest.ts";
import { RouteSchemaTrainers } from "../../databases/models/Game/Route.ts";
import Databases from "../../databases/index.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";
import ClientCache from "../../core/cache.ts";
import { Dex } from "@pkmn/dex";
import { PokemonClient } from "pokenode-ts";

export default class KantoQuest5 extends BaseQuest {
    constructor() {
        super("Beat 3 Bug Catchers in Viridian Forest", "kanto_quest_5", "beat", "You must defeat 3 Bug Catchers in Viridian Forest");
        this.progress = [0, 3];
    }

    override async invoke(userid: string, didWin: boolean, npc: RouteSchemaTrainers, location: string, interaction: CommandInteraction) {
      const trainer = await Databases.TrainerCollection.findOne({
        discordUserId: userid,
      });

      if(!trainer) return;
      if (!didWin) return;
      if (location !== "viridianforest") return;
      if (!npc.name.startsWith("Bug Catcher")) return;

      const canGetReward = await this.updateProgress(userid, 1) as boolean;

      if (canGetReward) {
        const result = await this.getRewards(userid);
        await interaction.followUp({ content: result });
      }
    }

    override async getRewards(userid: string) {
      const trainer = await Databases.TrainerCollection.findOne({
        discordUserId: userid,
      });

      if (!trainer) return;

      trainer.money += 1000;
      trainer.allowedRoutes.push('kantoroute3');
      
      const eeveeReward = {
        discordUserId: userid,
        species: "eevee",
        level: 5,
        shiny: false,
        exp: 0,
        neededExp: await ClientCache.invokeProcess('handle-growth-rate', (await new PokemonClient().getPokemonSpeciesByName('eevee')).growth_rate.name, 5),
        evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
        ivs: await ClientCache.invokeProcess('get-random-ivs'),
        moves: await ClientCache.invokeProcess('get-random-moves', 'eevee', 5),
        ability: Dex.species.get('eevee').abilities[0],
        nature: (await ClientCache.invokeProcess('get-random-nature')).name,
      } as PokemonSchema;

      await Databases.TrainerCollection.updateOne({ discordUserId: userid }, { $set: { money: trainer.money, allowedRoutes: trainer.allowedRoutes }});

      await ClientCache.invokeProcess('add-pokemon', eeveeReward);

      return 'You received 1000 coins, and got a new Pokemon! You can also go to `Kanto Route 3`!';
    }
}