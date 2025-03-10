import { CommandInteraction, Message } from "discord.js";
import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";

export default class HandlePassiveExpProcess extends BaseProcess {
  constructor() {
    super("handle-passive-exp");
  }

  override async invoke(
    playerTeam: PokemonSchema[],
    amount: number = 1,
    interaction: CommandInteraction | Message,
  ) {
    for (const pokemon of playerTeam) {
      await ClientCache.invokeProcess(
        "handle-levels-and-exp",
        pokemon,
        amount,
        interaction,
      );
    }
  }
}
