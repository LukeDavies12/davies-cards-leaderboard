-- Admin and delete game functions for Davies Cards Leaderboard

CREATE OR REPLACE FUNCTION public.delete_game(p_game_id integer)
RETURNS void
LANGUAGE plpgsql
VOLATILE
AS $function$
BEGIN
  IF p_game_id IS NULL THEN
    RAISE EXCEPTION 'Game id is required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.game WHERE id = p_game_id) THEN
    RAISE EXCEPTION 'Game not found';
  END IF;

  DELETE FROM public.player_score WHERE game_id = p_game_id;
  DELETE FROM public.game WHERE id = p_game_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.list_players_admin()
RETURNS TABLE(id integer, name text, games_count bigint)
LANGUAGE sql
STABLE
AS $function$
  SELECT
    p.id,
    p.name,
    count(ps.id)::bigint AS games_count
  FROM public.player p
  LEFT JOIN public.player_score ps ON ps.player_id = p.id
  GROUP BY p.id, p.name
  ORDER BY p.name;
$function$;

CREATE OR REPLACE FUNCTION public.list_locations_admin()
RETURNS TABLE(id integer, name text, games_count bigint)
LANGUAGE sql
STABLE
AS $function$
  SELECT
    l.id,
    l.name,
    count(g.id)::bigint AS games_count
  FROM public.location l
  LEFT JOIN public.game g ON g.location_id = l.id
  GROUP BY l.id, l.name
  ORDER BY l.name;
$function$;

CREATE OR REPLACE FUNCTION public.update_player(p_player_id integer, p_name text)
RETURNS void
LANGUAGE plpgsql
VOLATILE
AS $function$
BEGIN
  IF p_player_id IS NULL THEN
    RAISE EXCEPTION 'Player id is required';
  END IF;

  IF p_name IS NULL OR btrim(p_name) = '' THEN
    RAISE EXCEPTION 'Player name is required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.player WHERE id = p_player_id) THEN
    RAISE EXCEPTION 'Player not found';
  END IF;

  UPDATE public.player
  SET name = btrim(p_name)
  WHERE id = p_player_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_player(p_player_id integer)
RETURNS void
LANGUAGE plpgsql
VOLATILE
AS $function$
BEGIN
  IF p_player_id IS NULL THEN
    RAISE EXCEPTION 'Player id is required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.player WHERE id = p_player_id) THEN
    RAISE EXCEPTION 'Player not found';
  END IF;

  IF EXISTS (SELECT 1 FROM public.player_score WHERE player_id = p_player_id) THEN
    RAISE EXCEPTION 'Cannot delete player with logged games';
  END IF;

  DELETE FROM public.player WHERE id = p_player_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_location(p_location_id integer, p_name text)
RETURNS void
LANGUAGE plpgsql
VOLATILE
AS $function$
BEGIN
  IF p_location_id IS NULL THEN
    RAISE EXCEPTION 'Location id is required';
  END IF;

  IF p_name IS NULL OR btrim(p_name) = '' THEN
    RAISE EXCEPTION 'Location name is required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.location WHERE id = p_location_id) THEN
    RAISE EXCEPTION 'Location not found';
  END IF;

  UPDATE public.location
  SET name = btrim(p_name)
  WHERE id = p_location_id;

  UPDATE public.game
  SET location = btrim(p_name)
  WHERE location_id = p_location_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_location(p_location_id integer)
RETURNS void
LANGUAGE plpgsql
VOLATILE
AS $function$
BEGIN
  IF p_location_id IS NULL THEN
    RAISE EXCEPTION 'Location id is required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.location WHERE id = p_location_id) THEN
    RAISE EXCEPTION 'Location not found';
  END IF;

  IF EXISTS (SELECT 1 FROM public.game WHERE location_id = p_location_id) THEN
    RAISE EXCEPTION 'Cannot delete location with logged games';
  END IF;

  DELETE FROM public.location WHERE id = p_location_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_game(p_game_id integer)
RETURNS TABLE(
  id integer,
  date date,
  location_name text,
  message text
)
LANGUAGE sql
STABLE
AS $function$
  SELECT
    g.id,
    g.date,
    coalesce(l.name, g.location) AS location_name,
    g.message
  FROM public.game g
  LEFT JOIN public.location l ON l.id = g.location_id
  WHERE g.id = p_game_id;
$function$;

CREATE OR REPLACE FUNCTION public.update_game(
  p_game_id integer,
  p_date date,
  p_location_name text,
  p_scores jsonb,
  p_message text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
VOLATILE
AS $function$
DECLARE
  v_location_id integer;
  v_entry jsonb;
  v_player_id integer;
  v_player_name text;
  v_score integer;
BEGIN
  IF p_game_id IS NULL THEN
    RAISE EXCEPTION 'Game id is required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.game WHERE id = p_game_id) THEN
    RAISE EXCEPTION 'Game not found';
  END IF;

  IF p_date IS NULL THEN
    RAISE EXCEPTION 'Date is required';
  END IF;

  IF p_location_name IS NULL OR btrim(p_location_name) = '' THEN
    RAISE EXCEPTION 'Location is required';
  END IF;

  IF p_scores IS NULL OR jsonb_array_length(p_scores) = 0 THEN
    RAISE EXCEPTION 'At least one player score is required';
  END IF;

  SELECT l.id
  INTO v_location_id
  FROM public.location l
  WHERE lower(btrim(l.name)) = lower(btrim(p_location_name));

  IF v_location_id IS NULL THEN
    INSERT INTO public.location (name)
    VALUES (btrim(p_location_name))
    RETURNING id INTO v_location_id;
  END IF;

  UPDATE public.game
  SET
    date = p_date,
    location = btrim(p_location_name),
    message = nullif(btrim(p_message), ''),
    location_id = v_location_id
  WHERE id = p_game_id;

  DELETE FROM public.player_score WHERE game_id = p_game_id;

  FOR v_entry IN SELECT value FROM jsonb_array_elements(p_scores)
  LOOP
    v_player_name := btrim(v_entry->>'player_name');
    v_score := (v_entry->>'score')::integer;

    IF v_player_name IS NULL OR v_player_name = '' THEN
      RAISE EXCEPTION 'Player name is required for each score';
    END IF;

    IF v_score IS NULL THEN
      RAISE EXCEPTION 'Score is required for each player';
    END IF;

    SELECT p.id
    INTO v_player_id
    FROM public.player p
    WHERE lower(btrim(p.name)) = lower(v_player_name);

    IF v_player_id IS NULL THEN
      INSERT INTO public.player (name)
      VALUES (v_player_name)
      RETURNING id INTO v_player_id;
    END IF;

    INSERT INTO public.player_score (player_id, game_id, score)
    VALUES (v_player_id, p_game_id, v_score);
  END LOOP;
END;
$function$;
