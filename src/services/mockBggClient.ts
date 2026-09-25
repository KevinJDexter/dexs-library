import { BggClient, BggGameDetails } from "./bgg";
import { MOCK_CATALOG } from "./mockCatalog";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockBggClient: BggClient = {
  async search(query) {
    await delay(300); // so I can build loading states
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return MOCK_CATALOG.filter((game) => game.name.toLowerCase().includes(q))
      .map(({ bggId, name }) => ({ bggId, name })) 
  },
  async getDetails(bggId) {
    await delay(300);
    const game = MOCK_CATALOG.find(game => game.bggId === bggId);
    if (!game) throw new Error (`No game found with id ${bggId}`);
    return structuredClone(game) as BggGameDetails;
  }
}