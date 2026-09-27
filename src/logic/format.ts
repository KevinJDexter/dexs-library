import { Game } from "../domain/types";

export function playerRange(min: number, max: number): string {
  return min === max ? `${min}` : `${min}-${max}`
}

export function gameSummary(game: Game): string {
  const summaryParts: string[] = [];
  summaryParts.push(`${playerRange(game.minPlayers, game.maxPlayers)}`);
  if (game.bestPlayers?.length) {
    summaryParts.push(`best with ${playerRange(Math.min(...game.bestPlayers), Math.max(...game.bestPlayers))}`)
  };
  if (game.playTime) summaryParts.push(`${game.playTime} min`);
  if (game.complexity !== undefined) summaryParts.push(`complexity ${game.complexity}/5`);
  return summaryParts.join(' * ');
}