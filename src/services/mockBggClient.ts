import { BggClient, BggGameDetails } from "./bgg";
import { MOCK_CATALOG } from "./mockCatalog";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockBggClient: BggClient = {
  async search(query, options = {}) {
    await delay(300); // so I can build loading states
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return MOCK_CATALOG.filter((game) => options.exact ? game.name.toLowerCase() === q : game.name.toLowerCase().includes(q))
      .map(({ bggId, name, yearPublished }) => ({ bggId, name, yearPublished })) 
  },
  async getDetails(bggId) {
    await delay(300);
    const game = MOCK_CATALOG.find(game => game.bggId === bggId);
    if (!game) throw new Error (`No game found with id ${bggId}`);
    return structuredClone(game) as BggGameDetails;
  }
}