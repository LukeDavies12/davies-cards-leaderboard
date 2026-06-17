-- Log game setup for Davies Cards Leaderboard
-- Requires public.game, public.player, public.location, public.player_score

CREATE OR REPLACE FUNCTION public.list_locations()
RETURNS TABLE(id integer, name text)
LANGUAGE sql
STABLE
AS $function$
  SELECT l.id, l.name
  FROM public.location l
  ORDER BY l.name;
$function$;

CREATE OR REPLACE FUNCTION public.list_players()
RETURNS TABLE(id integer, name text)
LANGUAGE sql
STABLE
AS $function$
  SELECT p.id, p.name
  FROM public.player p
  ORDER BY p.name;
$function$;

CREATE OR REPLACE FUNCTION public.log_game(
  p_date date,
  p_location_name text,
  p_message text,
  p_scores jsonb
)
RETURNS TABLE(game_id integer)
LANGUAGE plpgsql
VOLATILE
AS $function$
DECLARE
  v_location_id integer;
  v_game_id integer;
  v_entry jsonb;
  v_player_id integer;
  v_player_name text;
  v_score integer;
BEGIN
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

  INSERT INTO public.game (date, location, message, location_id)
  VALUES (p_date, btrim(p_location_name), nullif(btrim(p_message), ''), v_location_id)
  RETURNING id INTO v_game_id;

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
    VALUES (v_player_id, v_game_id, v_score);
  END LOOP;

  RETURN QUERY SELECT v_game_id;
END;
$function$;
