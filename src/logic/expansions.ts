import { BggRef, ExpansionState, Game } from "../domain/types";

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