import { Game } from "../domain/types";

export const NO_PREFIX = 'Other';

export function splitFamily(name: string): { prefix: string, label: string } {
  const at = name.indexOf(': ');
  return at < 0 ? { prefix: NO_PREFIX, label: name } : { prefix: name.slice(0, at), label: name.slice(at + 2)};
}

export function familyPrefixes(games: readonly Game[]): { prefix: string, gameCount: number }[] {
  const counts = new Map<string, number>()
  for (const game of games) {
    const prefixes = new Set((game.families ?? []).map(name => splitFamily(name).prefix));
    for (const prefix of prefixes) {
      counts.set(prefix, (counts.get(prefix) ?? 0) + 1);
    }
  }
  return [...counts]
    .map(([prefix, gameCount]) => ({ prefix, gameCount }))
    .sort((a, b) => a.prefix.localeCompare(b.prefix))
}

export function visibleFamilies(families: readonly string[], hiddenPrefixes: readonly string[]): [string, string[]][] {
  const groups = new Map<string, string[]>();
  for (const name of families) {
    const { prefix, label } = splitFamily(name);
    if (hiddenPrefixes.includes(prefix)) continue;
    groups.set(prefix, [...(groups.get(prefix) ?? []), label])
  }
  return [...groups];
}