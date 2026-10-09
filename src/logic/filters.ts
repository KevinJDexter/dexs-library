import { Game, GameList, PersonId } from "../domain/types";
import { isStale, PlayStats } from "./plays";

export type Scope = 'owned' | 'wishlist' | 'all';

export type PlayerFit = 'supports' | 'recommended' | 'best';

export type PlayedFilter = 'any' | 'never' | 'played' | 'stale';

export interface GameFilters {
  search: string;
  scope: Scope;
  ownerId: PersonId | 'any';
  played: PlayedFilter;
  favoritesOnly: boolean;
  playerCount: number | null;
  playerFit: PlayerFit;
  complexity: { lower: number; upper: number }; // 1–5
  maxPlayTime: number | null;
  maxSetupTime: number | null;
  categories: string[];
  listId: string | null;
}

export const COMPLEXITY_MIN = 1;
export const COMPLEXITY_MAX = 5;

export const DEFAULT_FILTERS: GameFilters = {
  search: '',
  scope: 'all',
  ownerId: 'any',
  played: 'any',
  favoritesOnly: false,
  playerCount: null,
  playerFit: 'supports',
  complexity: { lower: COMPLEXITY_MIN, upper: COMPLEXITY_MAX },
  maxPlayTime: null,
  maxSetupTime: null,
  categories: [],
  listId: null,
}

const complexityIsDefault = (filters: GameFilters) => (
  filters.complexity.lower === COMPLEXITY_MIN && filters.complexity.upper === COMPLEXITY_MAX
)

export function fitsPlayerCount(game: Game, count: number, fit: PlayerFit) {
  const supported = count >= game.minPlayers && count <= game.maxPlayers
  if (fit === 'supports') return supported
  if (fit === 'best') return game.bestPlayers?.includes(count) ?? supported;
  return game.recommendedPlayers?.includes(count) ?? supported;
}

export function applyFilters(
  games: readonly Game[],
  filters: GameFilters,
  lists: readonly GameList[],
  stats: ReadonlyMap<string, PlayStats>,
): Game[] {
  const listIds = filters.listId ? new Set(lists.find(list => list.id === filters.listId)?.gameIds ?? []) : null;
  const search = filters.search.trim().toLowerCase();

  return games.filter(game => {
    if (filters.scope === 'owned' && game.ownership.kind !== 'owned') return false;
    if (filters.scope === 'wishlist' && game.ownership.kind !== 'wishlist') return false;
    if (filters.ownerId !== 'any' && !(game.ownership.kind === 'owned' && game.ownership.ownerId === filters.ownerId)) return false;
    if (filters.played !== 'any') {
      const gameStats = stats.get(game.id);
      const count = gameStats?.count ?? 0;
      if (filters.played === 'never' && count > 0) return false;
      if (filters.played === 'played' && count === 0) return false;
      if (filters.played === 'stale' && !isStale(gameStats)) return false;
    }
    if (filters.favoritesOnly && !game.favorite) return false;
    if (filters.playerCount && !fitsPlayerCount(game, filters.playerCount, filters.playerFit)) return false;
    if (!complexityIsDefault(filters)) {
      if (!game.complexity) return false;
      if (filters.complexity.lower > game.complexity || filters.complexity.upper < game.complexity) return false;
    }
    if (filters.maxPlayTime && game.playTime !== undefined && game.playTime > filters.maxPlayTime) return false;
    if (filters.maxSetupTime && game.setupTime !== undefined && game.setupTime > filters.maxSetupTime) return false;
    if (filters.categories.length && !filters.categories.some(category => game.categories?.includes(category))) return false;
    if (listIds && !listIds.has(game.id)) return false;
    if (search && !game.name.toLowerCase().includes(search)) return false;

    return true;
  })
}

export function countActiveFilters(filters: GameFilters): number {
  return [
    filters.ownerId !== 'any',
    filters.played !== 'any',
    filters.favoritesOnly,
    filters.playerCount !== null,
    !complexityIsDefault(filters),
    filters.maxPlayTime !== null,
    filters.maxSetupTime !== null,
    filters.categories.length > 0,
    filters.listId !== null,
  ].filter(Boolean).length
}

export function allCategories(games: readonly Game[]): string[] {
  return [...new Set(games.flatMap((g) => g.categories ?? []))].sort();
}