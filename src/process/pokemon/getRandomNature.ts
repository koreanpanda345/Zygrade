import { Dex } from "@pkmn/dex";
import BaseProcess from "../../base/BaseProcess.ts";

export default class GetRandomNatureProcess extends BaseProcess {
  constructor() {
    super("get-random-nature");
  }

  override async invoke() {
    const natures = Dex.natures.all();
    return natures[Math.floor(Math.random() * natures.length) - 1];
  }
}
