'use client';

import { createContext, useCallback, useContext, useRef } from 'react';

type RefreshFn = () => void | Promise<void>;

type RefreshContextValue = {
  register: (fn: RefreshFn) => () => void;
  refresh: () => Promise<void>;
};

const RefreshContext = createContext<RefreshContextValue | null>(null);

export function useRefresh() {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefresh must be used within RefreshProvider');
  }
  return context;
}

export default function RefreshProvider({ children }: { children: React.ReactNode }) {
  const listeners = useRef(new Set<RefreshFn>());

  const register = useCallback((fn: RefreshFn) => {
    listeners.current.add(fn);
    return () => {
      listeners.current.delete(fn);
    };
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([...listeners.current].map((fn) => fn()));
  }, []);

  return (
    <RefreshContext.Provider value={{ register, refresh }}>{children}</RefreshContext.Provider>
  );
}
