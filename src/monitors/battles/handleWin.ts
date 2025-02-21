import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  CommandInteraction,
  ComponentType,
  EmbedBuilder,
  Message,
} from "discord.js";
import BaseMonitor from "../../base/BaseMonitor.ts";
import ClientCache from "../../core/cache.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";
import { Dex } from "@pkmn/dex";
import { PokemonClient } from "pokenode-ts";

export default class HandleWinMonitor extends BaseMonitor {
  constructor() {
    super("handle-win");
  }

  override async invoke(line: string, userId: string) {
    const battle = ClientCache.battles.get(userId)!;
    const interaction = battle!.get("interaction") as CommandInteraction;
    const didWin = line.split("|")[2] === interaction.user.username;
    const battleType = battle.get("type") as string;
    const embed = battle.get("embed") as EmbedBuilder;
    const msg = battle.get("msg") as Message<boolean> | undefined;
	console.debug(battle);
    if (!didWin && battleType === "wild") {
      embed.setTitle("Wild Encounter: Failed");
      embed.setDescription(
        "It seems that you lost. Its ok, you can try next time!",
      );
      embed.setColor(Colors.Orange);
      embed.setFields();
	  
      await interaction.editReply({
        embeds: [embed],
        components: [],
      });
      return;
    } else if (!didWin && battleType === "npc") {
      embed.setTitle("NPC Encounter: Lost");
      embed.setDescription(
        `You lose to ${battle.get("npc:name") as string}!`,
      );
      embed.setColor(Colors.Orange);
      embed.setFields();
      await msg?.edit({
        embeds: [embed],
        components: [],
      });
      return;
    }
    if (battleType === "npc") {
      embed.setTitle("NPC Encounter: Won");
      embed.setDescription(`You defeated ${battle.get("npc:name") as string}!`);
      embed.setColor("Green");
      embed.setFields();
      await msg?.edit({
        embeds: [embed],
        components: [],
      });
    }

    if (battleType === "wild") {
      const wildPokemon = (battle.get("p2:team") as PokemonSchema[])[0];
      const playerTeam = battle.get("p1:team") as PokemonSchema[];
      const catchButton = new ButtonBuilder().setCustomId("catch").setLabel(
        "Catch",
      )
        .setStyle(ButtonStyle.Success);
      const leaveButton = new ButtonBuilder().setCustomId("leave").setLabel(
        "Leave",
      )
        .setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        catchButton,
        leaveButton,
      );
      embed.setTitle("Wild Encounter: Success");
      embed.setDescription(
        `Would you like to catch the **Level ${wildPokemon.level} ${
          Dex.species.get(wildPokemon.species!).name
        }**?`,
      );
      embed.setColor(Colors.Green);
      embed.setFields();
      await msg?.edit({
        embeds: [embed],
        components: [row],
      });
      const mc = await msg?.createMessageComponentCollector({
        componentType: ComponentType.Button,
      });

      mc?.on("collect", async (i) => {
        if (i.customId === "leave") {
          embed.setTitle("Wild Encounter: Success | Did not catch!");
          embed.setDescription(
            `You decided to leave the wild ${
              Dex.species.get(wildPokemon.species!).name
            } alone!`,
          );
          embed.setColor(Colors.Yellow);
          embed.setThumbnail(
            `https://play.pokemonshowdown.com/sprites/ani/${
              Dex.species.get(wildPokemon.species!).id
            }.gif`,
          );
          embed.setImage(
            `https://play.pokemonshowdown.com/sprites/ani/${
              Dex.species.get(playerTeam[0].species!).id
            }.gif`,
          );

          await msg?.edit({
            embeds: [embed],
            components: [],
          });

          mc?.stop();
        } else if (i.customId === "catch") {
          const neededExp = await ClientCache.invokeProcess(
            "handle-growth-rate",
            ((await new PokemonClient().getPokemonSpeciesByName(
              wildPokemon.species!,
            )).growth_rate.name,
              wildPokemon.level),
          );

          const pokemon: PokemonSchema = {
            discordUserId: userId,
            species: wildPokemon.species,
            level: wildPokemon.level,
            exp: 0,
            ivs: wildPokemon.ivs,
            evs: wildPokemon.evs ||
              { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
            nature: wildPokemon.nature,
            moves: wildPokemon.moves,
            shiny: wildPokemon.shiny,
            ability: wildPokemon.ability,
            neededExp,
          };

          await ClientCache.invokeProcess(
            "add-pokemon-to-trainer",
            userId,
            pokemon,
          );

          embed.setTitle(
            `Successfully Caught a Level ${pokemon.level} ${
              Dex.species.get(wildPokemon.species!).name
            }!`,
          );
          embed.setDescription(
            "You can look them up using the `/info` command",
          );
          embed.setFields();
          msg?.edit({
            embeds: [embed],
            components: [],
          });
        }
      });
    }
  }
}
