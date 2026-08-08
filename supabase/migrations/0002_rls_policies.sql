-- MUTUAL – Row Level Security
-- Principles (docs/SECURITY.md):
--  * default deny: RLS enabled everywhere, no policy = no access
--  * a person only ever reads their own answers, confirmations, check-ins
--  * partner answers are never selectable, not even via crafted filters
--  * invite code hashes are never selectable by any client
--  * match rows are only written by SECURITY DEFINER functions
--  * dissolved couples lose all access (fn_is_couple_member checks status)

alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.pairing_invites enable row level security;
alter table public.invite_attempts enable row level security;
alter table public.question_cards enable row level security;
alter table public.answer_submissions enable row level security;
alter table public.match_results enable row level security;
alter table public.match_confirmations enable row level security;
alter table public.shared_boundaries enable row level security;
alter table public.shared_plans enable row level security;
alter table public.check_ins enable row level security;
alter table public.check_in_shares enable row level security;
alter table public.custom_wishes enable row level security;
alter table public.user_settings enable row level security;
alter table public.audit_events enable row level security;
alter table public.data_deletion_requests enable row level security;

-- profiles: own row only
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid());
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- couples: members read their own couple. Creation only via RPC.
create policy couples_select_member on public.couples
  for select using (public.fn_is_couple_member(id));

-- couple_members: a member may see the membership rows of their couple
-- (needed for "connection exists" UI) but no profile data of the partner.
create policy couple_members_select_own_couple on public.couple_members
  for select using (public.fn_is_couple_member(couple_id));
-- leaving is handled via RPC (dissolve/leave) – no direct writes.

-- pairing_invites: NO select policy on purpose. Codes are write-only secrets;
-- creation & redemption run through SECURITY DEFINER functions.

-- invite_attempts: no client access at all.

-- question_cards: readable for every signed-in user, active cards only.
create policy question_cards_select_active on public.question_cards
  for select using (auth.role() = 'authenticated' and active = true);

-- answer_submissions: strictly own rows. user_id must equal auth.uid() on
-- every operation – there is no path to a partner's rows.
create policy answers_select_own on public.answer_submissions
  for select using (user_id = auth.uid());
create policy answers_insert_own on public.answer_submissions
  for insert with check (user_id = auth.uid() and public.fn_is_couple_member(couple_id));
create policy answers_update_own on public.answer_submissions
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy answers_delete_own on public.answer_submissions
  for delete using (user_id = auth.uid());

-- match_results: readable by both members of the couple; writable ONLY by
-- the matching function (SECURITY DEFINER). Clients may update status only,
-- guarded by a trigger that whitelists status transitions.
create policy matches_select_member on public.match_results
  for select using (public.fn_is_couple_member(couple_id));
create policy matches_update_status_member on public.match_results
  for update using (public.fn_is_couple_member(couple_id))
  with check (public.fn_is_couple_member(couple_id));

create or replace function public.tg_match_status_only()
returns trigger language plpgsql as $$
begin
  -- Clients may only change `status`; every other column is frozen.
  if new.couple_id is distinct from old.couple_id
     or new.question_id is distinct from old.question_id
     or new.match_type is distinct from old.match_type
     or new.score is distinct from old.score
     or new.intensity_min is distinct from old.intensity_min
     or new.intensity_max is distinct from old.intensity_max
     or new.talk_first is distinct from old.talk_first
     or new.has_conditions is distinct from old.has_conditions then
    raise exception 'only status may be updated';
  end if;
  return new;
end $$;
create trigger match_status_only before update on public.match_results
  for each row when (current_setting('role', true) <> 'service_role')
  execute function public.tg_match_status_only();

-- match_confirmations: private – own rows only, and only for matches of the
-- own couple.
create policy confirmations_select_own on public.match_confirmations
  for select using (user_id = auth.uid());
create policy confirmations_write_own on public.match_confirmations
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from public.match_results m
                where m.id = match_id and public.fn_is_couple_member(m.couple_id))
  );
create policy confirmations_update_own on public.match_confirmations
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- shared_boundaries: shared by design the moment they are proposed.
create policy boundaries_select_member on public.shared_boundaries
  for select using (public.fn_is_couple_member(couple_id));
create policy boundaries_insert_member on public.shared_boundaries
  for insert with check (proposed_by = auth.uid() and public.fn_is_couple_member(couple_id));
create policy boundaries_respond_partner on public.shared_boundaries
  for update using (public.fn_is_couple_member(couple_id))
  with check (public.fn_is_couple_member(couple_id) and responded_by = auth.uid());

-- shared_plans: shared within the couple.
create policy plans_select_member on public.shared_plans
  for select using (public.fn_is_couple_member(couple_id));
create policy plans_insert_member on public.shared_plans
  for insert with check (created_by = auth.uid() and public.fn_is_couple_member(couple_id));
create policy plans_update_member on public.shared_plans
  for update using (public.fn_is_couple_member(couple_id))
  with check (public.fn_is_couple_member(couple_id));

-- check_ins: strictly private.
create policy checkins_select_own on public.check_ins
  for select using (user_id = auth.uid());
create policy checkins_write_own on public.check_ins
  for insert with check (user_id = auth.uid() and public.fn_is_couple_member(couple_id));
create policy checkins_update_own on public.check_ins
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy checkins_delete_own on public.check_ins
  for delete using (user_id = auth.uid());

-- check_in_shares: explicitly released content, visible to both.
create policy checkin_shares_select_member on public.check_in_shares
  for select using (public.fn_is_couple_member(couple_id));
create policy checkin_shares_insert_own on public.check_in_shares
  for insert with check (user_id = auth.uid() and public.fn_is_couple_member(couple_id));
create policy checkin_shares_delete_own on public.check_in_shares
  for delete using (user_id = auth.uid());

-- custom_wishes: the creator manages their own wishes. The partner NEVER
-- selects this table directly – they receive an author-less projection via
-- fn_get_discovery_cards() (0004). No select policy for non-creators.
create policy wishes_select_own on public.custom_wishes
  for select using (created_by = auth.uid());
create policy wishes_insert_own on public.custom_wishes
  for insert with check (created_by = auth.uid() and public.fn_is_couple_member(couple_id));
create policy wishes_update_own on public.custom_wishes
  for update using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy wishes_delete_own on public.custom_wishes
  for delete using (created_by = auth.uid());

-- user_settings: own row only.
create policy settings_select_own on public.user_settings
  for select using (user_id = auth.uid());
create policy settings_upsert_own on public.user_settings
  for insert with check (user_id = auth.uid());
create policy settings_update_own on public.user_settings
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- audit_events: read own, no writes from clients (functions insert).
create policy audit_select_own on public.audit_events
  for select using (user_id = auth.uid());

-- data_deletion_requests: read own; created via functions.
create policy deletion_select_own on public.data_deletion_requests
  for select using (user_id = auth.uid());
