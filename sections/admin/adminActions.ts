'use server';

import { revalidatePath } from 'next/cache';
import { executeFromFunction, selectFromFunction } from '@/db';
import { requireSession } from '@/sections/shared/authActions';

export type AdminPlayerRow = {
  id: number;
  name: string;
  games_count: number;
};

export type AdminLocationRow = {
  id: number;
  name: string;
  games_count: number;
};

async function runAdminMutation(fn: () => Promise<void>) {
  await requireSession();
  try {
    await fn();
    revalidatePath('/');
    revalidatePath('/admin');
    return { ok: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed.';
    return { error: message };
  }
}

export async function fetchAdminPlayers(): Promise<AdminPlayerRow[]> {
  await requireSession();
  const rows = await selectFromFunction<AdminPlayerRow>('list_players_admin');
  return rows.map((row) => ({
    ...row,
    games_count: Number(row.games_count),
  }));
}

export async function fetchAdminLocations(): Promise<AdminLocationRow[]> {
  await requireSession();
  const rows = await selectFromFunction<AdminLocationRow>('list_locations_admin');
  return rows.map((row) => ({
    ...row,
    games_count: Number(row.games_count),
  }));
}

export async function deleteGame(gameId: number) {
  return runAdminMutation(async () => {
    await executeFromFunction('delete_game', { p_game_id: gameId });
  });
}

export async function updatePlayer(playerId: number, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return { error: 'Player name is required.' };

  return runAdminMutation(async () => {
    await executeFromFunction('update_player', {
      p_player_id: playerId,
      p_name: trimmed,
    });
  });
}

export async function deletePlayer(playerId: number) {
  return runAdminMutation(async () => {
    await executeFromFunction('delete_player', { p_player_id: playerId });
  });
}

export async function updateLocation(locationId: number, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return { error: 'Location name is required.' };

  return runAdminMutation(async () => {
    await executeFromFunction('update_location', {
      p_location_id: locationId,
      p_name: trimmed,
    });
  });
}

export async function deleteLocation(locationId: number) {
  return runAdminMutation(async () => {
    await executeFromFunction('delete_location', { p_location_id: locationId });
  });
}
