import { Game, LibraryData, LibrarySettings, PersonId } from "../domain/types";

export const DEFAULT_SETTINGS: LibrarySettings = {
  hiddenFamilyPrefixes: ['Admin', 'Country', 'Crowdfunding', 'Digital Implementations'],
  filterPresets: []
}

type GameV1 = Omit<Game, 'priorPlays'> & { status: 'not-played' | 'played' | 'tried'};

interface LibraryV1 {
  version: 1;
  people: LibraryData['people'];
  games: GameV1[];
  lists: LibraryData['lists'];
}

interface ExpansionStateV2 {
  name: string;
  state: 'owned' | 'wanted';
  ownerId?: PersonId;
}

type LibraryV2 = Omit<LibraryData, 'version' | 'expansions'> & {
  version: 2;
  expansions: Record<string, ExpansionStateV2>;
}

type LibraryV3 = Omit<LibraryData, 'version'> & {
  version: 3;
}

function fromV1(old: LibraryV1): LibraryV2 {
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

function fromV2(old: LibraryV2): LibraryV3 {
  const expansions: LibraryData['expansions'] = {};
  for (const [bggId, { name, state, ownerId }] of Object.entries(old.expansions)) {
    if (!ownerId) continue;
    expansions[ownerId] = { ...expansions[ownerId], [Number(bggId)]: { name, state }};
  }
  return { ...old, version: 3, expansions };
}

function fromV3(old: LibraryV3): LibraryData {
  const played = new Set(old.plays.map(play => play.gameId));
  const expansions = { ...old.expansions };
  const moved = new Set<string>();
  for (const game of old.games) {
    if (!game.isExpansion || game.bggId === undefined || played.has(game.id) || game.priorPlays) continue;
    const personId = game.ownership.kind === 'owned' ? game.ownership.ownerId : old.people[0]?.id;
    if (!personId) continue;
    const personExpansions = { ...expansions[personId] };
    if (personExpansions[game.bggId]?.state !== 'owned') {
      personExpansions[game.bggId] = {name: game.name, state: game.ownership.kind === 'owned' ? 'owned' : 'wanted'};
    }
    expansions[personId] = personExpansions;
    moved.add(game.id);
  }
  return {
    ...old,
    version: 4,
    games: old.games.filter(game => !moved.has(game.id)),
    lists: old.lists.map(list => ({ ...list, gameIds: list.gameIds.filter(id => !moved.has(id))})),
    expansions
  }
}

export function migrate(raw: unknown): LibraryData {
  const version = (raw as { version?: unknown } | null)?.version;
  if (version === 4) return raw as LibraryData;
  if (version === 3) return fromV3(raw as LibraryV3);
  if (version === 2) return fromV3(fromV2(raw as LibraryV2));
  if (version === 1) return fromV3(fromV2(fromV1(raw as LibraryV1)));
  throw new Error(`Unknown library version: ${String(version)}`);
}