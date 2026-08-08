-- MUTUAL – authoritative server-side matching.
-- Mirrors src/domain/matching (same rules, same fixtures – see
-- docs/MATCHING_ENGINE.md). The client only ever sends its OWN answer and
-- only ever receives shared match rows via RLS. Partner answers never leave
-- the database.

-- ---------------------------------------------------------------------------
-- interest matrix (symmetric)
-- ---------------------------------------------------------------------------
create or replace function public.fn_interest_match(a text, b text)
returns text language sql immutable as $$
  select case
    when a in ('no','not_now','skipped','hidden') or b in ('no','not_now','skipped','hidden') then null
    when a = 'fantasy_only' and b = 'fantasy_only' then 'shared_fantasy'
    when a = 'fantasy_only' or b = 'fantasy_only' then 'conversation_value'
    when a = 'maybe_with_conditions' or b = 'maybe_with_conditions' then 'careful_curiosity'
    when a = 'already_like' and b = 'already_like' then 'strong_match'
    else 'clear_match' -- would_try+would_try, would_try+already_like
  end;
$$;

-- ---------------------------------------------------------------------------
-- role compatibility
-- ---------------------------------------------------------------------------
create or replace function public.fn_roles_compatible(model text, a text, b text)
returns boolean language plpgsql immutable as $$
declare
  flex constant text[] := array['switching','both'];
begin
  if model in ('symmetric','not_relevant') then return true; end if;
  if model = 'directional' then
    return ((a = 'initiating' or a = any(flex)) and (b = 'receiving' or b = any(flex)))
        or ((b = 'initiating' or b = any(flex)) and (a = 'receiving' or a = any(flex)));
  end if;
  if model = 'observer' then
    return ((a = 'observing' or a = any(flex)) and (b = 'receiving' or b = any(flex)))
        or ((b = 'observing' or b = any(flex)) and (a = 'receiving' or a = any(flex)));
  end if;
  if model = 'switchable' then
    return not (a = b and a in ('initiating','receiving','observing'));
  end if;
  return false;
end $$;

-- ---------------------------------------------------------------------------
-- score (internal sorting only – never surfaced as a percentage)
-- ---------------------------------------------------------------------------
create or replace function public.fn_match_score(
  p_type text, p_overlap_width integer, p_talk_first boolean, p_has_conditions boolean)
returns integer language sql immutable as $$
  select greatest(0, least(100,
    case p_type
      when 'shared_fantasy' then 30
      when 'conversation_value' then 35
      when 'careful_curiosity' then 55
      when 'clear_match' then 80
      when 'strong_match' then 95
    end
    + p_overlap_width
    - case when p_talk_first then 2 else 0 end
    - case when p_has_conditions then 1 else 0 end));
$$;

-- ---------------------------------------------------------------------------
-- submit_answer(): validate -> store -> match server-side.
-- Returns {status:'recorded'} in EVERY case, so the response never signals
-- whether the partner has answered, or how (§29 spec). Matches surface only
-- through the RLS-guarded match_results table / realtime.
-- ---------------------------------------------------------------------------
create or replace function public.submit_answer(
  p_question_id uuid,
  p_interest text,
  p_role text default 'not_relevant',
  p_intensity_min integer default 1,
  p_intensity_max integer default 5,
  p_timing text default 'open',
  p_conditions text[] default '{}',
  p_answer_version integer default 1
)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_couple uuid;
  v_card question_cards%rowtype;
  v_partner answer_submissions%rowtype;
  v_match_type text;
  v_o_min integer; v_o_max integer;
  v_talk_first boolean; v_has_conditions boolean;
begin
  if v_user is null then raise exception 'auth required' using errcode = '28000'; end if;

  -- Validate enums (defense in depth on top of check constraints).
  if p_interest not in ('no','not_now','fantasy_only','maybe_with_conditions',
                        'would_try','already_like','skipped','hidden') then
    raise exception 'invalid input';
  end if;
  if p_role not in ('initiating','receiving','observing','switching','both','not_relevant') then
    raise exception 'invalid input';
  end if;
  if p_timing not in ('open','soon','someday','talk_first') then
    raise exception 'invalid input';
  end if;
  if p_intensity_min < 1 or p_intensity_max > 5 or p_intensity_min > p_intensity_max then
    raise exception 'invalid input';
  end if;
  if cardinality(p_conditions) > 10 then raise exception 'invalid input'; end if;

  select cm.couple_id into v_couple from couple_members cm
    join couples c on c.id = cm.couple_id
    where cm.user_id = v_user and cm.left_at is null and c.status = 'active';
  if v_couple is null then raise exception 'no_connection' using errcode = 'P0004'; end if;

  select * into v_card from question_cards where id = p_question_id and active = true;
  if not found then raise exception 'invalid input'; end if;

  insert into answer_submissions as a
    (couple_id, user_id, question_id, interest_level, role_preference,
     intensity_min, intensity_max, timing_preference, conditions, answer_version)
  values (v_couple, v_user, p_question_id, p_interest, p_role,
          p_intensity_min, p_intensity_max, p_timing, p_conditions, p_answer_version)
  on conflict (couple_id, user_id, question_id) do update set
    interest_level = excluded.interest_level,
    role_preference = excluded.role_preference,
    intensity_min = excluded.intensity_min,
    intensity_max = excluded.intensity_max,
    timing_preference = excluded.timing_preference,
    conditions = excluded.conditions,
    answer_version = greatest(a.answer_version, excluded.answer_version);

  -- Partner answer (lock to avoid a race when both submit simultaneously).
  select * into v_partner from answer_submissions
    where couple_id = v_couple and question_id = p_question_id and user_id <> v_user
    for update;

  if not found then
    return jsonb_build_object('status', 'recorded');
  end if;

  v_match_type := fn_interest_match(p_interest, v_partner.interest_level);
  v_o_min := greatest(p_intensity_min, v_partner.intensity_min);
  v_o_max := least(p_intensity_max, v_partner.intensity_max);

  if v_match_type is null
     or not fn_roles_compatible(v_card.role_model, p_role, v_partner.role_preference)
     or v_o_min > v_o_max then
    -- Answers changed to incompatible: remove a previous match silently.
    delete from match_results where couple_id = v_couple and question_id = p_question_id;
    return jsonb_build_object('status', 'recorded');
  end if;

  v_talk_first := (p_timing = 'talk_first' or v_partner.timing_preference = 'talk_first');
  v_has_conditions := (cardinality(p_conditions) > 0 or cardinality(v_partner.conditions) > 0);

  insert into match_results as m
    (couple_id, question_id, match_type, score, intensity_min, intensity_max,
     talk_first, has_conditions)
  values (v_couple, p_question_id, v_match_type,
          fn_match_score(v_match_type, v_o_max - v_o_min, v_talk_first, v_has_conditions),
          v_o_min, v_o_max, v_talk_first, v_has_conditions)
  on conflict (couple_id, question_id) do update set
    match_type = excluded.match_type,
    score = excluded.score,
    intensity_min = excluded.intensity_min,
    intensity_max = excluded.intensity_max,
    talk_first = excluded.talk_first,
    has_conditions = excluded.has_conditions;

  return jsonb_build_object('status', 'recorded');
end $$;

revoke all on function public.submit_answer(uuid, text, text, integer, integer, text, text[], integer) from public;
grant execute on function public.submit_answer(uuid, text, text, integer, integer, text, text[], integer) to authenticated;

-- ---------------------------------------------------------------------------
-- fn_get_discovery_cards(): official cards + partner wishes WITHOUT author.
-- The projection is the only way a partner ever sees a custom wish.
-- ---------------------------------------------------------------------------
create or replace function public.fn_get_discovery_cards()
returns table (
  id uuid, slug text, title text, prompt text, description text,
  category text, tags text[], intensity_level smallint, risk_level text,
  role_model text, allowed_roles text[], safety_note text,
  requires_safety_confirmation boolean, is_couple_card boolean
)
language plpgsql stable security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_couple uuid;
begin
  select cm.couple_id into v_couple from couple_members cm
    join couples c on c.id = cm.couple_id
    where cm.user_id = v_user and cm.left_at is null and c.status = 'active';

  return query
    select q.id, q.slug, q.title, q.prompt, q.description, q.category, q.tags,
           q.intensity_level, q.risk_level, q.role_model, q.allowed_roles,
           q.safety_note, q.requires_safety_confirmation, false
    from question_cards q where q.active = true
    union all
    select w.id, 'wish-' || w.id, w.title, w.prompt, null, w.category,
           array['eigener-wunsch'], w.intensity_level, 'medium', w.role_model,
           array['initiating','receiving','switching','both','not_relevant'],
           null, false, true
    from custom_wishes w
    where v_couple is not null
      and w.couple_id = v_couple
      and w.status = 'active'
      and w.created_by <> v_user; -- author never sees their own wish as a card
end $$;

revoke all on function public.fn_get_discovery_cards() from public;
grant execute on function public.fn_get_discovery_cards() to authenticated;

-- ---------------------------------------------------------------------------
-- create_custom_wish(): server-side validation of free text.
-- Length limits + HTML rejection + a minimal denylist. Real content
-- moderation before a public launch is documented in docs/CONTENT_GUIDELINES.md.
-- ---------------------------------------------------------------------------
create or replace function public.create_custom_wish(
  p_category text, p_title text, p_prompt text,
  p_role_model text default 'symmetric', p_intensity integer default 2
)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_couple uuid;
  v_blocked text[] := array[
    'minderjährig','minderjaehrig','kind ','kinder','teen','jugendlich',
    'ohne zustimmung','gegen ihren willen','gegen seinen willen','zwingen','zwang',
    'bewusstlos','betäub','betaeub','erpress','tier'];
  v_text text := lower(coalesce(p_title,'') || ' ' || coalesce(p_prompt,''));
  v_term text;
  v_id uuid;
begin
  if v_user is null then raise exception 'auth required' using errcode = '28000'; end if;

  select cm.couple_id into v_couple from couple_members cm
    join couples c on c.id = cm.couple_id
    where cm.user_id = v_user and cm.left_at is null and c.status = 'active';
  if v_couple is null then raise exception 'no_connection' using errcode = 'P0004'; end if;

  if p_title is null or char_length(trim(p_title)) < 3 or char_length(p_title) > 80
     or p_prompt is null or char_length(trim(p_prompt)) < 3 or char_length(p_prompt) > 280 then
    raise exception 'invalid input';
  end if;
  if p_title ~ '[<>]' or p_prompt ~ '[<>]' then
    raise exception 'invalid input';
  end if;
  if p_intensity < 1 or p_intensity > 5 then raise exception 'invalid input'; end if;

  foreach v_term in array v_blocked loop
    if position(v_term in v_text) > 0 then
      raise exception 'content_not_allowed' using errcode = 'P0005';
    end if;
  end loop;

  insert into custom_wishes (couple_id, created_by, category, title, prompt, role_model, intensity_level)
  values (v_couple, v_user, p_category, trim(p_title), trim(p_prompt), p_role_model, p_intensity)
  returning id into v_id;

  return jsonb_build_object('id', v_id);
end $$;

revoke all on function public.create_custom_wish(text, text, text, text, integer) from public;
grant execute on function public.create_custom_wish(text, text, text, text, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- report_couple_card(): either member can report/remove a couple card.
-- ---------------------------------------------------------------------------
create or replace function public.report_couple_card(p_wish_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_couple uuid;
begin
  select couple_id into v_couple from custom_wishes where id = p_wish_id;
  if v_couple is null or not fn_is_couple_member(v_couple) then
    raise exception 'not found';
  end if;
  update custom_wishes set status = 'reported' where id = p_wish_id;
  insert into audit_events (user_id, couple_id, event_type) values (v_user, v_couple, 'wish_reported');
end $$;

revoke all on function public.report_couple_card(uuid) from public;
grant execute on function public.report_couple_card(uuid) to authenticated;
