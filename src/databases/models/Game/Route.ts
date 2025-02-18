export interface RouteSchema {
  name: string;
  routeid: string;
  encounters: RouteSchemaEncounter[];
  trainers: RouteSchemaTrainers[];
  items: string[];
}

interface RouteSchemaEncounter {
  species: string;
  levels: number[];
  rarity: number;
}

export interface RouteSchemaTrainers {
  name: string;
  team: RouteSchemaTrainersPokemon[];
}

interface RouteSchemaTrainersPokemon {
  species: string;
  level: number;
  ability?: string;
  moves?: string[];
  item?: string;
}
