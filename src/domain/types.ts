import { GameFilters } from "../logic/filters";

export type PersonId = string;

export interface Person {
  id: PersonId;
  name: string;
};

export interface BggRef {
  bggId: number;
  name: string;
}

export interface BggExtras {
  yearPublished?: number;
  isExpansion?: boolean;
  designers?: string[];
  publishers?: string[];
  families?: string[];
  expansionCatalog?: BggRef[];
  expansionOf?: BggRef[];
  integrations?: BggRef[];
  reimplements?: BggRef[];
  reimplementedBy?: BggRef[];
}

export type Ownership = { kind: "owned", ownerId: PersonId } | { kind: "wishlist" };

export interface Game extends BggExtras {
  id: string;
  bggId?: number;
  name: string;
  thumbnail?: string;
  minPlayers: number;
  maxPlayers: number;
  bestPlayers?: number[];
  recommendedPlayers?: number[];
  playTime?: number;
  setupTime?: number;
  complexity?: number; //same as weight on board game geek
  categories?: string[];
  mechanics?: string[];
  ownership: Ownership;
  priorPlays?: number;
  favorite: boolean;
  addedAt?: string;
  syncedAt?: string;
};

export interface GameList {
  id: string;
  name: string;
  gameIds: string[];
};

export interface Play {
  id: string;
  gameId: string;
  date: string;
}

export interface ExpansionState {
  name: string;
  state: 'owned' | 'wanted' | 'hidden';
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: GameFilters;
}

export interface LibrarySettings {
  hiddenFamilyPrefixes: string[];
  filterPresets: FilterPreset[];
}

export interface LibraryData {
  version: 3;
  people: Person[];
  games: Game[];
  lists: GameList[];
  plays: Play[];
  expansions: Record<PersonId, Record<number, ExpansionState>>;
  settings: LibrarySettings;
}