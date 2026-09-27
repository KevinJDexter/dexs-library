export interface PlayerCountVotes {
  players: number;
  best: number;
  recommended: number;
  notRecommended: number;
}

export function summarizePlayerPoll(votes: readonly PlayerCountVotes[]): {
  bestPlayers?: number[];
  recommendedPlayers?: number[];
} {
  const voted = votes.filter((v) => v.best + v.recommended + v.notRecommended > 0);
  if (voted.length === 0) return {};
  const recommended = voted.filter((v) => v.best + v.recommended > v.notRecommended).map((v) => v.players);
  const best = voted.filter((v) => v.best > v.recommended && v.best > v.notRecommended).map((v) => v.players);
  return {
    bestPlayers: best.length ? best : undefined,
    recommendedPlayers: recommended.length ? recommended : undefined,
  };
}