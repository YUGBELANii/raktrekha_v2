-- Harden private contact access and request authorization.
-- 1) Separate emergency contact from counterparty-readable contact info.
-- 2) Tighten profile_contacts RLS to least privilege.
-- 3) Tighten blood request update rules.

-- Emergency contact is more sensitive than phone. Move it to a self-only table.
create table if not exists public.profile_emergency_contacts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  emergency_contact text,
  updated_at timestamptz not null default now()
);

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profile_contacts' and column_name = 'emergency_contact'
  ) then
    insert into public.profile_emergency_contacts (user_id, emergency_contact, updated_at)
    select user_id, emergency_contact, updated_at
    from public.profile_contacts
    where emergency_contact is not null and btrim(emergency_contact) <> ''
    on conflict (user_id) do update
    set emergency_contact = excluded.emergency_contact,
        updated_at = excluded.updated_at;
    alter table public.profile_contacts drop column emergency_contact;
  end if;
end $$;

alter table public.profile_emergency_contacts enable row level security;
grant select, insert, update on public.profile_emergency_contacts to authenticated;

drop policy if exists emergency_contacts_select_self on public.profile_emergency_contacts;
create policy emergency_contacts_select_self on public.profile_emergency_contacts
for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists emergency_contacts_insert_self on public.profile_emergency_contacts;
create policy emergency_contacts_insert_self on public.profile_emergency_contacts
for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists emergency_contacts_update_self on public.profile_emergency_contacts;
create policy emergency_contacts_update_self on public.profile_emergency_contacts
for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop trigger if exists profile_emergency_contacts_set_updated_at on public.profile_emergency_contacts;
create trigger profile_emergency_contacts_set_updated_at before update on public.profile_emergency_contacts
for each row execute function public.set_updated_at();

-- Recreate profile_contacts policies with explicit least privilege.
drop policy if exists contacts_insert_self on public.profile_contacts;
drop policy if exists contacts_read_self_or_accepted_counterparty on public.profile_contacts;
drop policy if exists contacts_update_self on public.profile_contacts;
drop policy if exists contacts_select_self on public.profile_contacts;
drop policy if exists contacts_select_accepted_counterparty_phone on public.profile_contacts;

create policy contacts_insert_self on public.profile_contacts
for insert to authenticated
with check (user_id = (select auth.uid()));

create policy contacts_select_self on public.profile_contacts
for select to authenticated
using (user_id = (select auth.uid()));

-- Counterparties may read phone only in the context of an active accepted request.
-- Emergency contact is never exposed by this policy/table.
create policy contacts_select_accepted_counterparty_phone on public.profile_contacts
for select to authenticated
using (
  exists (
    select 1
    from public.blood_requests r
    where r.status = 'accepted'
      and (
        (r.patient_id = (select auth.uid()) and r.accepted_by = profile_contacts.user_id)
        or (r.accepted_by = (select auth.uid()) and r.patient_id = profile_contacts.user_id)
      )
  )
);

create policy contacts_update_self on public.profile_contacts
for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

revoke all on public.profile_contacts from anon, authenticated;
grant select (user_id, phone, updated_at), insert (user_id, phone, updated_at), update (user_id, phone, updated_at) on public.profile_contacts to authenticated;

revoke all on public.profile_emergency_contacts from anon, authenticated;
grant select, insert, update on public.profile_emergency_contacts to authenticated;

-- Tighten request update rules. Patients may only cancel their own request.
create or replace function public.guard_blood_request_updates()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  caller_role text;
  caller_blood_group text;
begin
  select p.role, p.blood_group into caller_role, caller_blood_group
  from public.profiles p where p.id = auth.uid();

  if auth.uid() = old.patient_id then
    if new.patient_id is distinct from old.patient_id
       or new.accepted_by is distinct from old.accepted_by
       or new.request_id is distinct from old.request_id
       or new.name is distinct from old.name
       or new.blood_group is distinct from old.blood_group
       or new.units is distinct from old.units
       or new.urgency is distinct from old.urgency
       or new.location is distinct from old.location
       or new.notes is distinct from old.notes
       or new.hospital is distinct from old.hospital
       or new.blood_type is distinct from old.blood_type
       or new.type is distinct from old.type
       or new.completed_at is distinct from old.completed_at
       or new.status not in ('cancelled') then
      raise exception 'Patients may only cancel their own request';
    end if;
    if old.status not in ('pending', 'accepted') then
      raise exception 'Only active requests can be cancelled';
    end if;
    return new;
  end if;

  if caller_role = 'donor' and caller_blood_group = old.blood_group then
    if old.status = 'pending' and new.status = 'accepted'
       and new.accepted_by = auth.uid()
       and new.patient_id = old.patient_id
       and new.blood_group = old.blood_group
       and new.request_id is not distinct from old.request_id
       and new.name is not distinct from old.name
       and new.units is not distinct from old.units
       and new.urgency is not distinct from old.urgency
       and new.location is not distinct from old.location
       and new.notes is not distinct from old.notes then
      return new;
    end if;

    if old.status = 'pending' and new.status = 'skipped'
       and new.accepted_by is null
       and new.patient_id = old.patient_id
       and new.blood_group = old.blood_group
       and new.request_id is not distinct from old.request_id
       and new.name is not distinct from old.name
       and new.units is not distinct from old.units
       and new.urgency is not distinct from old.urgency
       and new.location is not distinct from old.location
       and new.notes is not distinct from old.notes then
      return new;
    end if;

    if old.accepted_by = auth.uid() and old.status = 'accepted'
       and new.status in ('pending', 'completed')
       and (new.accepted_by is null or new.accepted_by = auth.uid())
       and new.patient_id = old.patient_id
       and new.blood_group = old.blood_group
       and new.request_id is not distinct from old.request_id
       and new.name is not distinct from old.name
       and new.units is not distinct from old.units
       and new.urgency is not distinct from old.urgency
       and new.location is not distinct from old.location
       and new.notes is not distinct from old.notes then
      if new.status = 'completed' and new.accepted_by is distinct from auth.uid() then
        raise exception 'Completed requests must retain accepted donor';
      end if;
      return new;
    end if;
  end if;

  raise exception 'Not authorized to modify this blood request';
end;
$$;

-- Keep realtime publication for private contact phone table; emergency contact is self-only.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='profile_emergency_contacts') then
    alter publication supabase_realtime add table public.profile_emergency_contacts;
  end if;
end $$;

