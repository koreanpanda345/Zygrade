import BaseProcess from "../../base/BaseProcess.ts";

export default class HandleGainExpProcess extends BaseProcess {
  constructor() {
    super("handle-gain-exp");
  }

  /**
   * @param b is the base experience yield of the fainted pokemon.
   * @param e is equal to...
   * 	- 1.5 if the winning pokemon is holding a Lucky Egg
   * 	- 1 otherwise
   * @param f is equal to...
   *  - 4915/4096 (~1.2) if the Pokemon has an Affection of two hearts or more Gen VI, the multipler is exactly 1.2 and the result is rounded down.
   *  - 1 otherwise
   * @param L is the level of the fainted/caught Pokemon
   * @param Lp is the level of the victorious Pokemon
   * @param p is equal to...
   * 	- 1 if no Exp. Point Power or other boost (Pass Power, O-Power, Rotom Power, Exp. Charm) is active (this is rounded down to the nearest integer after multiplying):
   *  - If an Exp. Point Power is active...
   * 		- 0.5 for ↓↓↓, 0.66 for ↓↓, 0.8 for ↓, 1.2 for ↑, 1.5 for ↑↑, 2 for ↑↑↑, S, or MAX
   * 		- 1.5 for Roto Exp. Points or the Exp. Charm
   * @param s is equal to...
   * 	- In Generation VI and Later...
   * 		- 1 when calculating the experience of a pokemon that participated in battle.
   * 		- 2 when calculating the experience of a pokemon that did not participate in battle if Exp. Share is turned on
   * @param t is equal to...
   * 	- 1 if the winning Pokemon's current owner is it's Original Trainer
   * 	- 1.5 If the pokemon is an outsider Pokemon (i.e. its current owner is not its Original Trainer)
   * @param v is equal to...
   * 	- Generation VI+ only: 4915/4096 (~1.2) if the winning Pokemon is at or past the level where it should be able to evolve, but it has not
   * 	- 1 otherwise
   *
   * Equation:
   * EXP = (((b x L)/5) * (1/s) * (((2 * L) + 10)/ L + Lp + 10)^2.5 + 1) * t * e * v * f * p
   */
  override async invoke(
    b: number,
    e: number,
    f: number,
    L: number,
    Lp: number,
    p: number,
    s: number,
    t: number,
    v: number,
  ) {
    return Math.floor(
      Math.round(
        (((b * L) / 5) * (1 / s) * Math.pow((2 * L + 10) / (L + Lp + 10), 2.5) +
          1) * t * e * v * f * p,
      ),
    );
  }
}
