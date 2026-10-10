import { Game } from "../domain/types";

type SummaryFields = Pick<Game, 'minPlayers' | 'maxPlayers' | 'bestPlayers' | 'recommendedPlayers' | 'playTime' | 'setupTime' | 'complexity'>;

export function playerRange(min: number, max: number): string {
  return min === max ? `${min}` : `${min}-${max}`
}

const countRange = (counts?: number[]) => (
  counts?.length ? playerRange(Math.min(...counts), Math.max(...counts)) : undefined
)

const joinParts = (parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' · ');

function gameComplexityToLabel(complexity: number): string {
  if (complexity < 2) return "simple";
  if (complexity < 3) return "moderate";
  if (complexity < 4) return "complex";
  return "very complex";
}

export function playersLine(game: SummaryFields, withRecommended = false): string {
  const best = countRange(game.bestPlayers);
  const recommended = countRange(game.recommendedPlayers);
  return joinParts([
    `${playerRange(game.minPlayers, game.maxPlayers)} ${game.maxPlayers === 1 ? 'player' : 'players'}`,
    best && `best with ${best}`,
    withRecommended && recommended && `recommended ${recommended}`
  ])
}

export function timeLine(game: SummaryFields): string {
  return joinParts([
    game.playTime !== undefined && `${game.playTime} min to play`,
    game.setupTime !== undefined && `${game.setupTime} min setup`
  ])
}

export function complexityLine(game: SummaryFields): string {
  return game.complexity !== undefined
    ? `Complexity ${game.complexity.toFixed(1)} (${gameComplexityToLabel(game.complexity)})`
    : ''
}

export function timeAndComplexity(game: SummaryFields): string {
  return joinParts ([
    game.playTime !== undefined && `${game.playTime} min`,
    game.complexity !== undefined && gameComplexityToLabel(game.complexity),
  ])
}

export function gameSummary(game: SummaryFields): string {
  return joinParts([playersLine(game), timeAndComplexity(game)])
}

export function listWithMore(items: readonly string[], shown = 2): string {
  const extra = items.length - shown;
  return items.slice(0, shown).join(', ') + (extra > 0 ? ` +${extra} more` : '');
}