import { Dex } from "@pkmn/dex";
import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";
import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  Message,
} from "discord.js";
import { filledBar } from "string-progressbar";

export default class UpdateSceneProcess extends BaseProcess {
  constructor() {
    super("update-scene");
  }

  override async invoke(userId: string) {
    const battle = ClientCache.battles.get(userId)!;
    const embed = battle.get("embed") as EmbedBuilder;
    const msg = battle.get("msg") as Message<boolean> | undefined;

    const p1Current = battle.get("p1:current");
    const p2Current = battle.get("p2:current");

    const p1Team = battle.get("p1:team") as PokemonSchema[];
    const p2Team = battle.get("p2:team") as PokemonSchema[];
    const p1Pokemon = p1Team[p1Current];
    const p2Pokemon = p2Team[p2Current];
    const p1Species = Dex.species.get(p1Pokemon.species!);
    const p2Species = Dex.species.get(p2Pokemon.species!);
    const p1Hp = [
      Math.floor(Math.round(battle.get(`p1:${p1Current}:hp:min`) as number)),
      battle.get(`p1:${p1Current}:hp:max`) as number,
    ];
    const p1Atk = battle.get(`p1:${p1Current}:stat:atk`);
    const p1Def = battle.get(`p1:${p1Current}:stat:def`);
    const p1Spa = battle.get(`p1:${p1Current}:stat:spa`);
    const p1Spd = battle.get(`p1:${p1Current}:stat:spd`);
    const p1Spe = battle.get(`p1:${p1Current}:stat:spe`);

    let p1BoostString = "";
    if (!Number.isNaN(p1Atk)) p1BoostString += ` ${p1Atk} ATK `;
    if (!Number.isNaN(p1Def)) p1BoostString += ` ${p1Def} DEF `;
    if (!Number.isNaN(p1Spa)) p1BoostString += ` ${p1Spa} SPA `;
    if (!Number.isNaN(p1Spd)) p1BoostString += ` ${p1Spd} SPD `;
    if (!Number.isNaN(p1Spe)) p1BoostString += ` ${p1Spe} SPE `;
    const p2Hp = [
      Math.floor(Math.round(battle.get(`p2:${p2Current}:hp:min`) as number)),
      battle.get(`p2:${p2Current}:hp:max`) as number,
    ];
    const p2Atk = battle.get(`p2:${p2Current}:stat:atk`);
    const p2Def = battle.get(`p2:${p2Current}:stat:def`);
    const p2Spa = battle.get(`p2:${p2Current}:stat:spa`);
    const p2Spd = battle.get(`p2:${p2Current}:stat:spd`);
    const p2Spe = battle.get(`p2:${p2Current}:stat:spe`);

    let p2BoostString = "";
    if (!Number.isNaN(p2Atk)) p2BoostString += ` ${p2Atk} ATK `;
    if (!Number.isNaN(p2Def)) p2BoostString += ` ${p2Def} DEF `;
    if (!Number.isNaN(p2Spa)) p2BoostString += ` ${p2Spa} SPA `;
    if (!Number.isNaN(p2Spd)) p2BoostString += ` ${p2Spd} SPD `;
    if (!Number.isNaN(p2Spe)) p2BoostString += ` ${p2Spe} SPE `;

    embed.setFields({
      name: `${p1Species.name} Level ${p1Pokemon.level}`,
      value: `HP: ${filledBar(p1Hp[1], p1Hp[0], 20)[0]} ${p1Hp[0]}/${
        p1Hp[1]
      } ${p1BoostString}`,
      inline: true,
    }, {
      name: `${p2Species.name} Level ${p2Pokemon.level}`,
      value: `HP: ${filledBar(p2Hp[1], p2Hp[0], 20)[0]} ${p2Hp[0]}/${
        p2Hp[1]
      } ${p2BoostString}`,
      inline: true,
    });

    const p1Cant = battle.get("p1:cant");
    const p2Cant = battle.get("p2:cant");

    const p1Used = battle.get("p1:used");
    const p2Used = battle.get("p2:used");

    embed.setDescription(
      `${p1Cant === undefined ? `${p1Species.name} used ${p1Used}` : p1Cant}\n${
        p2Cant === undefined ? `${p2Species.name} used ${p2Used}` : p2Cant
      }`,
    );

    const buttons = battle.get("moveButtons") as ButtonBuilder[];

    const move1 = Dex.moves.get(p1Pokemon.moves[0]);
    const move2 = Dex.moves.get(p1Pokemon.moves[1]);
    const move3 = Dex.moves.get(p1Pokemon.moves[2]);
    const move4 = Dex.moves.get(p1Pokemon.moves[3]);

    buttons[0].setLabel(`${move1.exists ? move1.name : "---"}`);
    buttons[0].setDisabled(!move1.exists);
    buttons[1].setLabel(`${move2.exists ? move2.name : "---"}`);
    buttons[1].setDisabled(!move2.exists);
    buttons[2].setLabel(`${move3.exists ? move3.name : "---"}`);
    buttons[2].setDisabled(!move3.exists);
    buttons[3].setLabel(`${move4.exists ? move4.name : "---"}`);
    buttons[3].setDisabled(!move4.exists);

    const otherButtons = battle.get("otherButtons") as ButtonBuilder[];

    const topRow = new ActionRowBuilder<ButtonBuilder>();
    topRow.addComponents(buttons[0], buttons[1], otherButtons[0]);
    const bottomRow = new ActionRowBuilder<ButtonBuilder>();
    bottomRow.addComponents(buttons[2], buttons[3], otherButtons[1]);

    await msg?.edit({
      embeds: [embed],
      components: [topRow, bottomRow],
    });
  }
}
