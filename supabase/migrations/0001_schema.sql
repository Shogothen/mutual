-- MUTUAL – core schema
-- All tables use UUID PKs, created_at/updated_at, FKs, unique + check constraints.
-- Sensitive user data is hard-deletable (see 0005_deletion.sql).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- profiles: 1:1 with auth.users (anonymous accounts). No real names, ever.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_alias text check (char_length(display_alias) <= 24),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on public.profiles
  for each row execute function public.tg_set_updated_at();

-- Auto-create a profile for every new auth user.
create or replace function public.tg_handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.tg_handle_new_user();

-- ---------------------------------------------------------------------------
-- couples & memberships. Structured so other constellations could be
-- supported later (member limit lives in logic, not in the schema shape).
-- ---------------------------------------------------------------------------
create table public.couples (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'active' check (status in ('active', 'dissolved')),
  max_members smallint not null default 2 check (max_members between 2 and 8),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on public.couples
  for each row execute function public.tg_set_updated_at();

create table public.couple_members (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (couple_id, user_id)
);
create trigger set_updated_at before update on public.couple_members
  for each row execute function public.tg_set_updated_at();

-- One active membership per person.
create unique index couple_members_one_active_per_user
  on public.couple_members (user_id) where left_at is null;
create index couple_members_couple_idx on public.couple_members (couple_id);

-- Helper: is the current user an active member of this couple?
create or replace function public.fn_is_couple_member(p_couple_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.couple_members cm
    join public.couples c on c.id = cm.couple_id
    where cm.couple_id = p_couple_id
      and cm.user_id = auth.uid()
      and cm.left_at is null
      and c.status = 'active'
  );
$$;

-- ---------------------------------------------------------------------------
-- pairing_invites: only hashes are stored; codes are shown exactly once.
-- ---------------------------------------------------------------------------
create table public.pairing_invites (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete cascade,
  code_hash bytea not null unique,
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  redeemed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index pairing_invites_couple_idx on public.pairing_invites (couple_id);

-- Brute-force protection ledger (no codes stored, only attempt timestamps).
create table public.invite_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  attempted_at timestamptz not null default now()
);
create index invite_attempts_user_time_idx on public.invite_attempts (user_id, attempted_at);

-- ---------------------------------------------------------------------------
-- question_cards: official content. Custom wishes live in custom_wishes.
-- ---------------------------------------------------------------------------
create table public.question_cards (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  version integer not null default 1 check (version >= 1),
  locale text not null default 'de' check (locale in ('de')),
  title text not null check (char_length(title) <= 80),
  prompt text not null check (char_length(prompt) <= 400),
  description text check (char_length(description) <= 600),
  category text not null check (category in (
    'naehe_atmosphaere','kommunikation','initiative','rollen_dynamik',
    'langsames_ausprobieren','sinnliche_wahrnehmung','kleidung_inszenierung',
    'fantasie_rollenspiel','beobachten_gesehen_werden','kontrolle',
    'orte_situationen','hilfsmittel','intensitaet','neues_ausprobieren',
    'digitale_naehe','nachsorge','grenzen_tabus','gespraechsimpulse')),
  tags text[] not null default '{}',
  intensity_level smallint not null check (intensity_level between 1 and 5),
  risk_level text not null check (risk_level in ('low','medium','high')),
  role_model text not null check (role_model in
    ('symmetric','directional','observer','switchable','not_relevant')),
  allowed_roles text[] not null default '{not_relevant}',
  safety_note text check (char_length(safety_note) <= 400),
  requires_safety_confirmation boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on public.question_cards
  for each row execute function public.tg_set_updated_at();
create index question_cards_active_idx on public.question_cards (active, category, intensity_level);

-- ---------------------------------------------------------------------------
-- answer_submissions: strictly private per person. Never readable by partner.
-- ---------------------------------------------------------------------------
create table public.answer_submissions (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id uuid not null references public.question_cards (id) on delete cascade,
  interest_level text not null check (interest_level in
    ('no','not_now','fantasy_only','maybe_with_conditions','would_try','already_like','skipped','hidden')),
  role_preference text not null default 'not_relevant' check (role_preference in
    ('initiating','receiving','observing','switching','both','not_relevant')),
  intensity_min smallint not null default 1 check (intensity_min between 1 and 5),
  intensity_max smallint not null default 5 check (intensity_max between 1 and 5),
  timing_preference text not null default 'open' check (timing_preference in
    ('open','soon','someday','talk_first')),
  conditions text[] not null default '{}',
  answer_version integer not null default 1 check (answer_version >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (couple_id, user_id, question_id),
  check (intensity_min <= intensity_max),
  check (cardinality(conditions) <= 10)
);
create trigger set_updated_at before update on public.answer_submissions
  for each row execute function public.tg_set_updated_at();
create index answer_submissions_lookup_idx
  on public.answer_submissions (couple_id, question_id);

-- ---------------------------------------------------------------------------
-- match_results: ONLY data both people may see. Raw answers are never copied.
-- ---------------------------------------------------------------------------
create table public.match_results (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  question_id uuid not null references public.question_cards (id) on delete cascade,
  match_type text not null check (match_type in
    ('shared_fantasy','conversation_value','careful_curiosity','clear_match','strong_match')),
  score smallint not null check (score between 0 and 100),
  intensity_min smallint not null check (intensity_min between 1 and 5),
  intensity_max smallint not null check (intensity_max between 1 and 5),
  talk_first boolean not null default false,
  has_conditions boolean not null default false,
  status text not null default 'discovered' check (status in
    ('discovered','reconfirmed','talking','boundaries_aligned','planned',
     'experienced','debriefed','paused','archived','withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (couple_id, question_id),
  check (intensity_min <= intensity_max)
);
create trigger set_updated_at before update on public.match_results
  for each row execute function public.tg_set_updated_at();
create index match_results_couple_idx on public.match_results (couple_id, status);

-- ---------------------------------------------------------------------------
-- match_confirmations: private per-person reconfirmation after a match.
-- ---------------------------------------------------------------------------
create table public.match_confirmations (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.match_results (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  confirmation text not null check (confirmation in
    ('wants_to_talk','keep_as_fantasy','unsure','not_current','hide')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (match_id, user_id)
);
create trigger set_updated_at before update on public.match_confirmations
  for each row execute function public.tg_set_updated_at();

-- ---------------------------------------------------------------------------
-- shared_boundaries: explicit double confirmation, silence never = consent.
-- ---------------------------------------------------------------------------
create table public.shared_boundaries (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.match_results (id) on delete cascade,
  couple_id uuid not null references public.couples (id) on delete cascade,
  proposed_by uuid not null references auth.users (id) on delete cascade,
  boundary_text text not null check (char_length(boundary_text) between 1 and 280),
  status text not null default 'proposed' check (status in
    ('proposed','confirmed','declined','amended')),
  responded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (responded_by is distinct from proposed_by)
);
create trigger set_updated_at before update on public.shared_boundaries
  for each row execute function public.tg_set_updated_at();
create index shared_boundaries_match_idx on public.shared_boundaries (match_id);

-- ---------------------------------------------------------------------------
-- shared_plans
-- ---------------------------------------------------------------------------
create table public.shared_plans (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.match_results (id) on delete cascade,
  couple_id uuid not null references public.couples (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) <= 120),
  first_step text check (char_length(first_step) <= 280),
  stop_signal text check (char_length(stop_signal) <= 80),
  planned_for date,
  status text not null default 'draft' check (status in ('draft','agreed','done','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on public.shared_plans
  for each row execute function public.tg_set_updated_at();
create index shared_plans_match_idx on public.shared_plans (match_id);

-- ---------------------------------------------------------------------------
-- check_ins (private) + check_in_shares (explicitly released content only)
-- ---------------------------------------------------------------------------
create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.match_results (id) on delete cascade,
  couple_id uuid not null references public.couples (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  felt_safe boolean,
  felt_heard boolean,
  boundaries_respected boolean,
  wants_repeat text check (wants_repeat in ('yes','maybe','no')),
  private_note text check (char_length(private_note) <= 600),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (match_id, user_id)
);
create trigger set_updated_at before update on public.check_ins
  for each row execute function public.tg_set_updated_at();

create table public.check_in_shares (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.match_results (id) on delete cascade,
  couple_id uuid not null references public.couples (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  shared_text text not null check (char_length(shared_text) between 1 and 400),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on public.check_in_shares
  for each row execute function public.tg_set_updated_at();
create index check_in_shares_match_idx on public.check_in_shares (match_id);

-- ---------------------------------------------------------------------------
-- custom_wishes: authored cards, surfaced to the partner without the author.
-- ---------------------------------------------------------------------------
create table public.custom_wishes (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete cascade,
  category text not null check (category in (
    'naehe_atmosphaere','kommunikation','initiative','rollen_dynamik',
    'langsames_ausprobieren','sinnliche_wahrnehmung','kleidung_inszenierung',
    'fantasie_rollenspiel','beobachten_gesehen_werden','kontrolle',
    'orte_situationen','hilfsmittel','intensitaet','neues_ausprobieren',
    'digitale_naehe','nachsorge','grenzen_tabus','gespraechsimpulse')),
  title text not null check (char_length(title) between 3 and 80),
  prompt text not null check (char_length(prompt) between 3 and 280),
  role_model text not null default 'symmetric' check (role_model in
    ('symmetric','directional','observer','switchable','not_relevant')),
  intensity_level smallint not null default 2 check (intensity_level between 1 and 5),
  status text not null default 'active' check (status in ('active','reported','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on public.custom_wishes
  for each row execute function public.tg_set_updated_at();
create index custom_wishes_couple_idx on public.custom_wishes (couple_id, status);

-- ---------------------------------------------------------------------------
-- user_settings (non-sensitive), audit_events (no free text, no answer data),
-- data_deletion_requests
-- ---------------------------------------------------------------------------
create table public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on public.user_settings
  for each row execute function public.tg_set_updated_at();

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  couple_id uuid references public.couples (id) on delete set null,
  event_type text not null check (event_type in (
    'couple_created','invite_created','invite_redeemed','couple_dissolved',
    'answers_deleted','matches_deleted','account_deleted','wish_reported')),
  created_at timestamptz not null default now()
);
create index audit_events_user_idx on public.audit_events (user_id, created_at);

create table public.data_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  scope text not null check (scope in
    ('own_answers','couple_matches','dissolve_couple','full_account')),
  status text not null default 'completed' check (status in ('pending','completed','failed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
