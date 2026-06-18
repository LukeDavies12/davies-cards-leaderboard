'use client';
import { useEffect, useRef, useState } from 'react';
import type { PageFilters } from '@/helpers/persistedFilters';
import BaseInput from '@/components/BaseInput';
import SecondaryButton from '@/components/SecondaryButton';
import { fetchGameDates } from '@/sections/home-page/homepageActions';
import { formatGameDateMmDdYy } from '@/helpers/dateFormatters';
import { useClickOutside } from '@/helpers/useClickOutside';
import { Info } from 'lucide-react';

export type GameDates = {
  earliest_game_date: Date;
  latest_game_date: Date;
  played_at: string;
  games_logged: number;
};

export function GameDateDisplay() {
  const [data, setData] = useState<GameDates[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGameDates().then(setData);
  }, []);

  useClickOutside(ref, () => setOpen(false));

  if (!data.length) return null;

  const { earliest_game_date, latest_game_date } = data[0];
  const totalGames = data.reduce((sum, row) => sum + Number(row.games_logged), 0);

  return (
    <div ref={ref} className="relative inline-flex items-center gap-2">
      <p className="text-xs text-neutral-500">
        {formatGameDateMmDdYy(earliest_game_date.toISOString())}-{formatGameDateMmDdYy(latest_game_date.toISOString())}, {totalGames} total
      </p>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded p-0.5 text-neutral-600 cursor-pointer focus:outline-none hover:text-neutral-800"
        aria-expanded={open}
        aria-label="Location breakdown"
      >
        <Info className="size-3.5" strokeWidth={2} />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 min-w-52 max-w-[min(20rem,calc(100vw-2rem))] rounded-md bg-black p-3 text-white"
          role="region"
        >
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-neutral-400 border-b border-neutral-700">
                  <th className="text-left py-1 px-1">Location</th>
                  <th className="text-right py-1 px-1">Games</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.played_at} className="hover:bg-neutral-800 border-b border-neutral-800">
                    <td className="py-1.5 px-1 text-neutral-100">{row.played_at}</td>
                    <td className="text-right py-1.5 px-1 text-neutral-300">{row.games_logged}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FilterBar({
  filters,
  onChange,
  onClear,
}: {
  filters: PageFilters;
  onChange: (filters: PageFilters) => void;
  onClear: () => void;
}) {
  const update = (patch: Partial<PageFilters>) =>
    onChange({ ...filters, ...patch });

  const hasActiveFilters =
    filters.start !== '' ||
    filters.end !== '' ||
    filters.minGamesPlayed !== '';

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="w-36 shrink-0">
            <BaseInput
              type="date"
              label="Earliest"
              value={filters.start || ''}
              onChange={(e) => update({ start: e.target.value })}
            />
          </div>
          <div className="w-36 shrink-0">
            <BaseInput
              type="date"
              label="Latest"
              value={filters.end || ''}
              onChange={(e) => update({ end: e.target.value })}
            />
          </div>
        </div>
        <div className="flex items-end gap-3">
          <div className="w-36 shrink-0">
            <BaseInput
              type="number"
              inputMode="numeric"
              label="Player min games"
              min={0}
              step={1}
              placeholder="ex. 5"
              value={filters.minGamesPlayed || ''}
              onChange={(e) => update({ minGamesPlayed: e.target.value })}
            />
          </div>
          <SecondaryButton
            onClick={onClear}
            disabled={!hasActiveFilters}
            className="shrink-0 self-end"
          >
            Clear
          </SecondaryButton>
        </div>
      </div>
      <div className="flex items-end">
        <GameDateDisplay />
      </div>
    </div>
  );
}