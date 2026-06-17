export type PageFilters = {
  start: string;
  end: string;
  minGamesPlayed: string;
};

const STORAGE_KEY = 'davies-leaderboard-filters';

export const EMPTY_FILTERS: PageFilters = {
  start: '',
  end: '',
  minGamesPlayed: '',
};

export function loadFilters(): PageFilters {
  if (typeof window === 'undefined') return EMPTY_FILTERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_FILTERS;
    const parsed = JSON.parse(raw) as Partial<PageFilters>;
    return {
      start: parsed.start ?? '',
      end: parsed.end ?? '',
      minGamesPlayed: parsed.minGamesPlayed ?? '',
    };
  } catch {
    return EMPTY_FILTERS;
  }
}

export function saveFilters(filters: PageFilters) {
  if (typeof window === 'undefined') return;
  const hasValue =
    filters.start !== '' ||
    filters.end !== '' ||
    filters.minGamesPlayed !== '';
  if (!hasValue) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
}

export function toLeaderboardParams(filters: PageFilters) {
  const min = filters.minGamesPlayed.trim();
  const parsedMin = min === '' ? undefined : Number(min);
  return {
    start: filters.start || undefined,
    end: filters.end || undefined,
    minGamesPlayed:
      parsedMin !== undefined && !isNaN(parsedMin) ? parsedMin : undefined,
  };
}

export function toHighScoresParams(filters: PageFilters) {
  return {
    start: filters.start || undefined,
    end: filters.end || undefined,
  };
}
