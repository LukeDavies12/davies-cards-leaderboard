'use server';

import { cookies } from 'next/headers';
import { executeFromFunction, selectFromFunction } from '@/db';
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, type Session } from '@/helpers/authConstants';

type SignInRow = {
  session_token: string;
  account_id: number;
  username: string;
};

type SessionRow = {
  account_id: number;
  username: string;
};

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const rows = await selectFromFunction<SessionRow>('get_session', {
    p_session_token: token,
  });

  if (!rows.length) {
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }

  return {
    accountId: rows[0].account_id,
    username: rows[0].username,
  };
}

export async function signIn(
  username: string,
  password: string,
): Promise<{ session?: Session; error?: string }> {
  const trimmedUsername = username.trim();
  if (!trimmedUsername || !password) {
    return { error: 'Username and password are required.' };
  }

  const rows = await selectFromFunction<SignInRow>('sign_in', {
    p_username: trimmedUsername,
    p_password: password,
  });

  if (!rows.length) {
    return { error: 'Invalid username or password.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, rows[0].session_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return {
    session: {
      accountId: rows[0].account_id,
      username: rows[0].username,
    },
  };
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await executeFromFunction('sign_out', { p_session_token: token });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    throw new Error('Not signed in.');
  }
  return session;
}
