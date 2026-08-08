-- MUTUAL – pairing: couple creation, invite issuing & redemption.
-- Invite tokens: 16 random bytes (128 bit entropy), shown once, stored as
-- SHA-256 hash only. Redemption is rate-limited and race-safe.

-- ---------------------------------------------------------------------------
-- create_couple_with_invite(): creates couple + membership + invite.
-- Returns the plaintext code exactly once.
-- ---------------------------------------------------------------------------
create or replace function public.create_couple_with_invite(p_expiry_hours integer default 48)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_couple uuid;
  v_code text;
begin
  if v_user is null then
    raise exception 'auth required' using errcode = '28000';
  end if;
  if p_expiry_hours < 1 or p_expiry_hours > 168 then
    raise exception 'invalid expiry';
  end if;
  -- One active connection per person.
  if exists (select 1 from couple_members where user_id = v_user and left_at is null) then
    raise exception 'already_connected' using errcode = 'P0001';
  end if;

  insert into couples default values returning id into v_couple;
  insert into couple_members (couple_id, user_id) values (v_couple, v_user);

  -- 128-bit token, hex-encoded, grouped for readability (8 groups of 4).
  v_code := encode(gen_random_bytes(16), 'hex');
  insert into pairing_invites (couple_id, created_by, code_hash, expires_at)
  values (v_couple, v_user, digest(v_code, 'sha256'), now() + make_interval(hours => p_expiry_hours));

  insert into audit_events (user_id, couple_id, event_type) values (v_user, v_couple, 'couple_created');
  insert into audit_events (user_id, couple_id, event_type) values (v_user, v_couple, 'invite_created');

  return jsonb_build_object('couple_id', v_couple, 'invite_code', v_code,
                            'expires_at', now() + make_interval(hours => p_expiry_hours));
end $$;

revoke all on function public.create_couple_with_invite(integer) from public;
grant execute on function public.create_couple_with_invite(integer) to authenticated;

-- ---------------------------------------------------------------------------
-- redeem_invite(code): rate-limited, race-safe, generic errors only.
-- ---------------------------------------------------------------------------
create or replace function public.redeem_invite(p_code text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_invite pairing_invites%rowtype;
  v_members integer;
  v_attempts integer;
begin
  if v_user is null then
    raise exception 'auth required' using errcode = '28000';
  end if;

  -- Rate limit: max 5 attempts per 15 minutes per user.
  select count(*) into v_attempts from invite_attempts
    where user_id = v_user and attempted_at > now() - interval '15 minutes';
  if v_attempts >= 5 then
    raise exception 'too_many_attempts' using errcode = 'P0002';
  end if;
  insert into invite_attempts (user_id) values (v_user);

  if p_code is null or length(p_code) <> 32 or p_code !~ '^[0-9a-f]+$' then
    raise exception 'invalid_or_expired' using errcode = 'P0003';
  end if;

  if exists (select 1 from couple_members where user_id = v_user and left_at is null) then
    raise exception 'already_connected' using errcode = 'P0001';
  end if;

  -- Lock the invite row to prevent double redemption races.
  select * into v_invite from pairing_invites
    where code_hash = digest(p_code, 'sha256')
      and redeemed_at is null
      and expires_at > now()
    for update;

  if not found then
    -- Generic message: no signal whether the code existed, expired or was used.
    raise exception 'invalid_or_expired' using errcode = 'P0003';
  end if;

  if v_invite.created_by = v_user then
    raise exception 'invalid_or_expired' using errcode = 'P0003';
  end if;

  -- Lock the couple and enforce the member limit atomically.
  perform 1 from couples where id = v_invite.couple_id and status = 'active' for update;
  if not found then
    raise exception 'invalid_or_expired' using errcode = 'P0003';
  end if;

  select count(*) into v_members from couple_members
    where couple_id = v_invite.couple_id and left_at is null;
  if v_members >= (select max_members from couples where id = v_invite.couple_id) then
    raise exception 'invalid_or_expired' using errcode = 'P0003';
  end if;

  insert into couple_members (couple_id, user_id) values (v_invite.couple_id, v_user);
  update pairing_invites set redeemed_at = now(), redeemed_by = v_user where id = v_invite.id;

  insert into audit_events (user_id, couple_id, event_type)
  values (v_user, v_invite.couple_id, 'invite_redeemed');

  return jsonb_build_object('couple_id', v_invite.couple_id);
end $$;

revoke all on function public.redeem_invite(text) from public;
grant execute on function public.redeem_invite(text) to authenticated;

-- ---------------------------------------------------------------------------
-- get_my_connection(): neutral connection status for the current user.
-- ---------------------------------------------------------------------------
create or replace function public.get_my_connection()
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_couple uuid;
  v_members integer;
begin
  select cm.couple_id into v_couple from couple_members cm
    join couples c on c.id = cm.couple_id
    where cm.user_id = v_user and cm.left_at is null and c.status = 'active';
  if v_couple is null then
    return jsonb_build_object('connected', false);
  end if;
  select count(*) into v_members from couple_members
    where couple_id = v_couple and left_at is null;
  return jsonb_build_object('connected', true, 'couple_id', v_couple,
                            'complete', v_members >= 2);
end $$;

revoke all on function public.get_my_connection() from public;
grant execute on function public.get_my_connection() to authenticated;

-- ---------------------------------------------------------------------------
-- get_partner_activity(): aggregated progress only – never counts per
-- category, never which cards (§5 spec).
-- ---------------------------------------------------------------------------
create or replace function public.get_partner_activity()
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_couple uuid;
  v_active boolean;
begin
  select cm.couple_id into v_couple from couple_members cm
    join couples c on c.id = cm.couple_id
    where cm.user_id = v_user and cm.left_at is null and c.status = 'active';
  if v_couple is null then
    return jsonb_build_object('partner_active_today', false);
  end if;
  select exists (
    select 1 from answer_submissions
    where couple_id = v_couple and user_id <> v_user
      and updated_at > date_trunc('day', now())
  ) into v_active;
  return jsonb_build_object('partner_active_today', v_active);
end $$;

revoke all on function public.get_partner_activity() from public;
grant execute on function public.get_partner_activity() to authenticated;
