'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import SecondaryButton from '@/components/SecondaryButton';
import { useSession } from './SessionProvider';
import SignInModal from './SignInModal';
import LogGameModal from './LogGameModal';

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`text-xs hover:text-neutral-900 focus:outline-none ${
        active ? 'font-medium text-neutral-900' : 'text-neutral-500'
      }`}
    >
      {children}
    </Link>
  );
}

export default function Header() {
  const { session, isLoaded, signOut } = useSession();
  const [signInOpen, setSignInOpen] = useState(false);
  const [logGameOpen, setLogGameOpen] = useState(false);
  const pendingLogGameRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !session || !pendingLogGameRef.current) return;

    pendingLogGameRef.current = false;
    setSignInOpen(false);
    setLogGameOpen(true);
  }, [isLoaded, session]);

  const handleLogGameClick = () => {
    if (session) {
      setLogGameOpen(true);
      return;
    }

    pendingLogGameRef.current = true;
    setSignInOpen(true);
  };

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
          <NavLink href="/about">About</NavLink>
          {session ? <NavLink href="/admin">Admin</NavLink> : null}
          {!isLoaded ? null : session ? (
            <>
              <button
                type="button"
                onClick={() => signOut()}
                className="cursor-pointer text-xs text-neutral-500 hover:text-neutral-800 focus:outline-none"
              >
                Sign out
              </button>
              <SecondaryButton type="button" onClick={handleLogGameClick}>
                Log Game
              </SecondaryButton>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLogGameClick}
              className="cursor-pointer text-sm underline hover:text-neutral-900 focus:outline-none"
            >
              Log Game
            </button>
          )}
        </div>
      </header>
      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
      <LogGameModal open={logGameOpen} onClose={() => setLogGameOpen(false)} />
    </>
  );
}
