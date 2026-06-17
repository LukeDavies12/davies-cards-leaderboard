'use client';

import { useEffect, useMemo, useState } from 'react';
import Modal from '@/components/Modal';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import BaseInput from '@/components/BaseInput';
import PrimaryButton from '@/components/PrimaryButton';
import SearchableCombobox from '@/components/SearchableCombobox';
import { parsePlayerScores } from '@/helpers/parsePlayerScores';
import { useRefresh } from '@/sections/shared/RefreshProvider';
import {
  fetchGameForEdit,
  fetchLocations,
  fetchPlayers,
  updateGame,
  type LocationOption,
  type PlayerOption,
} from '@/sections/shared/logGameActions';

export function EditGameButton({ gameId }: { gameId: number }) {
  const { refresh } = useRefresh();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [scoresText, setScoresText] = useState('');
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [players, setPlayers] = useState<PlayerOption[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const parsedScores = useMemo(() => parsePlayerScores(scoresText), [scoresText]);

  const handleClose = () => {
    setOpen(false);
    setError('');
  };

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setError('');

    Promise.all([fetchGameForEdit(gameId), fetchLocations(), fetchPlayers()])
      .then(([gameResult, locationRows, playerRows]) => {
        if (gameResult.error || !gameResult.game) {
          setError(gameResult.error ?? 'Failed to load game.');
          return;
        }

        setDate(gameResult.game.date);
        setLocation(gameResult.game.locationName);
        setMessage(gameResult.game.message);
        setScoresText(gameResult.game.scoresText);
        setLocations(locationRows);
        setPlayers(playerRows);
      })
      .catch(() => {
        setError('Failed to load game.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, gameId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    if (!parsedScores.length) {
      setError('Enter at least one player score.');
      setSubmitting(false);
      return;
    }

    const result = await updateGame({
      gameId,
      date,
      locationName: location,
      message,
      scores: parsedScores,
    });

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    await refresh();
    handleClose();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer text-xs underline hover:text-neutral-900 focus:outline-none"
      >
        Edit
      </button>
      <Modal open={open} onClose={handleClose} variant="light" size="lg">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner className="size-5" />
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <h2 className="text-base font-semibold">Edit Game</h2>
              <p className="mt-1 text-xs text-neutral-500">
                Update the date, location, message, or player scores.
              </p>
            </div>

            <BaseInput
              label="Date"
              labelClass="text-xs text-neutral-500"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />

            <SearchableCombobox
              label="Location"
              labelClass="text-xs text-neutral-500"
              options={locations}
              value={location}
              onChange={setLocation}
              placeholder="Search or create a location"
              required
            />

            <BaseInput
              label="Message"
              labelClass="text-xs text-neutral-500"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Optional note about the game"
            />

            <label className="flex flex-col gap-1">
              <span className="text-xs text-neutral-500">Player scores</span>
              <textarea
                className="min-h-24 w-full rounded-sm bg-neutral-50 px-2 py-1 text-sm text-neutral-700 placeholder-neutral-500 transition-colors hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                value={scoresText}
                onChange={(event) => setScoresText(event.target.value)}
                required
              />
            </label>

            {parsedScores.length > 0 && (
              <div className="overflow-hidden rounded-sm border border-neutral-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs text-neutral-500">
                      <th className="px-2 py-1.5 font-medium">Player</th>
                      <th className="px-2 py-1.5 text-right font-medium">Score</th>
                      <th className="px-2 py-1.5 text-right font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedScores.map((entry, index) => {
                      const existingPlayer = players.some(
                        (player) =>
                          player.name.toLowerCase() === entry.playerName.toLowerCase(),
                      );

                      return (
                        <tr
                          key={`${entry.playerName}-${entry.score}-${index}`}
                          className="border-b border-neutral-100 last:border-0"
                        >
                          <td className="px-2 py-1.5">{entry.playerName}</td>
                          <td className="px-2 py-1.5 text-right">{entry.score}</td>
                          <td className="px-2 py-1.5 text-right text-xs text-neutral-500">
                            {existingPlayer ? 'Existing player' : 'New player'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="cursor-pointer px-2 py-1 text-xs text-neutral-500 hover:text-neutral-800"
              >
                Cancel
              </button>
              <PrimaryButton disabled={submitting}>
                {submitting ? 'Saving…' : 'Save Changes'}
              </PrimaryButton>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
