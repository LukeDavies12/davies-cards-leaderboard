'use client';

import SessionProvider from '@/sections/shared/SessionProvider';
import RefreshProvider from '@/sections/shared/RefreshProvider';
import Header from '@/sections/shared/Header';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RefreshProvider>
        <Header />
        {children}
      </RefreshProvider>
    </SessionProvider>
  );
}
