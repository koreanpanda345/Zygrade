import BaseProcess from "../../base/BaseProcess.ts";

export default class HandleGrowthRateProcess extends BaseProcess {
  constructor() {
    super("handle-growth-rate");
  }

  override async invoke(rate: string, level: number) {
    if (rate === "erratic") return this.erratic(level);
    else if (rate === "fast") return this.fast(level);
    else if (rate === "medium-fast") return this.mediumFast(level);
    else if (rate === "medium") return this.mediumFast(level);
    else if (rate === "medium-slow") return this.mediumSlow(level);
    else if (rate === "slow") return this.slow(level);
    else if (rate === "fluctuating" || rate === "fast-then-very-slow") {
      return this.fluctuating(level);
    }
    return 0;
  }

  private erratic(level: number): number {
    if (level < 50) {
      return Math.floor(Math.round((Math.pow(level, 3) * (100 - level)) / 50));
    } else if (50 <= level && level < 68) {
      return Math.floor(Math.round((Math.pow(level, 3) * (150 - level)) / 100));
    } else if (68 <= level && level < 98) {
      return Math.floor(
        Math.round((Math.pow(level, 3) * ((1911 - 10 * level) / 3)) / 500),
      );
    } else {return Math.floor(
        Math.round((Math.pow(level, 3) * (160 - level)) / 100),
      );}
  }

  private fast = (level: number) =>
    Math.floor(Math.round((4 * Math.pow(level, 3)) / 4));

  private mediumFast = (level: number) =>
    Math.floor(Math.round(Math.pow(level, 3)));

  private mediumSlow = (level: number) =>
    Math.floor(
      Math.round(
        (6 / 5) * Math.pow(level, 3) - 15 * Math.pow(level, 2) + 100 * level -
          140,
      ),
    );

  private slow = (level: number) =>
    Math.floor(Math.round((5 * Math.pow(level, 3)) / 4));

  private fluctuating(level: number) {
    if (level < 15) {
      return Math.floor(
        Math.round((Math.pow(level, 3) * ((level + 1) / 3) + 24) / 50),
      );
    } else if (15 <= level && level < 36) {
      return Math.floor(Math.round((Math.pow(level, 3) * (level + 14)) / 50));
    } else {return Math.floor(
        Math.round((Math.pow(level, 3) * (level / 2 + 32)) / 50),
      );}
  }
}
