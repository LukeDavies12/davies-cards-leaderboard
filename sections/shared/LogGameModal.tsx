'use client';

import { useEffect, useMemo, useState } from 'react';
import Modal from '@/components/Modal';
import BaseInput from '@/components/BaseInput';
import PrimaryButton from '@/components/PrimaryButton';
import SearchableCombobox from '@/components/SearchableCombobox';
import { parsePlayerScores } from '@/helpers/parsePlayerScores';
import { useRefresh } from '@/sections/shared/RefreshProvider';
import {
  fetchLocations,
  fetchPlayers,
  logGame,
  type LocationOption,
  type PlayerOption,
} from '@/sections/shared/logGameActions';

function todayIsoDate() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export default function LogGameModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { refresh } = useRefresh();
  const [date, setDate] = useState(todayIsoDate);
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [scoresText, setScoresText] = useState('');
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [players, setPlayers] = useState<PlayerOption[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const parsedScores = useMemo(() => parsePlayerScores(scoresText), [scoresText]);

  const resetForm = () => {
    setDate(todayIsoDate());
    setLocation('');
    setMessage('');
    setScoresText('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (!open) return;

    setLoadingOptions(true);
    Promise.all([fetchLocations(), fetchPlayers()])
      .then(([locationRows, playerRows]) => {
        setLocations(locationRows);
        setPlayers(playerRows);
      })
      .catch(() => {
        setError('Failed to load locations and players.');
      })
      .finally(() => {
        setLoadingOptions(false);
      });
  }, [open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    if (!parsedScores.length) {
      setError('Enter at least one player score, e.g. Luke 174 Trent 154.');
      setSubmitting(false);
      return;
    }

    const result = await logGame({
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
    <Modal open={open} onClose={handleClose} variant="light" size="lg">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <h2 className="text-base font-semibold">Log Game</h2>
          <p className="mt-1 text-xs text-neutral-500">
            Add a game date, location, optional message, and player scores.
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
          placeholder={loadingOptions ? 'Loading locations…' : 'Search or create a location'}
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
            placeholder="Claire 174 Jake 172.."
            required
          />
          <span className="text-xs text-neutral-400">
            Type names and scores together. Existing players are matched automatically; new names
            are created on submit.
          </span>
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
                    <tr key={`${entry.playerName}-${entry.score}-${index}`} className="border-b border-neutral-100 last:border-0">
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
          <PrimaryButton disabled={submitting || loadingOptions}>
            {submitting ? 'Submitting…' : 'Log Game'}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
