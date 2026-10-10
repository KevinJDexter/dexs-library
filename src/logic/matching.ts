import { Game, LibraryData } from "../domain/types";

export interface Facet {
  kind: 'family' | 'category' | 'mechanic';
  value: string;
}

export interface Collection {
  name: string;
  games: Game[];
}

export function facetTitle(facet: Facet) {
  if (facet.kind === 'category') return `Category: ${facet.value}`;
  if (facet.kind === 'mechanic') return `Mechanic: ${facet.value}`;
  return facet.value;
}

export function matchesFacet(game: Game, facet: Facet) {
  const values = { family: game.families, category: game.categories, mechanic: game.mechanics }[facet.kind];
  return values?.includes(facet.value) ?? false;
}

export function collectionFor(game: Game, data: LibraryData, listId?: string): Collection {
  const list = listId ? data.lists.find(list => list.id === listId) : undefined;
  if (list) {
    return { name: list.name, games: data.games.filter(g => list.gameIds.includes(g.id))}
  }
  if (game.ownership.kind === 'owned') {
    const ownerId = game.ownership.ownerId;
    const owner = data.people.find(person => person.id === ownerId)?.name ?? 'someone';
    return {
      name: `${owner}'s library`,
      games: data.games.filter(g => g.ownership.kind === 'owned' && g.ownership.ownerId === ownerId)
    }
  }
  return {
    name: 'the wishlist',
    games: data.games.filter(g => g.ownership.kind === 'wishlist')
  }
}