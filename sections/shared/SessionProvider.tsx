'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Session } from '@/helpers/authConstants';
import { getSession, signIn as signInAction, signOut as signOutAction } from './authActions';

type SessionContextValue = {
  session: Session | null;
  isLoaded: boolean;
  signIn: (username: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getSession().then((loaded) => {
      setSession(loaded);
      setIsLoaded(true);
    });
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const result = await signInAction(username, password);
    if (result.session) {
      setSession(result.session);
      return {};
    }
    return { error: result.error ?? 'Sign in failed.' };
  }, []);

  const signOut = useCallback(async () => {
    await signOutAction();
    setSession(null);
  }, []);

  return (
    <SessionContext.Provider value={{ session, isLoaded, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}
