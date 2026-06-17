'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '@/components/Modal';
import { fetchGameDetails } from '@/sections/home-page/homepageActions';

export type GameDetailRow = {
  player_name: string;
  score: number;
};

export function GameScoresInfo({ gameId }: { gameId: number }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<GameDetailRow[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setOpen(true);

    if (rows !== null) return;

    setLoading(true);
    try {
      const data = await fetchGameDetails(gameId);
      setRows(data.map((r) => ({ ...r, score: Number(r.score) })));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="text-xs underline cursor-pointer hover:text-neutral-900 focus:outline-none text-black"
      >
        Scores
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        {loading ? (
          <div className="flex justify-center py-2">
            <Loader2 className="size-4 animate-spin text-neutral-400" aria-label="Loading" />
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-neutral-700 text-neutral-400">
                <th className="px-1 py-1 text-left">Player</th>
                <th className="px-1 py-1 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((row, i) => (
                <tr key={`${i}-${row.player_name}`} className="border-b border-neutral-800 last:border-0">
                  <td className="px-1 py-1.5 text-neutral-100">{row.player_name}</td>
                  <td className="px-1 py-1.5 text-right text-neutral-300">{row.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Modal>
    </>
  );
}
