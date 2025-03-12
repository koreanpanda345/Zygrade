import { Db, MongoClient } from "mongodb";
import { PokemonSchema } from "./models/Trainer/Pokemon.ts";
import { TrainerSchema } from "./models/Trainer/Trainer.ts";
import { RouteSchema } from "./models/Game/Route.ts";
import { UserSettingsSchema } from "./models/Trainer/UserSettings.ts";
import { Logger } from "winston";
import createLogger from "../utils/logger.ts";
export default class Databases {
  static TrainerClient: MongoClient = new MongoClient(
    Deno.env.get("mongodb_trainer_uri".toUpperCase()) as string,
  );
  static TrainerDb: Db = new Db(this.TrainerClient, "Trainers");
  static PokemonCollection = this.TrainerDb.collection<PokemonSchema>(
    "pokemons",
  );
  static TrainerCollection = this.TrainerDb.collection<TrainerSchema>(
    "trainers",
  );
  static UserSettings = this.TrainerDb.collection<UserSettingsSchema>(
    "user_settings",
  );

  static GameClient: MongoClient = new MongoClient(
    Deno.env.get("mongodb_game_uri".toUpperCase()) as string,
  );
  static GameDb: Db = new Db(this.GameClient, "Game");
  static RouteCollection = this.GameDb.collection<RouteSchema>("routes");

  static logger: Logger = createLogger("database");

  static async connectAllDatabases() {
    await this.connectGameDb();
    await this.connectTrainerDb();

    return { TrainerDb: this.TrainerDb, GameDb: this.GameDb };
  }

  static async connectTrainerDb() {
    try {
      await this.TrainerClient.connect();
      await this.TrainerClient.db("admin").command({ ping: 1 });
      this.logger.info(`Connected to Trainer's DB`);
      return this.TrainerDb;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  static async connectGameDb() {
    try {
      await this.GameClient.connect();
      await this.GameClient.db("admin").command({ ping: 1 });
      this.logger.info(`Connected to Game's DB`);
      return this.GameDb;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }
}
