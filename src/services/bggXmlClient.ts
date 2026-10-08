import { Capacitor, CapacitorHttp } from "@capacitor/core";
import { BggClient, BggSearchResult, BggGameDetails } from "./bgg";
import { mockBggClient } from "./mockBggClient";
import { parseSearch, parseThing } from "./bggParse";

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

export function createXmlBggClient(token: string): BggClient {
  return {
    async search(query, options = {}): Promise<BggSearchResult[]> {
      if (!query.trim()) return [];
      const params: Record<string, string> = { query, type: 'boardgame'};
      if (options.exact) params.exact = '1';
      const doc = await getXml('search', params, token);
      return parseSearch(doc);
    },

    async getDetails(bggId): Promise<BggGameDetails> {
      const doc = await getXml('thing', { id: bggId.toString(), stats: '1' }, token);
      const item = doc.querySelector('item');
      if (!item) throw new Error(`No game with BGG id ${bggId}`);
      return parseThing(item);
    }
  }
}

export const bggClient = token ? createXmlBggClient(token) : mockBggClient;