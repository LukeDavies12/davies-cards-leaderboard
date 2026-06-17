-- Auth setup for Davies Cards Leaderboard
-- Requires existing public.account (id, username, password_hash, created_at)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.session (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id integer NOT NULL REFERENCES public.account(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS session_token_idx ON public.session(token);
CREATE INDEX IF NOT EXISTS session_account_id_idx ON public.session(account_id);

-- Seed user (password: tentwoxandback)
-- Re-run safely only if username does not exist yet
INSERT INTO public.account (username, password_hash)
SELECT 'davies', crypt('tentwoxandback', gen_salt('bf'))
WHERE NOT EXISTS (
  SELECT 1 FROM public.account WHERE username = 'davies'
);

CREATE OR REPLACE FUNCTION public.sign_in(p_username text, p_password text)
RETURNS TABLE(session_token text, account_id integer, username text)
LANGUAGE plpgsql
VOLATILE
AS $function$
DECLARE
  v_account_id integer;
  v_username text;
  v_hash text;
  v_token text;
BEGIN
  SELECT a.id, a.username, a.password_hash
  INTO v_account_id, v_username, v_hash
  FROM public.account a
  WHERE a.username = p_username;

  IF v_account_id IS NULL OR v_hash <> crypt(p_password, v_hash) THEN
    RETURN;
  END IF;

  v_token := encode(gen_random_bytes(32), 'hex');

  INSERT INTO public.session (account_id, token, expires_at)
  VALUES (v_account_id, v_token, CURRENT_TIMESTAMP + INTERVAL '30 days');

  RETURN QUERY SELECT v_token, v_account_id, v_username;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sign_out(p_session_token text)
RETURNS void
LANGUAGE sql
VOLATILE
AS $function$
  DELETE FROM public.session WHERE token = p_session_token;
$function$;

CREATE OR REPLACE FUNCTION public.get_session(p_session_token text)
RETURNS TABLE(account_id integer, username text)
LANGUAGE sql
STABLE
AS $function$
  SELECT a.id, a.username
  FROM public.session s
  JOIN public.account a ON a.id = s.account_id
  WHERE s.token = p_session_token
    AND s.expires_at > CURRENT_TIMESTAMP;
$function$;
