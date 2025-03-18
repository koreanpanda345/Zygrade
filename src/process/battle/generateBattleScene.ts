import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Collection,
  EmbedBuilder,
  EmbedField,
} from "discord.js";
import BaseProcess from "../../base/BaseProcess.ts";
import ClientCache from "../../core/cache.ts";
import { Dex } from "@pkmn/dex";
import { filledBar } from "string-progressbar";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";

export default class GenerateBattleScene extends BaseProcess {
  constructor() {
    super("generate-battle-scene");
  }

  override async invoke(
    embed: EmbedBuilder,
    buttons: Collection<string, ButtonBuilder[]>,
    rows: Collection<string, ActionRowBuilder<ButtonBuilder>>,
    userid: string,
  ) {
    const battle = ClientCache.battles.get(userid);
    if (!battle) return false;
    embed = await this.createOrUpdateEmbed(embed, battle);
    buttons = this.createOrUpdateButtons(buttons, battle);
    rows = this.createOrUpdateActionRows(rows, buttons);

    return { embed, buttons, rows };
  }

  async createOrUpdateEmbed(
    embed: EmbedBuilder,
    battle: Collection<string, any>,
  ) {
    const currentPokemon: { [k: string]: number } = {
      p1: Number(battle.get(`p1:current`)),
      p2: Number(battle.get(`p2:current`)),
    };

    if (!embed.data.title) {
      embed.setTitle(`${battle.get("type")} Battle`);
    }
    if (!embed.data.description) {
      if (battle.get("type") === "wild") {
        embed.setDescription(
          `You encounter a wild ${battle.get("wildPokemon").species}!`,
        );
      } else if (battle.get(`type`) === "npc") {
        embed.setDescription(`You encounterd ${battle.get("npc").name}!`);
      }
    } else {
      const description: string[] = [];
      description.push(`Turn ${battle.get("turn")}`);
      for (const side of ["p1", "p2"]) {
        const currentAction = battle.get(
          `${side}:team:${currentPokemon[side]}:turn:${
            battle.get("turn") - 1
          }:action`,
        );
        description.push(currentAction);
      }

      embed.setDescription(description.join("\n"));
    }

    if (!embed.data.color) embed.setColor("Yellow");
    if (!embed.data.footer) {
      embed.setFooter({
        text: "Select a move at the bottom.",
      });
    }
    for (const side of ["p1", "p2"]) {
      const currentPokemonSpecies = battle.get(
        `${side}:team:${currentPokemon[side]}:species`,
      ) as string;
      if (side === "p1") {
        const sprite = await ClientCache.invokeProcess(
          "get-sprite",
          currentPokemonSpecies,
          battle.get(`${side}:team:${currentPokemon[side]}:shiny`),
          true,
        );
        embed.setImage(sprite);
      } else {
        const sprite = await ClientCache.invokeProcess(
          "get-sprite",
          currentPokemonSpecies,
          battle.get(`${side}:team:${currentPokemon[side]}:shiny`),
          false,
        );
        embed.setThumbnail(sprite);
      }
    }

    embed.setFields();

    for (const side of ["p1", "", "p2"]) {
      if (side === "") {
        embed.addFields(this.blankField);
        continue;
      }

      const currentPokemonSpecies = battle.get(
        `${side}:team:${currentPokemon[side]}:species`,
      );
      const currentPokemonDex = Dex.species.get(currentPokemonSpecies);
      const currentPokemonShiny = battle.get(
        `${side}:team:${currentPokemon[side]}:shiny`,
      );
      const currentPokemonLevel = battle.get(
        `${side}:team:${currentPokemon[side]}:level`,
      );
      const currentPokemonHp = battle.get(
        `${side}:team:${currentPokemon[side]}:stats:hp`,
      );
      const currentPokemonMaxHp = battle.get(
        `${side}:team:${currentPokemon[side]}:stats:maxhp`,
      );

      if (!Number.isNaN(currentPokemonHp)) {
        const [hpBar, hpPercent] = filledBar(
          currentPokemonMaxHp,
          currentPokemonHp,
          20,
        );

        embed.addFields({
          name: `Level ${currentPokemonLevel} ${currentPokemonDex.name}`,
          value: `HP: ${hpBar} (${Math.floor(Math.round(Number(hpPercent)))}%)`,
          inline: true,
        });

        if (side === "p1") {
          embed.data.fields![embed.data.fields!.length - 1].value +=
            `[${currentPokemonHp}/${currentPokemonMaxHp}]`;
        }
      } else {
        embed.addFields({
          name: `Level ${currentPokemonLevel} ${currentPokemonDex.name} ${
            currentPokemonShiny ? "🌟" : ""
          }`,
          value: `HP: Fainted`,
          inline: true,
        });
      }
    }

    for (const side of ["p1", "", "p2"]) {
      if (side === "") {
        embed.addFields(this.blankField);
        continue;
      }

      const volatiles = battle.get(
        `${side}:team:${currentPokemon[side]}:volatile`,
      ) as string[];

      if (volatiles.length === 0) {
        embed.addFields(this.blankField);
        continue;
      }

      embed.addFields({
        name: `Volatiles`,
        value: `${volatiles.join(" | ")}`,
        inline: true,
      });
    }

    for (const side of ["p1", "", "p2"]) {
      if (side === "") {
        embed.addFields(this.blankField);
        continue;
      }

      const statBoosts = this.handleStatBoosts(
        battle.get(`${side}:team:${currentPokemon[side]}:boosts`),
      );

      if (statBoosts === "") {
        embed.addFields(this.blankField);
        continue;
      }

      embed.addFields({ name: "Stat Boosts", value: statBoosts, inline: true });
    }

    return embed;
  }

  createOrUpdateButtons(
    buttons: Collection<string, ButtonBuilder[]>,
    battle: Collection<string, any>,
  ) {
    // Remake the buttons
    const moveButtons: ButtonBuilder[] = [];
    const switchButtons: ButtonBuilder[] = [];
    const optionsButtons: ButtonBuilder[] = [];

    // Setup or Re-Setup Move Buttons
    const currentIndex = battle.get(`p1:current`) as number;

    for (
      const pokemonMove of battle.get(
        `p1:team:${currentIndex}:moves`,
      ) as string[]
    ) {
      const move = Dex.moves.get(pokemonMove);

      if (!move.exists) continue;

      const button = new ButtonBuilder();

      button.setCustomId(`wild-move-${move.id}`);
      button.setLabel(
        move.exists
          ? `${move.name} [PP: ${
            battle.get(`p1:team:${currentIndex}:moves:${move.id}:pp`)
          }/${battle.get(`p1:team:${currentIndex}:moves:${move.id}:maxpp`)}]`
          : "---",
      );
      button.setStyle(
        move.exists &&
          battle.get(`p1:team:${currentIndex}:moves:${move.id}:pp`) !== 0
          ? ButtonStyle.Primary
          : ButtonStyle.Danger,
      );

      button.setDisabled(
        !(move.exists &&
          battle.get(`p1:team:${currentIndex}:moves:${move.id}:pp`) !== 0),
      );

      moveButtons.push(button);
    }

    for (
      let i = 0;
      i < (battle.get(`p1:team`) as PokemonSchema[]).length;
      i++
    ) {
      const dex = Dex.species.get(battle.get(`p1:team:${i}:species`));

      if (!dex.exists) continue;

      const button = new ButtonBuilder();

      button.setCustomId(`wild-switch-${i}`);
      button.setLabel(`${dex.name}`);
      button.setStyle(
        battle.get(`p1:team:${i}:fainted`)
          ? ButtonStyle.Danger
          : ButtonStyle.Secondary,
      );
      button.setDisabled(
        battle.get(`p1:team:${i}:fainted`) || i == currentIndex,
      );

      switchButtons.push(button);
    }

    const runButton = new ButtonBuilder();
    runButton.setCustomId("wild-run");
    runButton.setLabel("Run Away");
    runButton.setStyle(ButtonStyle.Danger);
    runButton.setDisabled(false); // We are in a wild battle, you can run away from a wild encounter.
    optionsButtons.push(runButton);

    buttons.set("moves", moveButtons);
    buttons.set("switch", switchButtons);
    buttons.set("options", optionsButtons);

    return buttons;
  }

  createOrUpdateActionRows(
    rows: Collection<string, ActionRowBuilder<ButtonBuilder>>,
    buttons: Collection<string, ButtonBuilder[]>,
  ) {
    const moveRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<
      ButtonBuilder
    >().addComponents(buttons.get("moves")!);
    const optionsRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<
      ButtonBuilder
    >().addComponents(buttons.get("options")!);

    const switch1Row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder();
    const switch2Row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder();

    const switchButtons = buttons.get("switch")!;

    let pokemonAmount = 0;
    for (let i = 0; i < switchButtons.length; i++) {
      if (pokemonAmount > 2) switch2Row.addComponents(switchButtons[i]);
      else switch1Row.addComponents(switchButtons[i]);

      pokemonAmount += 1;
    }
    rows.set("moves", moveRow);
    rows.set("switch_1", switch1Row);
    rows.set("switch_2", switch2Row);
    rows.set("options", optionsRow);
    return rows;
  }

  handleStatBoosts = (boosts: { [k: string]: number }) => {
    const str: string[] = [];
    for (const stat of ["atk", "def", "spa", "spd", "spe"]) {
      if (boosts[stat]) str.push(`${boosts[stat]} ${stat.toUpperCase()}`);
    }
    return str.join(" | ");
  };

  blankField: EmbedField = { name: "\u200b", value: "\u200b", inline: true };
}
