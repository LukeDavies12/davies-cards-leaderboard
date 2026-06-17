'use server';

import { selectFromFunction } from '@/db';
import type { LeaderboardRow } from '@/sections/home-page/LeaderboardClient';
import type { HighScoreRow } from '@/sections/home-page/HighScoresMatrixClient';
import type { GameDates } from './FilterBar';
import type { GameResultRow } from './GameResultsClient';
import type { GameDetailRow } from './GameScoresInfo';

export async function fetchLeaderboard(params: {
  start?: string;
  end?: string;
  minGamesPlayed?: number;
}): Promise<LeaderboardRow[]> {
  return selectFromFunction<LeaderboardRow>('player_leaderboard', {
    date_min: params.start,
    date_max: params.end,
    min_games_played: params.minGamesPlayed,
  });
}

export async function fetchHighScores(params: {
  start?: string;
  end?: string;
}): Promise<HighScoreRow[]> {
  return selectFromFunction<HighScoreRow>('high_scores_matrix', {
    date_min: params.start,
    date_max: params.end,
  });
}

export async function fetchGameDates(): Promise<GameDates[]> {
  return selectFromFunction<GameDates>('game_dates');
}

export async function fetchGameResults(params: {
  start?: string;
  end?: string;
  offsetRows?: number;
}): Promise<GameResultRow[]> {
  return selectFromFunction<GameResultRow>('game_list', {
    offset_rows: params.offsetRows ?? 0,
    date_min: params.start,
    date_max: params.end,
  });
}

export async function fetchGameDetails(gameId: number): Promise<GameDetailRow[]> {
  return selectFromFunction<GameDetailRow>('game_details', {
    p_game_id: gameId,
  });
}