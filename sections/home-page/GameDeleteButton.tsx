'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';
import PrimaryButton from '@/components/PrimaryButton';
import { deleteGame } from '@/sections/admin/adminActions';
import { useRefresh } from '@/sections/shared/RefreshProvider';

export function GameDeleteButton({ gameId }: { gameId: number }) {
  const { refresh } = useRefresh();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setSubmitting(true);
    setError('');

    const result = await deleteGame(gameId);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    await refresh();
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer text-xs text-red-600 hover:text-red-800 focus:outline-none"
      >
        Delete
      </button>
      <Modal open={open} onClose={() => setOpen(false)} variant="light">
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">Delete this game?</h3>
          <p className="text-xs text-neutral-500">
            This removes the game and all player scores for it. This cannot be undone.
          </p>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="cursor-pointer px-2 py-1 text-xs text-neutral-500 hover:text-neutral-800"
            >
              Cancel
            </button>
            <PrimaryButton type="button" disabled={submitting} onClick={handleDelete}>
              {submitting ? 'Deleting…' : 'Delete Game'}
            </PrimaryButton>
          </div>
        </div>
      </Modal>
    </>
  );
}
