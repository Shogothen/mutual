-- MUTUAL – deletion & dissolution (§7 spec).
-- Every option explains in the UI what it deletes; here each scope maps to a
-- hard delete. Nothing sensitive is soft-deleted.

-- Delete only my own answers (matches derived from them are removed too,
-- because they no longer rest on two compatible answers).
create or replace function public.delete_own_answers()
returns void language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_couple uuid;
begin
  select couple_id into v_couple from couple_members
    where user_id = v_user and left_at is null;
  delete from answer_submissions where user_id = v_user;
  if v_couple is not null then
    delete from match_results where couple_id = v_couple;
  end if;
  insert into data_deletion_requests (user_id, scope, completed_at)
    values (v_user, 'own_answers', now());
  insert into audit_events (user_id, couple_id, event_type)
    values (v_user, v_couple, 'answers_deleted');
end $$;

revoke all on function public.delete_own_answers() from public;
grant execute on function public.delete_own_answers() to authenticated;

-- Delete all shared matches (both people lose them; answers stay).
create or replace function public.delete_couple_matches()
returns void language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_couple uuid;
begin
  select couple_id into v_couple from couple_members
    where user_id = v_user and left_at is null;
  if v_couple is null then raise exception 'no_connection' using errcode = 'P0004'; end if;
  delete from match_results where couple_id = v_couple;
  insert into data_deletion_requests (user_id, scope, completed_at)
    values (v_user, 'couple_matches', now());
  insert into audit_events (user_id, couple_id, event_type)
    values (v_user, v_couple, 'matches_deleted');
end $$;

revoke all on function public.delete_couple_matches() from public;
grant execute on function public.delete_couple_matches() to authenticated;

-- Dissolve the connection. Either person may do this at any time.
-- Removes everything the couple shares; each person's own answers are
-- deleted as well because they are keyed to the couple context.
create or replace function public.dissolve_couple()
returns void language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_couple uuid;
begin
  select couple_id into v_couple from couple_members
    where user_id = v_user and left_at is null;
  if v_couple is null then raise exception 'no_connection' using errcode = 'P0004'; end if;

  delete from match_results where couple_id = v_couple;
  delete from answer_submissions where couple_id = v_couple;
  delete from custom_wishes where couple_id = v_couple;
  delete from check_ins where couple_id = v_couple;
  delete from check_in_shares where couple_id = v_couple;
  delete from shared_boundaries where couple_id = v_couple;
  delete from shared_plans where couple_id = v_couple;
  delete from pairing_invites where couple_id = v_couple;
  update couple_members set left_at = now() where couple_id = v_couple and left_at is null;
  update couples set status = 'dissolved' where id = v_couple;

  insert into data_deletion_requests (user_id, scope, completed_at)
    values (v_user, 'dissolve_couple', now());
  insert into audit_events (user_id, couple_id, event_type)
    values (v_user, v_couple, 'couple_dissolved');
end $$;

revoke all on function public.dissolve_couple() from public;
grant execute on function public.dissolve_couple() to authenticated;

-- Full account deletion: dissolves any connection, then removes the auth
-- user. All owned rows cascade via FKs.
create or replace function public.delete_account()
returns void language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_couple uuid;
begin
  if v_user is null then raise exception 'auth required' using errcode = '28000'; end if;
  select couple_id into v_couple from couple_members
    where user_id = v_user and left_at is null;
  if v_couple is not null then
    perform public.dissolve_couple();
  end if;
  insert into data_deletion_requests (user_id, scope, completed_at)
    values (v_user, 'full_account', now());
  insert into audit_events (user_id, event_type) values (null, 'account_deleted');
  delete from auth.users where id = v_user;
end $$;

revoke all on function public.delete_account() from public;
grant execute on function public.delete_account() to authenticated;
