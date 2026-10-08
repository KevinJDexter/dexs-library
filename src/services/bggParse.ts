import { BggRef } from "../domain/types";
import { summarizePlayerPoll } from "../logic/playerPoll";
import { BggGameDetails, BggSearchResult } from "./bgg";

const attr = (el: Element | null | undefined, name = 'value') => el?.getAttribute(name) ?? undefined;
const num = (el: Element | null | undefined) => {
  const value = Number(attr(el));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function parsePlayerPoll(item: Element) {
  const results = [...item.querySelectorAll('poll[name="suggested_numplayers] results')];
  const votes = results.map(result => {
    const count = (value: string) => Number(attr(result.querySelector(`result[value="${value}"]`), 'numvotes') ?? 0);
    return {
      players: Number(result.getAttribute('numplayers')),
      best: count("Best"),
      recommended: count("Recommended"),
      notRecommended: count("Not Recommended"),
    }
  }).filter(res => Number.isInteger(res));

  return summarizePlayerPoll(votes)
}

export function parseSearch(doc: Document): BggSearchResult[] {
  return [...doc.querySelectorAll('item')].map(item => ({
    bggId: Number(item.getAttribute('id')),
    name: attr(item.querySelector('name')) ?? 'unknown',
    yearPublished: num(item.querySelector('yearpublished'))
  }))
}

export function parseThing(item: Element): BggGameDetails {
  const links = (type: string) => [...item.querySelectorAll(`link[type="${type}"]`)];
  const names = (type: string) => links(type).map(link => attr(link)).filter((name): name is string => !!name);

  const refs = (type: string, inbound?: boolean): BggRef[] => links(type)
    .filter(link => inbound === undefined || (link.getAttribute('inbound') === 'true') === inbound)
    .map(link => ({
      bggId: Number(link.getAttribute('id')),
      name: attr(link) ?? 'unknown'
    }));

  return {
    bggId: Number(item.getAttribute('id')),
    name: attr(item.querySelector('name[type="primary"]')) ?? 'Unknown',
    yearPublished: num(item.querySelector('yearpublished')),
    isExpansion: item.getAttribute('type') === 'boardgameexpansion',
    thumbnail: item.querySelector('thumbnail')?.textContent?.trim() || undefined,
    minPlayers: num(item.querySelector('minplayers')) ?? 1,
    maxPlayers: num(item.querySelector('maxplayers')) ?? 1,
    ...parsePlayerPoll(item),
    playTime: num(item.querySelector('playingtime')),
    complexity: num(item.querySelector('statistics averageweight')),
    categories: names('boardgamecategory'),
    mechanics: names('boardgamemechanic'),
    designers: names('boardgamedesigner'),
    publishers: names('boardgamepublisher'),
    families: names('boardgamefamily'),
    expansionCatalog: refs('boardgameexpansion', false),
    expansionOf: refs('boardgameexpansion', true),
    integrations: refs('boardgameintegration'),
    reimplements: refs('boardgameimplementation', true),
    reimplementedBy: refs('boardgameimplementation', false),
  }
}