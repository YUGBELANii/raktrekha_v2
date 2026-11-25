create table if not exists public.blood_camps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  hosted_by text,
  location text,
  address text,
  distance text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.blood_camps enable row level security;
grant select on public.blood_camps to anon, authenticated;
create policy "Active blood camps are publicly readable"
on public.blood_camps for select
to anon, authenticated
using (active = true);