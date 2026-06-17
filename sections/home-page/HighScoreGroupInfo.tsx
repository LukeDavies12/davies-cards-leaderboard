'use client';
import { formatGameDateMmDdYy } from '@/helpers/dateFormatters';
import { Info } from 'lucide-react';
import { useRef, useState } from 'react';
import { useClickOutside } from '@/helpers/useClickOutside';

export type HighScoreGroupInfoRow = {
  player_id: number;
  game_id: number;
  player_name: string;
  game_date: string;
  game_location: string;
};

export function HighScoreGroupInfo({ rows }: { rows: HighScoreGroupInfoRow[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative inline-flex shrink-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded p-0.5 text-neutral-600 cursor-pointer focus:outline-none"
        aria-expanded={open}
        aria-label="Game details"
      >
        <Info className="size-3.5" strokeWidth={2} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 min-w-52 max-w-[min(18rem,calc(100vw-2rem))] rounded-md bg-black p-2 text-xs text-white"
          role="region"
        >
          <ul className="flex flex-col gap-2">
            {rows.map((row, i) => {
              const repeated = rows.slice(0, i).some((x) => x.player_id === row.player_id);
              return (
                <li key={`${i}-${row.game_id}`} className="leading-snug">
                  <div>
                    {row.player_name}
                    {repeated && <span className="text-neutral-300"> again</span>}
                  </div>
                  <div className="text-neutral-300">
                    {formatGameDateMmDdYy(row.game_date)}
                    {row.game_location && (
                      <span className="text-neutral-400"> {row.game_location}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}