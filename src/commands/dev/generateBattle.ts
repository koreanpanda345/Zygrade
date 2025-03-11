import { CommandInteraction } from "discord.js";
import BaseCommand from "../../base/BaseCommand.ts";
import ClientCache from "../../core/cache.ts";

export default class GenerateBattle extends BaseCommand {
  constructor() {
    super("generate-battle", "Generates a battle to test things.", (data) => {
      data.addStringOption((option) => {
        option.setName("type");
        option.setDescription(
          "Which type of battle would you like to generate!",
        );
        option.setRequired(true);
        return option;
      });

      data.addStringOption((option) => {
        option.setName("pokemon");
        option.setDescription("Which pokemon would you like to generate!");
        return option;
      });

      data.addNumberOption((option) => {
        option.setName("level");
        option.setDescription("What level should this pokemon be?");
        return option;
      });
      return data;
    });

    this.devOnly = true;
  }

  override async invoke(interaction: CommandInteraction) {
    const _type = interaction.options.get("type")?.value;

    if (_type === "wild") {
      await ClientCache.invokeProcess(
        "wild-battle",
        interaction,
        interaction.options.get("pokemon")?.value!,
        interaction.options.get("level")?.value as number || 0,
      );
    } else if (_type === "npc") {
      await ClientCache.invokeProcess(
        "npc-battle",
        interaction
      )
    }
  }
}
