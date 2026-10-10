import { BggRef, ExpansionState, Game, LibraryData, PersonId } from "../domain/types";

export interface LooseExpansion extends BggRef {
  state: 'owned' | 'wanted';
}

export function baseGamesByExpansion(games: readonly Game[]): Map<number, BggRef[]> {
  const result = new Map<number, BggRef[]>();
  for (const game of games) {
    if (game.bggId === undefined) continue;
    for (const expansion of game.expansionCatalog ?? []) {
      const bases = result.get(expansion.bggId) ?? [];
      if (!bases.some(base => base.bggId === game.bggId)) bases.push({ bggId: game.bggId, name: game.name });
      result.set(expansion.bggId, bases);
    }
  }
  return result;
}

export function expansionCounts(game: Game, expansions: Record<number, ExpansionState>) {
  const catalog = game.expansionCatalog ?? [];
  const states = catalog.map(expansion => expansions[expansion.bggId]?.state);
  const count = (stateMatch: ExpansionState['state']) => states.filter(state => state === stateMatch).length;
  const hidden = count('hidden');
  return {
    total: catalog.length - hidden,
    owned: count('owned'),
    wanted: count('wanted'),
    hidden,
  }
}

export function looseExpansions(personId: PersonId, games: readonly Game[], expansions: LibraryData['expansions']): LooseExpansion[] {
  const covered = new Set(
    games
      .filter(game => game.ownership.kind === 'owned' && game.ownership.ownerId === personId)
      .flatMap(game => (game.expansionCatalog ?? []).map(expansion => expansion.bggId))
  )
  const loose: LooseExpansion[] = [];
  for (const [bggId, {name, state}] of Object.entries(expansions[personId] ?? {})) {
    if (state !== 'hidden' && !covered.has(Number(bggId))) {
      loose.push({ bggId: Number(bggId), name, state });
    }
  }
  return loose.sort((a,b) => a.name.localeCompare(b.name));
}