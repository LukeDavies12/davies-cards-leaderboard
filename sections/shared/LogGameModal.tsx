'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';
import BaseInput from '@/components/BaseInput';
import PrimaryButton from '@/components/PrimaryButton';

export default function LogGameModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Game logging API to be wired when log_game function exists
    setSubmitting(false);
    setDate('');
    setLocation('');
    setMessage('');
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} className="min-w-72">
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <h2 className="text-sm font-medium">Log Game</h2>
        <BaseInput
          label="Date"
          labelClass="text-xs text-neutral-400"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <BaseInput
          label="Location"
          labelClass="text-xs text-neutral-400"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <BaseInput
          label="Message"
          labelClass="text-xs text-neutral-400"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <PrimaryButton disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit'}
        </PrimaryButton>
      </form>
    </Modal>
  );
}
