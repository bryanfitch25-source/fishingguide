-- Phase E of the trip planner: sharing with a specific account, not just anyone with a
-- link (see get_shared_trip in the Phase 2 migration for that first, still-separate
-- mechanism — this is additive, not a replacement).
--
-- trip_shares is the join: one row per (trip, invited user). invited_email is a
-- snapshot taken at invite time rather than a live join to auth.users on every read —
-- the owner's client can't query auth.users directly (see invite_to_trip below), and a
-- stale email after someone changes theirs is a cosmetic issue, not a correctness one.
create table if not exists trip_shares (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  invited_user_id uuid not null references auth.users(id) on delete cascade,
  invited_email text not null,
  created_at timestamptz not null default now(),
  unique (trip_id, invited_user_id)
);

create index if not exists trip_shares_invited_user_idx on trip_shares (invited_user_id);
create index if not exists trip_shares_trip_idx on trip_shares (trip_id);

alter table trip_shares enable row level security;

-- Whether the signed-in user owns the given trip — SECURITY DEFINER so it queries trips
-- directly rather than through trips' own RLS. That distinction matters: the trip_shares
-- owner policy below needs this check, and trips' "Invited user reads shared trips"
-- policy (further down) queries trip_shares right back — a plain `exists (select 1 from
-- trips ...)` here would make each table's policy re-trigger the other's, infinitely.
-- Routing the ownership check through a function that bypasses RLS breaks that cycle.
create or replace function is_trip_owner(p_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from trips where id = p_trip_id and user_id = auth.uid());
$$;

grant execute on function is_trip_owner(uuid) to authenticated;

-- The trip's owner manages its invites — nobody can use a trip_id they don't own to
-- invite someone, or see who's invited to a trip that isn't theirs.
drop policy if exists "Trip owner manages its shares" on trip_shares;
create policy "Trip owner manages its shares" on trip_shares
  for all
  using (is_trip_owner(trip_id))
  with check (is_trip_owner(trip_id));

-- An invited user can see their own invite rows (to list "shared with you") and remove
-- one (to leave a trip they no longer want to see) — nothing about anyone else's.
drop policy if exists "Invited user sees own shares" on trip_shares;
create policy "Invited user sees own shares" on trip_shares
  for select
  using (auth.uid() = invited_user_id);

drop policy if exists "Invited user can remove own share" on trip_shares;
create policy "Invited user can remove own share" on trip_shares
  for delete
  using (auth.uid() = invited_user_id);

grant select, insert, delete on trip_shares to authenticated;

-- Read-only access to the trip itself for whoever it's been shared with. Postgres RLS
-- policies are OR'd together per command, so this only ever adds a select path — it
-- can't widen what the existing "Owner full access to own trips" policy requires for
-- insert/update/delete, which stays owner-only.
drop policy if exists "Invited user reads shared trips" on trips;
create policy "Invited user reads shared trips" on trips
  for select
  using (exists (select 1 from trip_shares where trip_shares.trip_id = trips.id and trip_shares.invited_user_id = auth.uid()));

-- Turns an email into an invite. auth.users isn't queryable from the client at all (no
-- RLS policy grants it), so this SECURITY DEFINER function is the only safe way to
-- resolve one — and it only ever inserts a single trip_shares row for the trip the
-- caller already owns, never anything that exposes another account's data back to them.
--
-- Only an existing account can be invited. A bigger email-invite system for someone who
-- hasn't signed up yet is real added scope beyond "share with a specific account" and
-- isn't built here.
create or replace function invite_to_trip(p_trip_id uuid, p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_invitee_id uuid;
  v_invitee_email text;
begin
  select user_id into v_owner from trips where id = p_trip_id;
  if v_owner is null or v_owner != auth.uid() then
    raise exception 'NOT_OWNER: only a trip''s owner can invite someone to it'
      using errcode = 'insufficient_privilege';
  end if;

  select id, email into v_invitee_id, v_invitee_email
  from auth.users where lower(email) = lower(trim(p_email));
  if v_invitee_id is null then
    raise exception 'NO_SUCH_ACCOUNT: no Maritime Angler account with that email'
      using errcode = 'no_data_found';
  end if;

  if v_invitee_id = v_owner then
    raise exception 'CANNOT_INVITE_SELF: you already own this trip'
      using errcode = 'check_violation';
  end if;

  insert into trip_shares (trip_id, invited_user_id, invited_email)
  values (p_trip_id, v_invitee_id, v_invitee_email)
  on conflict (trip_id, invited_user_id) do nothing;
end;
$$;

grant execute on function invite_to_trip(uuid, text) to authenticated;
