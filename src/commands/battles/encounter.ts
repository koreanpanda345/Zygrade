import { CommandInteraction } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import ClientCache from "../../core/cache.ts";

export default class EncounterCommand extends BaseCommand {
  constructor() {
    super("encounter", `Allows you to encounter wild pokemon`, (data) => data);
  }

  override async invoke(interaction: CommandInteraction) {
    const rng = Math.floor(Math.random() * 2);
    console.log(rng);
    if (rng == 0 || rng == 2) {
      await ClientCache.invokeProcess("wild-battle", interaction);
    } else if (rng == 1) {
      await ClientCache.invokeProcess("npc-battle", interaction);
    }
  }
}
