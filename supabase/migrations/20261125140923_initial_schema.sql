create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('donor', 'patient')),
  name text not null,
  age integer check (age is null or (age between 1 and 120)),
  blood_group text not null,
  location text,
  availability text,
  condition text,
  urgency text,
  bio text,
  city text,
  preferred_hospital text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profile_contacts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  phone text,
  emergency_contact text,
  updated_at timestamptz not null default now()
);

create table public.blood_requests (
  id uuid primary key default gen_random_uuid(),
  request_id text unique,
  patient_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  blood_group text not null,
  units integer not null check (units > 0),
  urgency text,
  location text not null,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'skipped', 'completed', 'cancelled')),
  accepted_by uuid references public.profiles(id) on delete set null,
  hospital text,
  blood_type text,
  type text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blood_requests_patient_created_idx on public.blood_requests(patient_id, created_at desc);
create index blood_requests_donor_status_group_idx on public.blood_requests(blood_group, status, created_at desc);
create index blood_requests_accepted_by_status_idx on public.blood_requests(accepted_by, status, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger profile_contacts_set_updated_at before update on public.profile_contacts
for each row execute function public.set_updated_at();
create trigger blood_requests_set_updated_at before update on public.blood_requests
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.profile_contacts enable row level security;
alter table public.blood_requests enable row level security;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.profile_contacts to authenticated;
grant select, insert, update on public.blood_requests to authenticated;

create policy profiles_insert_self on public.profiles
for insert to authenticated with check (id = (select auth.uid()));
create policy profiles_read_self_or_donor_directory on public.profiles
for select to authenticated using (id = (select auth.uid()) or role = 'donor');
create policy profiles_update_self on public.profiles
for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy contacts_insert_self on public.profile_contacts
for insert to authenticated with check (user_id = (select auth.uid()));
create policy contacts_read_self_or_accepted_counterparty on public.profile_contacts
for select to authenticated using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.blood_requests r
    where r.status = 'accepted'
      and (
        (r.patient_id = (select auth.uid()) and r.accepted_by = profile_contacts.user_id)
        or (r.accepted_by = (select auth.uid()) and r.patient_id = profile_contacts.user_id)
      )
  )
);
create policy contacts_update_self on public.profile_contacts
for update to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy patients_create_own_requests on public.blood_requests
for insert to authenticated with check (
  patient_id = (select auth.uid())
  and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'patient')
  and status = 'pending'
  and accepted_by is null
);
create policy requests_read_patient_or_matching_donor on public.blood_requests
for select to authenticated using (
  patient_id = (select auth.uid())
  or accepted_by = (select auth.uid())
  or (
    status = 'pending'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'donor'
        and p.blood_group = blood_requests.blood_group
    )
  )
);
create policy request_participants_update_requests on public.blood_requests
for update to authenticated
using (
  patient_id = (select auth.uid())
  or accepted_by = (select auth.uid())
  or (
    status = 'pending'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'donor'
        and p.blood_group = blood_requests.blood_group
    )
  )
)
with check (
  patient_id = (select auth.uid())
  or accepted_by = (select auth.uid())
  or (
    status in ('pending', 'skipped')
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'donor'
        and p.blood_group = blood_requests.blood_group
    )
  )
);