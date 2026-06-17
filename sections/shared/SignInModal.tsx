'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';
import BaseInput from '@/components/BaseInput';
import PrimaryButton from '@/components/PrimaryButton';
import { useSession } from './SessionProvider';

export default function SignInModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { signIn } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const result = await signIn(username, password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setUsername('');
    setPassword('');
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} className="min-w-64">
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <h2 className="text-sm font-medium">Sign In</h2>
        <BaseInput
          label="Username"
          labelClass="text-xs text-neutral-400"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
        <BaseInput
          label="Password"
          labelClass="text-xs text-neutral-400"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <PrimaryButton disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign In'}
        </PrimaryButton>
      </form>
    </Modal>
  );
}
