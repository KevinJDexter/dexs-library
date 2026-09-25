export type PersonId = string;

export interface Person {
  id: PersonId;
  name: string;
};

export type PlayStatus = "not-played" | "tried" | "played";

export const PLAY_STATUSES: readonly string[] = ["not-played", "tried", "played"];

export const PLAY_STATUS_LABELS: Record<PlayStatus, string> = {
  "not-played": "Not Played",
  tried: "Tried",
  played: "Played"
};

export type Ownership = { kind: "owned", ownerId: PersonId } | { kind: "wishlist" };

export interface Game {
  id: string;
  bggId?: number;
  name: string;
  thumbnail?: string;
  minPlayers: number;
  maxPlayers: number;
  bestPlayers: number[];
  recommendedPlayers: number[];
  playTime?: number;
  complexity?: number; //same as weight on board game geek
  categories?: string[];
  mechanics?: string[];
  ownership: Ownership;
  status: PlayStatus;
  favorite: boolean;
  addedAt?: string;
};

export interface GameList {
  id: string;
  name: string;
  gameIds: string[];
};

export interface LibraryData {
  version: 1;
  people: Person[];
  games: Game[];
  lists: GameList[];
}