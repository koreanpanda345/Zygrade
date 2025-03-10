import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";

export default class GetRandomMoves extends BaseProcess {
  constructor() {
    super("get-random-moves");
  }

  override async invoke(species: string, level: number) {
    // Assuming that this is for giving wild pokemon or event pokemon to players. So we will ensure that some pokemon always gets a specific move here.

    const learnableMoves = await ClientCache.invokeProcess(
      "get-learnable-moves",
      species,
      level,
    );

    let movepool: string[] = learnableMoves;

    movepool = this.shouldAlwaysHave(species, level, movepool);
    return movepool.reverse().slice(0, 4);
  }

  shouldAlwaysHave(species: string, level: number, movepool: string[]) {
    switch (species) {
    }

    return movepool;
  }
}
