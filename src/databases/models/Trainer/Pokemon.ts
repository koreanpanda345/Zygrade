import { Condition, ObjectId } from "mongodb";

export interface PokemonSchema {
  _id?: Condition<ObjectId> | undefined;
  discordUserId?: string;
  species: string;
  shiny: boolean;
  level: number;
  exp?: number;
  neededExp?: number;
  ability: string;
  moves: string[];
  nature: string;
  ivs: PokemonSchemaStats;
  evs?: PokemonSchemaStats;
  item?: string;
}

export interface PokemonSchemaStats {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}
