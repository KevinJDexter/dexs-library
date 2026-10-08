import { BggSearchResult } from "../services/bgg";

function matchRank(name: string, query: string): number {
  const n = name.toLowerCase();
  const q = query.trim().toLowerCase();
  
  if (n === q) return 0;
  if (n.startsWith(q)) return 1;
  if (n.split(/[\s:()-]+/).some(word => word.startsWith(q))) return 2;
  return 3;
}

export function rankResults(results: readonly BggSearchResult[], query: string): BggSearchResult[] {
  const resultsMap = [...new Map(results.map(result => [result.bggId, result])).values()];
  return resultsMap.map(result => ({
    result, rank: matchRank(result.name, query)
  })).sort((a, b) => (
    a.rank - b.rank ||
    (b.result.yearPublished ?? 0) - (a.result.yearPublished ?? 0) ||
    a.result.name.localeCompare(b.result.name)
  )).map(({ result }) => result)
}