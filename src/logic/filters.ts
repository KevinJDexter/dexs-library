import { Game, GameList, PersonId } from "../domain/types";
import { splitFamily } from "./families";
import { isStale, PlayStats } from "./plays";

export type Scope = 'owned' | 'wishlist' | 'all';

export type PlayerFit = 'supports' | 'recommended' | 'best';

export type PlayedFilter = 'any' | 'never' | 'played' | 'stale';

export type TagKind = 'categories' | 'mechanics' | 'families';
export const TAG_KINDS: TagKind[] = ['categories', 'mechanics', 'families'];

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
  mechanics: string[];
  families: string[];
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
  mechanics: [],
  families: [],
}

export const withDefaults = (filters: Partial<GameFilters>): GameFilters => ({ ...DEFAULT_FILTERS, ...filters });

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
    for (const kind of TAG_KINDS) {
      const selected = filters[kind];
      if (selected.length && !selected.some(tag => game[kind]?.includes(tag))) return false;
    }
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
    filters.mechanics.length > 0,
    filters.families.length > 0,
    filters.listId !== null,
  ].filter(Boolean).length
}

export function allTags(games: readonly Game[], kind: TagKind): string[] {
  const counts = new Map<string, number>();
  for (const game of games) {
    for (const tag of game[kind] ?? []) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);
}

export function tagOptions(games: readonly Game[], hiddenFamilyPrefixes: readonly string[]): Record<TagKind, string[]> {
  return {
    categories: allTags(games, 'categories'),
    mechanics: allTags(games, 'mechanics'),
    families: allTags(games, 'families').filter(name => !hiddenFamilyPrefixes.includes(splitFamily(name).prefix)),
  };
}

export function sameFilters(a: GameFilters, b: GameFilters): boolean {
  const normalize = (partial: GameFilters) => {
    const f = withDefaults(partial);
    return JSON.stringify(
      (Object.keys(f) as (keyof GameFilters)[]).sort().map(key => {
        const value = f[key];
        return [key, Array.isArray(value) ? [...value].sort() : value]; // order of chips doesn't matter
      })
    );
  };
  return normalize(a) === normalize(b);
}

const FILTERS_PARAM = 'filters';

export function filtersToSearch(filters: GameFilters): string {
  return `?${new URLSearchParams({ [FILTERS_PARAM]: JSON.stringify(filters) })}`;
}

export function filtersFromSearch(search: string): GameFilters | null {
  const raw = new URLSearchParams(search).get(FILTERS_PARAM);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? withDefaults(parsed as Partial<GameFilters>) : null
  } catch {
    return null;
  }
}