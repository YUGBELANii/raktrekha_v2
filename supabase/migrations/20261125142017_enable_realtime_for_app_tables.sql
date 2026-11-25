do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'blood_requests'
  ) then
    alter publication supabase_realtime add table public.blood_requests;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'blood_camps'
  ) then
    alter publication supabase_realtime add table public.blood_camps;
  end if;
end $$;