export interface RouteSchema {
  name: string;
  routeid: string;
  encounters: RouteSchemaEncounters[];
  trainers: RouteSchemaTrainers[];
  items: RouteSchemaItemsPool[];
}

interface RouteSchemaItemsPool {
  requiredQuestId?: string;
  items: RouteSchemaItems[];
}

interface RouteSchemaItems {
  name: string;
  rarity: number;
}

interface RouteSchemaEncounters {
  levels: number[];
  requiredQuestId?: string;
  encounters: RouteSchemaEncounter[];
}

interface RouteSchemaEncounter {
  species: string;
  alwaysShiny?: boolean;
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
