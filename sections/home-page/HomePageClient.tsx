'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchGameResults,
  fetchHighScores,
  fetchLeaderboard,
} from '@/sections/home-page/homepageActions';
import {
  toHighScoresParams,
  toLeaderboardParams,
  type PageFilters,
} from '@/helpers/persistedFilters';
import { useRefresh } from '@/sections/shared/RefreshProvider';
import type { LeaderboardRow } from './LeaderboardClient';
import LeaderboardClient from './LeaderboardClient';
import type { HighScoreRow } from './HighScoresMatrixClient';
import HighScoresMatrixClient from './HighScoresMatrixClient';
import type { GameResultRow } from './GameResultsClient';
import GameResultsClient, { GAME_LIST_PAGE_SIZE } from './GameResultsClient';
import FilterBar from './FilterBar';
import FiltersProvider from './FiltersProvider';
function HomePageContent({
  filters,
  onFilterChange,
  onClearFilters,
}: {
  filters: PageFilters;
  onFilterChange: (filters: PageFilters) => void;
  onClearFilters: () => void;
}) {
  const [leaderboardRows, setLeaderboardRows] = useState<LeaderboardRow[]>([]);
  const [highScoreRows, setHighScoreRows] = useState<HighScoreRow[]>([]);
  const [gameResultRows, setGameResultRows] = useState<GameResultRow[]>([]);
  const [gameResultsLoading, setGameResultsLoading] = useState(false);
  const [gameResultsHasMore, setGameResultsHasMore] = useState(true);
  const requestId = useRef(0);
  const { register } = useRefresh();
  const fetchData = useCallback(async (activeFilters: PageFilters) => {
    const id = ++requestId.current;
    const dateParams = toHighScoresParams(activeFilters);
    const [leaderboard, highScores, gameResults] = await Promise.all([
      fetchLeaderboard(toLeaderboardParams(activeFilters)),
      fetchHighScores(dateParams),
      fetchGameResults({ ...dateParams, offsetRows: 0 }),
    ]);
    if (id !== requestId.current) return;
    setLeaderboardRows(leaderboard);
    setHighScoreRows(highScores);
    setGameResultRows(gameResults);
    setGameResultsHasMore(gameResults.length >= GAME_LIST_PAGE_SIZE);
  }, []);
  const loadMoreGameResults = useCallback(
    async (offsetRows: number) => {
      if (gameResultsLoading || !gameResultsHasMore) return;
      setGameResultsLoading(true);
      try {
        const next = await fetchGameResults({
          ...toHighScoresParams(filters),
          offsetRows,
        });
        setGameResultRows((prev) => [...prev, ...next]);
        setGameResultsHasMore(next.length >= GAME_LIST_PAGE_SIZE);
      } finally {
        setGameResultsLoading(false);
      }
    },
    [filters, gameResultsLoading, gameResultsHasMore],
  );
  useEffect(() => {
    fetchData(filters);
  }, [filters, fetchData]);

  useEffect(() => {
    return register(() => fetchData(filters));
  }, [register, fetchData, filters]);

  return (
    <div className="px-3 lg:px-4">
      <FilterBar filters={filters} onChange={onFilterChange} onClear={onClearFilters} />
      <LeaderboardClient rows={leaderboardRows} />
      <HighScoresMatrixClient rows={highScoreRows} />
      <GameResultsClient
        rows={gameResultRows}
        onLoadMore={gameResultsHasMore ? loadMoreGameResults : undefined}
        isLoadingMore={gameResultsLoading}
      />
    </div>
  );
}
export default function HomePageClient() {
  return (
    <FiltersProvider>
      {(filters, onFilterChange, onClearFilters) => (
        <HomePageContent
          filters={filters}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
        />
      )}
    </FiltersProvider>
  );
}