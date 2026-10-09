import { Game, Play } from "../domain/types";
import { monthsBefore, today } from "./dates";

export const STALE_MONTHS = 6;

export interface PlayStats {
  count: number;
  lastPlayed?: string;
}

export function playStats(games: readonly Game[], plays: readonly Play[]): Map<string, PlayStats> {
  const stats = new Map<string, PlayStats>(
    games.map(game => [game.id, { count: game.priorPlays ?? 0}])
  );
  for (const play of plays) {
    const entry = stats.get(play.gameId);
    if (!entry) continue;
    entry.count += 1;
    if (!entry.lastPlayed || play.date > entry.lastPlayed) entry.lastPlayed = play.date;
  } 
  return stats;
}

export function isStale(stats: PlayStats | undefined, from: string = today()): boolean {
  if (!stats || stats.count === 0) return false;
  return !stats.lastPlayed || stats.lastPlayed < monthsBefore(from, STALE_MONTHS);
}