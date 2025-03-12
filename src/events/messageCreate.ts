import { ChannelType, Message } from "discord.js";
import BaseEvent from "../base/BaseEvent.ts";
import ClientCache from "../core/cache.ts";
import Databases from "../databases/index.ts";
import { PokemonSchema } from "../databases/models/Trainer/Pokemon.ts";
import { TrainerSchema } from "../databases/models/Trainer/Trainer.ts";

export default class MessageCreateEvent extends BaseEvent {
  constructor() {
    super("messageCreate");
  }

  public override async invoke(message: Message) {
    if (message.author.bot) return;
    if (message.channel.type === ChannelType.DM) return;

    const trainer = await ClientCache.invokeProcess(
      "get-trainer",
      message.author.id,
    ) as TrainerSchema;

    if (!trainer) return;

    const playerTeam: PokemonSchema[] = [];

    for (const pokeid of trainer.team) {
      const pokemon = await Databases.PokemonCollection.findOne({
        _id: pokeid,
      });

      if (!pokemon) continue;

      playerTeam.push(pokemon);
    }

    await ClientCache.invokeProcess(
      "handle-passive-exp",
      playerTeam,
      1,
      message,
    );
  }
}
