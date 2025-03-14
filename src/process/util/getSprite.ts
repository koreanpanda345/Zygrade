import BaseProcess from "../../base/BaseProcess.ts";
import axios from "axios";
export default class GetSpriteProcess extends BaseProcess {
  constructor() {
    super("get-sprite");
  }

  override async invoke(
    pokemon: string,
    shiny: boolean = false,
    back: boolean = false,
  ) {
    const possibleFrontSpritesDir = ["ani", "gen5ani", "gen5"];
    const possibleFrontShinySpritesDir = [
      "ani-shiny",
      "gen5ani-shiny",
      "gen5-shiny",
    ];
    const possibleBackSpritesDir = ["ani-back", "gen5ani-back", "gen5-back"];
    const possibleBackShinySpritesDir = [
      "dex-back-shiny",
      "gen5ani-back-shiny",
      "gen5-back-shiny",
    ];

    if (!shiny && !back) { // Front Sprite
      for (const dir of possibleFrontSpritesDir) {
        const result = await axios.get(
          `https://play.pokemonshowdown.com/sprites/${dir}/${
            pokemon.toLowerCase().replaceAll(" ", "").trim()
          }.${dir.includes("ani") ? "gif" : "png"}`,
        );

        if (result.status === 404) continue;
        else {return `https://play.pokemonshowdown.com/sprites/${dir}/${
            pokemon.toLowerCase().replaceAll(" ", "").trim()
          }.${dir.includes("ani") ? "gif" : "png"} `;}
      }
    } else if (shiny && !back) { // Front Shiny Sprite
      for (const dir of possibleFrontShinySpritesDir) {
        const result = await axios.get(
          `https://play.pokemonshowdown.com/sprites/${dir}/${
            pokemon.toLowerCase().replaceAll(" ", "").trim()
          }.${dir.includes("ani") ? "gif" : "png"}`,
        );

        if (result.status === 404) continue;
        else {return `https://play.pokemonshowdown.com/sprites/${dir}/${
            pokemon.toLowerCase().replaceAll(" ", "").trim()
          }.${dir.includes("ani") ? "gif" : "png"} `;}
      }
    } else if (!shiny && back) { // Back Sprite
      for (const dir of possibleBackSpritesDir) {
        const result = await axios.get(
          `https://play.pokemonshowdown.com/sprites/${dir}/${
            pokemon.toLowerCase().replaceAll(" ", "").trim()
          }.${dir.includes("ani") ? "gif" : "png"}`,
        );

        if (result.status === 404) continue;
        else {return `https://play.pokemonshowdown.com/sprites/${dir}/${
            pokemon.toLowerCase().replaceAll(" ", "").trim()
          }.${dir.includes("ani") ? "gif" : "png"} `;}
      }
    } else if (shiny && back) { // Back Shiny Sprite
      for (const dir of possibleBackShinySpritesDir) {
        const result = await axios.get(
          `https://play.pokemonshowdown.com/sprites/${dir}/${
            pokemon.toLowerCase().replaceAll(" ", "").trim()
          }.${dir.includes("ani") ? "gif" : "png"}`,
        );

        if (result.status === 404) continue;
        else {return `https://play.pokemonshowdown.com/sprites/${dir}/${
            pokemon.toLowerCase().replaceAll(" ", "").trim()
          }.${dir.includes("ani") ? "gif" : "png"} `;}
      }
    }

    return `https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F000%2F440%2F213%2Foriginal%2Fquestion-mark-vector-icon.jpg&f=1&nofb=1&ipt=6e36c1c30cdd73943487c05e57686de15aeaff6036338996b853231ad795bd98&ipo=images`;
  }
}
