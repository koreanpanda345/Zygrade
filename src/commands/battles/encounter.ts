import { CommandInteraction } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import ClientCache from "../../core/cache.ts";

export default class EncounterCommand extends BaseCommand {
  constructor() {
    super("encounter", `Allows you to encounter wild pokemon`, (data) => data);
  }

  override async invoke(interaction: CommandInteraction) {
    await ClientCache.invokeProcess("wild-battle", interaction);
  }
}
