import BaseProcess from "../../base/BaseProcess.ts";
import { Dex } from "@pkmn/dex";
export default class GetLearnableMovesProcess extends BaseProcess {
  constructor() {
    super("get-learnable-moves");
  }

  override async invoke(name: string, level: number = 100) {
	console.log(name);
    const learnableMoves: string[] = [];
    const learnset = (await Dex.learnsets.get(name)).learnset!;
    for (const key of Object.keys(learnset)) {
      for (let i = 0; i <= level; i++) {
        if (learnset[key].some((m) => m.endsWith(`L${i}`))) {
          if (learnableMoves.includes(key)) continue;
          learnableMoves.push(key);
        }
      }
    }

    if (learnableMoves.length > 0) return learnableMoves;

    for (let key of Object.keys(learnset)) {
      if (learnset[key].some((m) => m.endsWith("E"))) {
        if (learnableMoves.includes(key)) continue;
        learnableMoves.push(key);
      }
    }

    return learnableMoves;
  }
}
