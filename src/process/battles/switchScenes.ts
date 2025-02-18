import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";

export default class SwitchScenesProcess extends BaseProcess {
  constructor() {
    super("switch-scenes");
  }

  override async invoke(userId: string, scene: string) {
    const battle = ClientCache.battles.get(userId)!;

    if (scene === "switch") {
      const topButtons: ButtonBuilder[] = [];
      const bottomButtons: ButtonBuilder[] = [];
      for (let i = 0; i < 6; i++) {
        const button = new ButtonBuilder();
        button.setCustomId(`switch_${i + 1}`);
        const path = `p1:${i}`;
        button.setLabel(`${battle.has(path) ? battle.get(path) : "---"}`);
        button.setStyle(ButtonStyle.Primary);
        button.setDisabled(
          battle.get(`${path}:fainted`) ||
            battle.get(`${path}:hp:min`) === "0fnt" ||
            battle.get(`${path}`) === battle.get(`p1:current`) ||
            battle.get(path) === undefined,
        );
        if (i <= 2) {
          // top button
          topButtons.push(button);
        } else {
          // bottom button
          bottomButtons.push(button);
        }
      }
      const switchBack = new ButtonBuilder();
      switchBack.setCustomId("switch_back");
      switchBack.setLabel("Back");
      switchBack.setStyle(ButtonStyle.Danger);
      topButtons.push(switchBack);

      const switchTopRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          topButtons[0],
          topButtons[1],
          topButtons[2],
          topButtons[3],
        );
      const switchBottomRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(bottomButtons[0], bottomButtons[1], bottomButtons[2]);

      return [switchTopRow, switchBottomRow];
    }
  }
}
