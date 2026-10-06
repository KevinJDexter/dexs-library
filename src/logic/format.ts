import { Game } from "../domain/types";

export function playerRange(min: number, max: number): string {
  return min === max ? `${min}` : `${min}-${max}`
}

function gameComplexityToLabel(complexity: number): string {
  if (complexity < 2) return "simple";
  if (complexity < 3) return "moderate";
  if (complexity < 4) return "complex";
  return "Very Complex";
}

export function gameSummary(game: Game): string {
  const summaryParts: string[] = [];
  summaryParts.push(`${playerRange(game.minPlayers, game.maxPlayers)} players`);
  if (game.bestPlayers?.length) {
    summaryParts.push(`best with ${playerRange(Math.min(...game.bestPlayers), Math.max(...game.bestPlayers))}`)
  };
  if (game.playTime) summaryParts.push(`${game.playTime} min`);
  if (game.complexity !== undefined) summaryParts.push(`complexity: ${gameComplexityToLabel(game.complexity)}`);
  return summaryParts.join(' : ');
}