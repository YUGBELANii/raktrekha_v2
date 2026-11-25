create table if not exists public.user_settings (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);
alter table public.user_settings enable row level security;
grant select, insert, update on public.user_settings to authenticated;
create policy "Users manage their own settings"
on public.user_settings for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create index if not exists user_settings_user_id_idx on public.user_settings(user_id);