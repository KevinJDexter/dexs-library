export interface BggSearchResult {
  bggId: number;
  name: string;
};

export interface BggGameDetails extends BggSearchResult {
  thumbnail?: string;
  minPlayers: number;
  maxPlayers: number;
  bestPlayers?: number[];
  recommendedPlayers?: number[];
  playTime: number;
  complexity?: number;
  categories: string[];
  mechanics: string[];
}

export interface BggClient {
  search(query: string): Promise<BggSearchResult[]>;
  getDetails(bggId: number): Promise<BggGameDetails>;
}