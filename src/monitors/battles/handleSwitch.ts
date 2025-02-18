import BaseMonitor from "../../base/BaseMonitor.ts";
import ClientCache from "../../core/cache.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";

export default class HandleSwitchMonitor extends BaseMonitor {
  constructor() {
    super("handle-switch");
  }

  override async invoke(line: string, userId: string) {
    const battle = ClientCache.battles.get(userId)!;

    //   |action|player|pokemon| hp
    // 0 |   1  |   2  |   3   | 4

    const player = line.split("|")[2];
    const pokemon = line.split("|")[3];
    const species = pokemon.split(",")[0].trim().toLowerCase();
    const level = Number.parseInt(
      pokemon.split(",")[1].replace("L", "").trim(),
    );
    const hp = [
      Number.parseInt(line.split("|")[4].split("/")[0]),
      Number.parseInt(line.split("|")[4].split("/")[1]),
    ];

    const side = player.split(":")[0].replace("a", "");
    const team = battle.get(`${side}:team`) as PokemonSchema[];

    const index = team.findIndex((x) => x.species === species);

    const pokemonData = team[index];
    const basePath = `${side}:${index}`;

    if (!battle.has(species)) battle.set(basePath, species);

    battle.set(`${side}:current`, index);
    battle.set(`${basePath}:level`, level);
    battle.set(`${basePath}:hp:min`, hp[0]);
    battle.set(`${basePath}:hp:max`, hp[1]);
    battle.set(`${basePath}:move:1`, pokemonData.moves.at(0));
    battle.set(`${basePath}:move:2`, pokemonData.moves.at(1));
    battle.set(`${basePath}:move:3`, pokemonData.moves.at(2));
    battle.set(`${basePath}:move:4`, pokemonData.moves.at(3));

    await ClientCache.invokeProcess("update-scene", userId);
  }
}
