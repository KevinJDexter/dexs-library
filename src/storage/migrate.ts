import { Game, LibraryData, LibrarySettings } from "../domain/types";

export const DEFAULT_SETTINGS: LibrarySettings = {
  hiddenFamilyPrefixes: ['Admin', 'Contry', 'Crowdfunding', 'Digital Implementations'],
  filterPresets: []
}

type GameV1 = Omit<Game, 'priorPlays'> & { status: 'not-played' | 'played' | 'tried'};

interface LibraryV1 {
  version: 1;
  people: LibraryData['people'];
  games: GameV1[];
  lists: LibraryData['lists'];
}

function fromV1(old: LibraryV1): LibraryData {
  return {
    version: 2,
    people: old.people,
    lists: old.lists,
    games: old.games.map(({ status, ...game}) => (
      status === 'not-played' ? game : { ...game, priorPlays: status === 'tried' ? 1 : 5}
    )),
    plays: [],
    expansions: {},
    settings: DEFAULT_SETTINGS
  }
}

export function migrate(raw: unknown): LibraryData {
  const version = (raw as { version?: unknown } | null)?.version;
  if (version === 2) return raw as LibraryData;
  if (version === 1) return fromV1(raw as LibraryV1);
  throw new Error(`Uknown library version: ${String(version)}`);
}