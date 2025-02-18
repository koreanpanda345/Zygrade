import { APIEmbedField, EmbedBuilder, RestOrArray } from "discord.js";
import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";
import { Dex } from "@pkmn/dex";
import { filledBar } from "string-progressbar";

export default class GetDefaultSceneProcess extends BaseProcess {
  constructor() {
    super("get-default-scene");
  }

  override async invoke(
    battleType: string,
    embed: EmbedBuilder,
    userId: string,
  ): Promise<any> {
    const battle = ClientCache.battles.get(userId);
    if (!battle) return;
    embed.setTitle(`${battleType} Encounter`);
    embed.setDescription(`Select the buttons down below`);
    const fields: RestOrArray<APIEmbedField> = [];

    for (const side of ["p1", "p2"]) {
      const current = battle.get(`${side}:current`);
      const dex = Dex.species.get(battle?.get(`${side}:current`));

      if (side === "p1") {
        embed.setImage(
          `https://play.pokemonshowdown.com/sprites/ani/${dex.id}.gif`,
        );
      } else {embed.setThumbnail(
          `https://play.pokemonshowdown.com/sprites/ani/${dex.id}.gif`,
        );}

      const min = Number.parseInt(battle.get(`${side}:${current}:hp:min`));
      const max = Number.parseInt(battle.get(`${side}:${current}:hp:max`));

      if (Number.isNaN(min) || Number.isNaN(max)) return;
      const [hpBar, _] = filledBar(max, min, 20);

      const atk = Number.parseInt(battle.get(`${side}:${current}:stat:atk`));
      const def = Number.parseInt(battle.get(`${side}:${current}:stat:def`));
      const spa = Number.parseInt(battle.get(`${side}:${current}:stat:spa`));
      const spd = Number.parseInt(battle.get(`${side}:${current}:stat:spd`));
      const spe = Number.parseInt(battle.get(`${side}:${current}:stat:spe`));

      let boostString = "";

      for (
        const stat of [
          [atk, "ATK"],
          [def, "DEF"],
          [spa, "SPA"],
          [spd, "SPD"],
          [spe, "SPE"],
        ]
      ) {
        if (!Number.isNaN(stat[0]) && stat[0] !== 0) {
          boostString += ` ${stat[0]} ${stat[1]} `;
        }
      }

      const field = {
        name: `${dex.name} Level ${battle.get(`${side}:${current}:level`)}`,
        value: `HP : ${hpBar} ${min}/${max}${boostString}`,
        inline: true,
      };

      fields.push(field);
    }

    embed.setFields(fields);
  }
}
