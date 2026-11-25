create schema if not exists private;

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text;
  v_age integer;
begin
  v_role := case
    when new.raw_user_meta_data ->> 'role' in ('donor', 'patient')
      then new.raw_user_meta_data ->> 'role'
    else 'patient'
  end;
  v_age := case
    when coalesce(new.raw_user_meta_data ->> 'age', '') ~ '^[0-9]{1,3}$'
      then (new.raw_user_meta_data ->> 'age')::integer
    else null
  end;

  insert into public.profiles (id, role, name, age, blood_group, location, availability, condition, urgency)
  values (
    new.id,
    v_role,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    v_age,
    nullif(new.raw_user_meta_data ->> 'bloodGroup', ''),
    nullif(new.raw_user_meta_data ->> 'location', ''),
    case when new.raw_user_meta_data ? 'availability' then to_jsonb(new.raw_user_meta_data ->> 'availability') else null end,
    nullif(new.raw_user_meta_data ->> 'condition', ''),
    nullif(new.raw_user_meta_data ->> 'urgency', '')
  )
  on conflict (id) do nothing;

  insert into public.profile_contacts (user_id, phone)
  values (new.id, nullif(new.raw_user_meta_data ->> 'number', ''))
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_auth_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function private.handle_new_auth_user();

create or replace function private.prevent_profile_role_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role is distinct from old.role then
    raise exception 'Profile role cannot be changed after registration';
  end if;
  return new;
end;
$$;

revoke all on function private.prevent_profile_role_change() from public, anon, authenticated;
drop trigger if exists prevent_profile_role_change on public.profiles;
create trigger prevent_profile_role_change
before update of role on public.profiles
for each row execute function private.prevent_profile_role_change();