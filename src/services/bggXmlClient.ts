import { Capacitor, CapacitorHttp } from "@capacitor/core";
import { summarizePlayerPoll } from "../logic/playerPoll";
import { BggClient, BggSearchResult, BggGameDetails } from "./bgg";
import { mockBggClient } from "./mockBggClient";

const BASE = Capacitor.isNativePlatform() ? 'https://boardgamegeek.com/xmlapi2' : '/bgg';
const token = import.meta.env.VITE_BGG_TOKEN as string | undefined;

async function getXml(path: string, params: Record<string, string>, token: string): Promise<Document> {
  const res = await CapacitorHttp.get({
    url: `${BASE}/${path}`,
    params,
    headers: { Authorization: `Bearer ${token}`},
    responseType: 'text',
  })
  if (res.status === 202) throw new Error('BGG is preparing the data. Retry in a moment');
  if (res.status !== 200) throw new Error(`BGG returned ${res.status}`);

  return new DOMParser().parseFromString(res.data as string, 'text/xml');
}

const attr = (el: Element | null | undefined, name = 'value') => el?.getAttribute(name) ?? undefined;
const num = (el: Element | null | undefined) => {
  const value = Number(attr(el));
  return Number.isFinite(value) && value > 0 ? value : undefined
}

function parsePlayerPoll(item: Element) {
  const results = [...item.querySelectorAll('poll[name="suggested_numplayers"] results')];
  const votes = results.map(result => {
    const count = (value: string) => Number(attr(result.querySelector(`result[value="${value}"]`), 'numvotes') ?? 0)
    return {
      players: Number(result.getAttribute('numplayers')),
      best: count('Best'),
      recommended: count('Recommended'),
      notRecommended: count('Not Recommended'),
    };
  }).filter(res => Number.isInteger(res.players));
  
  return summarizePlayerPoll(votes);
}

export function createXmlBggClient(token: string): BggClient {
  return {
    async search(query, options = {}): Promise<BggSearchResult[]> {
      if (!query.trim()) return [];
      const params: Record<string, string> = { query, type: 'boardgame'};
      if (options.exact) params.exact = '1';
      const doc = await getXml('search', params, token);
      return [...doc.querySelectorAll('item')].map((item => ({
        bggId: Number(item.getAttribute('id')),
        name: attr(item.querySelector('name')) ?? 'Unknown',
        yearPublished: num(item.querySelector('yearpublished')),
      })));
    },

    async getDetails(bggId): Promise<BggGameDetails> {
      const doc = await getXml('thing', { id: bggId.toString(), stats: '1' }, token);
      const item = doc.querySelector('item');
      if (!item) throw new Error(`No game with BGG id ${bggId}`);

      const links = (type: string) => (
        [...item.querySelectorAll(`link[type=${type}]`)].map(link => attr(link)!).filter(Boolean)
      )
      return {
        bggId,
        name: attr(item.querySelector('name[type="primary"]')) ?? 'Unknown',
        thumbnail: item.querySelector('thumbnail')?.textContent?.trim() || undefined,
        minPlayers: num(item.querySelector('minplayers')) ?? 1,
        maxPlayers: num(item.querySelector('maxplayers')) ?? 1,
        ...parsePlayerPoll(item),
        playTime: num(item.querySelector('playingtime')),
        complexity: num(item.querySelector('statistics averageweight')),
        categories: links('boardgamecategory'),
        mechanics: links('boardgamemechanic'),
      };
    }
  }
}

export const bggClient = token ? createXmlBggClient(token) : mockBggClient;