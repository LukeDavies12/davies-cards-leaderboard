export type ParsedPlayerScore = {
  playerName: string;
  score: number;
};

function parseSingleEntry(part: string): ParsedPlayerScore | null {
  const match = part.match(/^(.+?)\s*[:]\s*(-?\d+)$/) ?? part.match(/^(.+?)\s+(-?\d+)$/);
  if (!match) return null;

  const playerName = match[1].trim();
  const score = Number.parseInt(match[2], 10);
  if (!playerName || Number.isNaN(score)) return null;

  return { playerName, score };
}

export function parsePlayerScores(text: string): ParsedPlayerScore[] {
  const normalized = text.trim();
  if (!normalized) return [];

  const commaParts = normalized
    .split(/[,;]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (commaParts.length > 1) {
    return commaParts
      .map(parseSingleEntry)
      .filter((entry): entry is ParsedPlayerScore => entry !== null);
  }

  const matches = [...normalized.matchAll(/([A-Za-z][A-Za-z\s'-]*?)\s+(-?\d+)/g)];
  return matches
    .map((match) => ({
      playerName: match[1].trim(),
      score: Number.parseInt(match[2], 10),
    }))
    .filter((entry) => entry.playerName && !Number.isNaN(entry.score));
}
