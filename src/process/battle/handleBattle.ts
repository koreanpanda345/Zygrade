import { ActionRowBuilder, ButtonBuilder, Collection, CommandInteraction, EmbedBuilder } from "discord.js";
import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";
import { Dex } from "@pkmn/dex";

export default class HandleBattleProcess extends BaseProcess {
    constructor() {
        super('handle-battle');
    }

    override async invoke(line: string, interaction: CommandInteraction, userid: string, embed: EmbedBuilder, buttons: Collection<string, ButtonBuilder[]>, rows: Collection<string, ActionRowBuilder<ButtonBuilder>>) {
      const sections = line.split("|");
      const battle = ClientCache.battles.get(userid);
    
      if (!battle) return false;

      if (sections[1] === "turn" || sections[1] === "upkeep") {
        if (sections[1] === "turn") battle.set(`turn`, Number(sections[2]));

        const updated = await ClientCache.invokeProcess('generate-battle-scene', embed, buttons, rows, userid);
        embed = updated.embed;
        buttons = updated.buttons;
        rows = updated.rows;

        if (rows.get("switch_2")?.components.length !== 0) {
            await interaction.editReply({
              embeds: [embed],
              components: [
                rows.get("moves")!,
                rows.get("switch_1")!,
                rows.get("switch_2")!,
                rows.get("options")!,
              ],
            });
          } else {
            await interaction.editReply({
              embeds: [embed],
              components: [
                rows.get("moves")!,
                rows.get("switch_1")!,
                rows.get("options")!,
              ],
            });
          }
      } else if (sections[1] === "win") {
        return true;
      } else if (sections.length > 2) {
        const side = sections[2].split(":")[0].split("a")[0];
        const current = battle.get(`${side}:current`);
        const path = `${side}:team:${current}`;
        if (sections[1] === "move") {
          const turn = battle.get("turn");

          const move = Dex.moves.get(sections[3]);

          const oldpp = battle.get(`${path}:moves:${move.id}:pp`);
          battle.set(`${path}:moves:${move.id}:pp`, oldpp - 1);
          battle.set(`${path}:turn:${turn}:action`, move.name);
        } else if (sections[1] === "-damage") {
          const hp = sections[3].split("/")[0];
          battle.set(`${path}:stats:hp`, Number(hp));
        } else if (sections[1] === "-status") {
          const lookForVolatiles = [
            "psn",
            "par",
            "frz",
            "fzn",
            "tox",
            "brn",
            "slp",
          ];
          if (!lookForVolatiles.includes(sections[3])) return false;
          battle.get(`${path}:volatile`).push(sections[3]);
        } else if (sections[1] === "-start") {
          // Some This is for Volatiles
          const lookForVolatiles = ["confusion"];
          if (!lookForVolatiles.includes(sections[3])) return false;
          battle.get(`${path}:volatile`).push(sections[3]);
        } else if (sections[1] === "-end") {
          const lookForVolatiles = ["confusion"];
          if (!lookForVolatiles.includes(sections[3])) return false
          const list = battle.get(`${path}:volatile`) as string[];
          battle.set(
            `${path}:volatile`,
            list.filter((x) => x !== sections[3]),
          );
        } else if (sections[1] === "-boost" || sections[1] === "-unboost") {
          const stat = sections[3];
          const amount = Number(sections[4]);
          const boosts = battle.get(`${path}:boosts`);

          if (boosts[stat] && sections[1] === "-boost") {
            boosts[stat] += amount;
          } else if (boosts[stat] && sections[1] === "-unboost") {
            boosts[stat] -= amount;
          } else if (!boosts[stat] && sections[1] === "-boost") {
            boosts[stat] = amount;
          } else if (!boosts[stat] && sections[1] === "-unboost") {
            boosts[stat] = -amount;
          }
        } else if (sections[1] === "switch") {
          const pokemon = sections[2].split(":")[1].trim();
          const [hp, maxhp] = sections[4].split("/");

          battle.set(
            `${side}:current`,
            battle.get(`${side}:team:index:${pokemon.toLowerCase()}`),
          );
          const newPath = `${side}:team:${
            battle.get(`${side}:team:index:${pokemon.toLowerCase()}`)
          }`;
          battle.set(`${path}:boosts`, {});
          battle.set(`${newPath}:stats:hp`, Number(hp));
          battle.set(`${newPath}:stats:maxhp`, Number(maxhp));
        } else if (sections[1] === "faint") {
          battle.set(`${path}:fainted`, true);
        }
      }
      return false;
    }
}