alter table public.profiles
  alter column availability type jsonb
  using case
    when availability is null then null
    else to_jsonb(availability)
  end;