import { BggExtras } from "../domain/types";

export interface BggSearchResult {
  bggId: number;
  name: string;
  yearPublished?: number;
  isExpansion?: boolean;
};

export interface BggSearchOptions {
  exact?: boolean;
}

export interface BggGameDetails extends BggSearchResult, BggExtras {
  thumbnail?: string;
  minPlayers: number;
  maxPlayers: number;
  bestPlayers?: number[];
  recommendedPlayers?: number[];
  playTime?: number;
  complexity?: number;
  categories: string[];
  mechanics: string[];
}

export interface BggClient {
  search(query: string, options?: BggSearchOptions): Promise<BggSearchResult[]>;
  getDetails(bggId: number): Promise<BggGameDetails>;
  getDetailsMany(bggIds: number[]): Promise<BggGameDetails[]>;
}