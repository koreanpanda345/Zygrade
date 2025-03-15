import { ActionRowBuilder, ButtonBuilder, Collection, CommandInteraction, EmbedBuilder } from "discord.js";
import BaseProcess from "../../base/BaseProcess.ts";
import { RouteSchemaTrainers } from "../../databases/models/Game/Route.ts";
import { BattleStreams, RandomPlayerAI } from "@pkmn/sim";
import ClientCache from "../../core/cache.ts";
import { TrainerSchema } from "../../databases/models/Trainer/Trainer.ts";
import { PokemonSchema } from "../../databases/models/Trainer/Pokemon.ts";
import Databases from "../../databases/index.ts";
import { Species, Dex } from "@pkmn/dex";
import logger from "../../utils/logger.ts";

export default class NPCBattleProcess extends BaseProcess {
  battle: Collection<string, any> = new Collection();
  didWin: boolean = false;
  npc: RouteSchemaTrainers | null = null;
  userId: string = "";
  location: string = "";
  interaction: CommandInteraction | null = null;
  constructor() {
    super('npc-battle');
  }

  override async invoke(interaction: CommandInteraction) {
    this.interaction = interaction;

    this.userId = interaction.user.id;

    const streams = BattleStreams.getPlayerStreams(
      new BattleStreams.BattleStream()
    );

    const spec = {
      formatId: "gen9customgame",
    };

    const trainer = await ClientCache.invokeProcess("get-trainer", this.userId) as TrainerSchema;

    const unparsedTeam = [];
    const trainerPokemon: PokemonSchema[] = [];
    for (const pokeid of trainer!.team) {
      const pokemon = await Databases.PokemonCollection.findOne({ _id: pokeid });
      trainerPokemon.push(pokemon!);
      unparsedTeam.push({
        pokemon: pokemon,
        species: Dex.species.get(pokemon!.species),
      });
    }

    const team = await ClientCache.invokeProcess('pack-team', unparsedTeam);

    const p1spec = { name: interaction.user.username, team: team };

    const npc = await ClientCache.invokeProcess('get-random-npc', trainer.route) as RouteSchemaTrainers;
    const opponetTrainerTeam: PokemonSchema[] = [];
    const opponentUnparsedTeam: { pokemon: PokemonSchema; species: Species}[] = [];

    for (const poke of npc.team) {
      const schema: PokemonSchema = {
        species: poke.species,
        shiny: false,
        level: poke.level,
        ability: poke.ability || Dex.species.get(poke.species).abilities[0],
        moves: (
          (await ClientCache.invokeProcess('get-random-moves', poke.species, poke.level)) as string[]
        ).reverse()
        .splice(0, 4),
        nature: await ClientCache.invokeProcess('get-random-nature'),
        ivs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
        evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      };

      opponentUnparsedTeam.push({
        pokemon: schema,
        species: Dex.species.get(poke.species),
      });

      opponetTrainerTeam.push(schema);
    }

    const opponentTeam = await ClientCache.invokeProcess('pack-team', opponentUnparsedTeam);

    const p2spec = { name: npc.name, team: opponentTeam };
    
    const p2 = new RandomPlayerAI(streams.p2);
    void p2.start();

    const battle = new Collection<string, any>();

    battle.set("type", "npc");
    
    battle.set("p1:team", trainerPokemon);
    battle.set("p2:team", opponetTrainerTeam);

    for (const side of ["p1", "p2"]) {
      battle.set(`${side}:current`, 0);
      const pokemon = battle.get(`${side}:team`) as PokemonSchema[];
      for (let i = 0; i < pokemon.length; i++) {
        const dex = Dex.species.get(pokemon[i].species);
        const stats = await ClientCache.invokeProcess('handle-stats', dex, pokemon[i]);
        const path = `${side}:team:${i}`;
        battle.set(`${path}`, pokemon[i]);
        battle.set(`${path}:species`, dex.name);
        battle.set(`${path}:level`, pokemon[i].level);
        battle.set(`${path}:stats:hp`, stats.hp);
        battle.set(`${path}:stats:maxhp`, stats.hp);
        battle.set(`${path}:stats:atk`, stats.atk);
        battle.set(`${path}:stats:def`, stats.def);
        battle.set(`${path}:stats:spa`, stats.spa);
        battle.set(`${path}:stats:spd`, stats.spd);
        battle.set(`${path}:stats:spe`, stats.spe);
        battle.set(`${path}:boosts`, {});
        battle.set(`${path}:volatile`, []);
        battle.set(`${path}:active`, false);
        battle.set(`${path}:fainted`, false);
        battle.set(`${path}:moves`, pokemon[i].moves);

        if (side === "p1") {
          for (const pokemonMove of pokemon[i].moves) {
            const move = Dex.moves.get(pokemonMove);
            if (!move.exists) continue;
            battle.set(`${path}:moves:${move.id}:pp`, move.pp);
            battle.set(`${path}:moves:${move.id}:maxpp`, move.pp);
          }
        }
      }
    }

    battle.set('streams', streams);
    battle.set('p1', p1spec);
    battle.set('p2', p2spec);
    battle.set("npc", npc);
    this.npc = npc;
    battle.set("trainer", trainer!);
    battle.set("npcPokemon", opponetTrainerTeam);
    battle.set("trainerPokemon", trainerPokemon);

    void streams.omniscient.write(
      `>start ${JSON.stringify(spec)}\n>player p1 ${JSON.stringify(p1spec)}\n>player p2 ${JSON.stringify(p2spec)}`
    );

    ClientCache.battles.set(interaction.user.id, battle);

    let embed = new EmbedBuilder();
    let buttons = new Collection<string, ButtonBuilder>();
    let rows = new Collection<string, ActionRowBuilder<ButtonBuilder>>();

    const updated = await ClientCache.invokeProcess(
      "generate-battle-scene",
      embed,
      buttons,
      rows,
      this.userId,
    );

    console.log(updated);

    embed = updated.embed;
    buttons = updated.buttons;
    rows = updated.rows;

    if (rows.get("switch_2")!.components.length !== 0) {
      await interaction.editReply({
        embeds: [embed],
        components: [
          rows.get("moves")!,
          rows.get("switch_1")!,
          rows.get("switch_2")!,
          rows.get("options")!,
        ],
      });
    } else {
      await interaction.editReply({
        embeds: [embed],
        components: [
          rows.get("moves")!,
          rows.get("switch_1")!,
          rows.get("options")!,
        ],
      });
    }


    for await (const chunk of streams.omniscient) {
      logger.debug('process - npc-battle', chunk);
      for (const line of chunk.split("\n")) {
                const result = await ClientCache.invokeProcess('handle-battle', line, interaction, this.userId, embed, buttons, rows);
        
                if (!result) continue;

                const sections = line.split("|");
                this.didWin = sections[2] === interaction.user.username;
                this.battle = battle;
                await this.handleWin();
                ClientCache.battles.delete(interaction.user.id);
      }
    }
  }

  async handleWin() {
    const embed = new EmbedBuilder();

    embed.setTitle(`NPC Battle`);
    embed.setDescription(`Did Win: ${this.didWin}`);

    await this.interaction?.editReply({ embeds: [embed], components: []});

    this.processQuests();
  }

  override async processQuests() {
    await ClientCache.handleQuests(
      "beat",
      this.userId,
      this.didWin,
      this.npc,
      this.location,
      this.interaction,
    );
  }
}