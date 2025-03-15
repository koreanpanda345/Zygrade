import { Dex, Nature, Species } from "@pkmn/dex";
import BaseProcess from "../../base/BaseProcess.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";

type NonHpStat = "atk" | "def" | "spa" | "spd" | "spe";
export default class HandleStatsProcess extends BaseProcess {
  constructor() {
    super("handle-stats");
  }

  override async invoke(species: Species, pokemon: PokemonSchema) {
    const stats = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    stats["hp"] = this.handleHp(
      species.baseStats.hp,
      pokemon.ivs.hp,
      pokemon.evs?.hp || 0,
      pokemon.level,
    );

    for (const stat of ["atk", "def", "spa", "spd", "spe"]) {
      stats[stat as NonHpStat] = this.handleNonHpStats(
        stat,
        species.baseStats[stat as NonHpStat],
        pokemon.ivs[stat as NonHpStat],
        pokemon.evs === undefined ? 0 : pokemon.evs[stat as NonHpStat],
        pokemon.level,
        Dex.natures.get(pokemon.nature || "Serious"),
      );
    }

    return stats;
  }

  private handleHp(base: number, iv: number, ev: number, level: number) {
    return Math.floor(
      Math.round(((2 * base + iv + ev / 4) * level) / 100 + level + 10),
    );
  }

  private handleNonHpStats(
    stat: string,
    base: number,
    iv: number,
    ev: number,
    level: number,
    nature: Nature,
  ) {
    return Math.floor(
      Math.round(
        (((2 * base + iv + ev / 4) * level) / 100 + 5) *
          this.handleNature(stat, nature),
      ),
    );
  }

  private handleNature(stat: string, nature: Nature) {
    return nature.plus === stat ? 1.1 : nature.minus === stat ? 0.9 : 1;
  }
}
