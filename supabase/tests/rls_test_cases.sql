-- MUTUAL – RLS security test cases (§28 spec).
-- Run against a local Supabase instance:  psql "$DB_URL" -f supabase/tests/rls_test_cases.sql
-- Each block simulates a JWT via request.jwt.claims and asserts that the
-- attack FAILS (0 rows or an exception). See docs/SECURITY.md.

begin;

-- Fixtures: two couples, three users.
insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-0000000000a2'),
  ('00000000-0000-0000-0000-0000000000b1')
on conflict do nothing;

insert into public.couples (id) values
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222');

insert into public.couple_members (couple_id, user_id) values
  ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-0000000000a1'),
  ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-0000000000a2'),
  ('22222222-2222-2222-2222-222222222222','00000000-0000-0000-0000-0000000000b1');

insert into public.question_cards (id, slug, title, prompt, category, intensity_level, risk_level, role_model)
values ('33333333-3333-3333-3333-333333333333','test-card','Test','Testprompt','kommunikation',1,'low','symmetric');

-- A2 answers a card.
insert into public.answer_submissions (couple_id, user_id, question_id, interest_level)
values ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-0000000000a2',
        '33333333-3333-3333-3333-333333333333','would_try');

insert into public.match_results (couple_id, question_id, match_type, score, intensity_min, intensity_max)
values ('11111111-1111-1111-1111-111111111111','33333333-3333-3333-3333-333333333333','clear_match',80,1,3);

insert into public.custom_wishes (couple_id, created_by, category, title, prompt)
values ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-0000000000a2',
        'kommunikation','Geheimer Wunsch','Nur für den Autor sichtbar');

insert into public.pairing_invites (couple_id, created_by, code_hash, expires_at)
values ('22222222-2222-2222-2222-222222222222','00000000-0000-0000-0000-0000000000b1',
        digest('deadbeefdeadbeefdeadbeefdeadbeef','sha256'), now() + interval '1 day');

-- Helper to become a user.
create or replace function pg_temp.become(p_user uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', p_user::text, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
end $$;

do $$
declare v_count int;
begin
  -- TEST 1: A1 must NOT read A2's answers (partner answers).
  perform pg_temp.become('00000000-0000-0000-0000-0000000000a1');
  select count(*) into v_count from public.answer_submissions
    where user_id = '00000000-0000-0000-0000-0000000000a2';
  if v_count <> 0 then raise exception 'FAIL 1: partner answers readable'; end if;

  -- TEST 2: B1 must NOT read answers of a foreign couple.
  perform pg_temp.become('00000000-0000-0000-0000-0000000000b1');
  select count(*) into v_count from public.answer_submissions
    where couple_id = '11111111-1111-1111-1111-111111111111';
  if v_count <> 0 then raise exception 'FAIL 2: foreign couple answers readable'; end if;

  -- TEST 3: B1 must NOT read matches of a foreign couple.
  select count(*) into v_count from public.match_results
    where couple_id = '11111111-1111-1111-1111-111111111111';
  if v_count <> 0 then raise exception 'FAIL 3: foreign couple matches readable'; end if;

  -- TEST 4: A1 must NOT read A2's hidden custom wish directly.
  perform pg_temp.become('00000000-0000-0000-0000-0000000000a1');
  select count(*) into v_count from public.custom_wishes
    where created_by = '00000000-0000-0000-0000-0000000000a2';
  if v_count <> 0 then raise exception 'FAIL 4: partner wish readable with author'; end if;

  -- TEST 5: invite code hashes must never be selectable.
  perform pg_temp.become('00000000-0000-0000-0000-0000000000b1');
  select count(*) into v_count from public.pairing_invites;
  if v_count <> 0 then raise exception 'FAIL 5: invite tokens readable'; end if;

  -- TEST 6: manipulated user_id on insert must fail.
  perform pg_temp.become('00000000-0000-0000-0000-0000000000a1');
  begin
    insert into public.answer_submissions (couple_id, user_id, question_id, interest_level)
    values ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-0000000000a2',
            '33333333-3333-3333-3333-333333333333','no');
    raise exception 'FAIL 6: could write answer as another user';
  exception when insufficient_privilege or check_violation then null;
           when others then if sqlerrm like 'FAIL%' then raise; end if;
  end;

  -- TEST 7: third person joining a full couple must fail (redeem path guards
  -- this; direct insert is blocked because there is no insert policy).
  perform pg_temp.become('00000000-0000-0000-0000-0000000000b1');
  begin
    insert into public.couple_members (couple_id, user_id)
    values ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-0000000000b1');
    raise exception 'FAIL 7: could join a foreign couple directly';
  exception when insufficient_privilege then null;
           when others then if sqlerrm like 'FAIL%' then raise; end if;
  end;

  -- TEST 8: reused/guessed invite codes fail generically.
  begin
    perform public.redeem_invite('00000000000000000000000000000000');
    raise exception 'FAIL 8: guessed invite accepted';
  exception when others then
    if sqlerrm like 'FAIL%' then raise; end if;
    if sqlerrm not in ('invalid_or_expired','too_many_attempts','already_connected') then
      raise exception 'FAIL 8b: unexpected leakage: %', sqlerrm;
    end if;
  end;

  raise notice 'ALL RLS TESTS PASSED';
end $$;

rollback;
