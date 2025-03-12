import { ButtonInteraction } from "discord.js";
import BaseMonitor from "../../base/BaseMonitor.ts";
import ClientCache from "../../core/cache.ts";
import { ObjectReadStream, ObjectReadWriteStream } from "@pkmn/streams";

export default class HandleNPCBattleActionsMonitor extends BaseMonitor {
  constructor() {
    super("handle-npc-battle-actions");
  }

  override async invoke(interaction: ButtonInteraction) {
    try {
      const user = interaction.user;

      const battle = ClientCache.battles.get(user.id);

      if (!battle) return false; // do nothing

      // Lets make sure we are looking at the correct type.
      if (battle.get("type") !== "npc") return;

      const streams: {
        omniscient: ObjectReadWriteStream<string>;
        spectator: ObjectReadStream<string>;
        p1: ObjectReadWriteStream<string>;
        p2: ObjectReadWriteStream<string>;
        p3: ObjectReadWriteStream<string>;
        p4: ObjectReadWriteStream<string>;
      } = battle.get("streams");

      if (interaction.customId.startsWith("npc-move-")) {
        const move = interaction.customId.split("-")[2];
        streams.omniscient.write(`>p1 move ${move}`);
      }

      if (interaction.customId.startsWith("npc-switch-")) {
        const pokemon = interaction.customId.split("-")[2];
        streams.omniscient.write(
          `>p1 switch ${battle.get(`p1:team:${pokemon}:species`)}`,
        );
        battle.set(`p1:current`, pokemon);
      }

      if (interaction.customId.startsWith("npc-run")) {
        streams.omniscient.write(">forcewin p2");
      }

      await interaction.deferUpdate();
    } catch (error) {
      this.logger.error(error);
    }
  }
}
