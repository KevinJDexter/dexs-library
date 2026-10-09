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
  return {
    total: catalog.length,
    owned: states.filter(state => state === 'owned').length,
    wanted: states.filter(state => state === 'wanted').length,
  }
}