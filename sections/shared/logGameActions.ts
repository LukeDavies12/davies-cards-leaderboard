'use server';

import { revalidatePath } from 'next/cache';
import { executeFromFunction, selectFromFunction } from '@/db';
import { requireSession } from '@/sections/shared/authActions';

export type LocationOption = {
  id: number;
  name: string;
};

export type PlayerOption = {
  id: number;
  name: string;
};

export type LogGameScore = {
  playerName: string;
  score: number;
};

type LogGameRow = {
  game_id: number;
};

type GameForEditRow = {
  id: number;
  date: string;
  location_name: string;
  message: string | null;
};

type GameScoreRow = {
  player_name: string;
  score: number;
};

function serializeScores(scores: LogGameScore[]) {
  return JSON.stringify(
    scores.map((score) => ({
      player_name: score.playerName.trim(),
      score: score.score,
    })),
  );
}

export async function fetchLocations(): Promise<LocationOption[]> {
  await requireSession();
  return selectFromFunction<LocationOption>('list_locations');
}

export async function fetchPlayers(): Promise<PlayerOption[]> {
  await requireSession();
  return selectFromFunction<PlayerOption>('list_players');
}

export async function fetchGameForEdit(gameId: number): Promise<{
  game?: {
    id: number;
    date: string;
    locationName: string;
    message: string;
    scoresText: string;
  };
  error?: string;
}> {
  await requireSession();

  try {
    const [gameRows, scoreRows] = await Promise.all([
      selectFromFunction<GameForEditRow>('get_game', { p_game_id: gameId }),
      selectFromFunction<GameScoreRow>('game_details', { p_game_id: gameId }),
    ]);

    if (!gameRows.length) {
      return { error: 'Game not found.' };
    }

    const game = gameRows[0];
    const date =
      typeof game.date === 'string'
        ? game.date.slice(0, 10)
        : new Date(game.date).toISOString().slice(0, 10);

    return {
      game: {
        id: game.id,
        date,
        locationName: game.location_name,
        message: game.message ?? '',
        scoresText: scoreRows
          .map((row) => `${row.player_name} ${Number(row.score)}`)
          .join(' '),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load game.';
    return { error: message };
  }
}

export async function updateGame(params: {
  gameId: number;
  date: string;
  locationName: string;
  message?: string;
  scores: LogGameScore[];
}): Promise<{ error?: string }> {
  await requireSession();

  const locationName = params.locationName.trim();
  if (!params.date) {
    return { error: 'Date is required.' };
  }
  if (!locationName) {
    return { error: 'Location is required.' };
  }
  if (!params.scores.length) {
    return { error: 'At least one player score is required.' };
  }

  try {
    await executeFromFunction('update_game', {
      p_game_id: params.gameId,
      p_date: params.date,
      p_location_name: locationName,
      p_message: params.message?.trim() ?? '',
      p_scores: serializeScores(params.scores),
    });

    revalidatePath('/');
    return {};
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update game.';
    return { error: message };
  }
}

export async function logGame(params: {
  date: string;
  locationName: string;
  message?: string;
  scores: LogGameScore[];
}): Promise<{ gameId?: number; error?: string }> {
  await requireSession();

  const locationName = params.locationName.trim();
  if (!params.date) {
    return { error: 'Date is required.' };
  }
  if (!locationName) {
    return { error: 'Location is required.' };
  }
  if (!params.scores.length) {
    return { error: 'At least one player score is required.' };
  }

  try {
    const rows = await selectFromFunction<LogGameRow>('log_game', {
      p_date: params.date,
      p_location_name: locationName,
      p_message: params.message?.trim() ?? '',
      p_scores: serializeScores(params.scores),
    });

    revalidatePath('/');

    if (!rows.length) {
      return { error: 'Failed to log game.' };
    }

    return { gameId: rows[0].game_id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to log game.';
    return { error: message };
  }
}
