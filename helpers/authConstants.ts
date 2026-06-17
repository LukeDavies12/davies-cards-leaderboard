export const SESSION_COOKIE = 'davies_session';

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type Session = {
  accountId: number;
  username: string;
};
