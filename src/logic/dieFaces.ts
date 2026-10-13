export function shuffled<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function buildFaces<T>(
  winner: T,
  candidates: readonly T[],
  faceCount = 6,
  rng: () => number = Math.random,
): { faces: T[]; winnerIndex: number } {
  const others = shuffled(candidates.filter(candidate => candidate !== winner), rng);
  const winnerIndex = Math.floor(rng() * faceCount);
  const faces: T[] = [];
  for (let i = 0, next = 0; i < faceCount; i++) {
    if (i === winnerIndex || others.length === 0) faces.push(winner);
    else faces.push(others[next++ % others.length])
  }
  return { faces, winnerIndex }
}