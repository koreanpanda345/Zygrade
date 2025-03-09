import { ButtonInteraction, CommandInteraction } from "discord.js";
import ClientCache from "../../core/cache.ts";
import BaseMonitor from "../../base/BaseMonitor.ts";
import { ObjectReadStream, ObjectReadWriteStream } from "@pkmn/streams";
import { RandomPlayerAI } from "@pkmn/sim";

export default class HandleWildBattleActionsMonitor extends BaseMonitor {
  constructor() {
    super("handle-wild-battle-actions");
  }

  override async invoke(interaction: ButtonInteraction) {
    try {
      const user = interaction.user;

      const battle = ClientCache.battles.get(user.id);

      if (!battle) return false; // do nothing

      const streams: {
        omniscient: ObjectReadWriteStream<string>;
        spectator: ObjectReadStream<string>;
        p1: ObjectReadWriteStream<string>;
        p2: ObjectReadWriteStream<string>;
        p3: ObjectReadWriteStream<string>;
        p4: ObjectReadWriteStream<string>;
      } = battle.get("streams");

      if (interaction.customId.startsWith("move-")) {
        const move = interaction.customId.split("-")[1];
        streams.omniscient.write(`>p1 move ${move}`);
        await interaction.deferUpdate();
      }

      if (interaction.customId.startsWith("switch-")) {
        const pokemon = interaction.customId.split("-")[1];
        streams.omniscient.write(
          `>p1 switch ${battle.get(`p1:team:${pokemon}:species`)}`,
        );
        battle.set(`p1:current`, pokemon);
        await interaction.deferUpdate();
      }

      if (interaction.customId.startsWith("run")) {
        streams.omniscient.write(`>forcewin p2`);
        await interaction.deferUpdate();
      }
    } catch (error) {
      console.log(error);
    }
  }
}
