'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import SecondaryButton from '@/components/SecondaryButton';
import { useSession } from './SessionProvider';
import SignInModal from './SignInModal';
import LogGameModal from './LogGameModal';

export default function Header() {
  const { session, isLoaded, signOut } = useSession();
  const [signInOpen, setSignInOpen] = useState(false);
  const [logGameOpen, setLogGameOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-3 pb-2 pt-1 lg:px-4">
        <Link href="/" className="flex select-none items-center gap-1 font-bold text-red-700">
          <Image
            src="/davies-cards.svg"
            alt="Davies Oh Hell! Leaderboard"
            width={100}
            height={100}
            className="h-11 w-11"
          />
          Davies Oh Hell! Leaderboard
        </Link>
        <div className="flex min-h-7 items-center gap-3">
          {!isLoaded ? null : session ? (
            <>
              <button
                type="button"
                onClick={() => signOut()}
                className="cursor-pointer text-xs text-neutral-500 hover:text-neutral-800 focus:outline-none"
              >
                Sign out
              </button>
              <SecondaryButton type="button" onClick={() => setLogGameOpen(true)}>
                Log Game
              </SecondaryButton>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSignInOpen(true)}
              className="cursor-pointer text-sm underline hover:text-neutral-900 focus:outline-none"
            >
              Sign In
            </button>
          )}
        </div>
      </header>
      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
      <LogGameModal open={logGameOpen} onClose={() => setLogGameOpen(false)} />
    </>
  );
}
