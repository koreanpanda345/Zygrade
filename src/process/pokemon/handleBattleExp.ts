import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";
import { PokemonClient } from "pokenode-ts";
export default class HandleBattleExpProcess extends BaseProcess {
  constructor() {
    super("handle-battle-exp");
  }

  override async invoke(
    playerTeam: PokemonSchema[],
    defeatedPokemon: PokemonSchema,
  ) {
    const b =
      (await new PokemonClient().getPokemonByName(defeatedPokemon.species!))
        .base_experience;
    const e = 1;
    const f = 1;
    const L = defeatedPokemon.level!;
    const p = 1;
    const s = 1;
    const t = 1;

    for (const pokemon of playerTeam) {
      const Lp = pokemon.level!;
      const v = Lp > L ? Math.floor(Math.round(4915 / 4096)) : 1;
      const gainExp = (await ClientCache.invokeProcess(
        "handle-gain-exp",
        b,
        e,
        f,
        L,
        Lp,
        p,
        s,
        t,
        v,
      )) as number;
      await ClientCache.invokeProcess(
        "handle-levels-and-exp",
        pokemon,
        gainExp,
      );
    }
  }
}
