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
       or new.status not in ('pending', 'accepted', 'cancelled') then
      raise exception 'Patients may only cancel or retain their own request';
    end if;
    return new;
  end if;

  if caller_role = 'donor' and caller_blood_group = old.blood_group then
    if old.status = 'pending' and new.status = 'accepted'
       and new.accepted_by = auth.uid()
       and new.patient_id = old.patient_id
       and new.blood_group = old.blood_group then
      return new;
    end if;
    if old.status = 'pending' and new.status = 'skipped'
       and new.accepted_by is null
       and new.patient_id = old.patient_id
       and new.blood_group = old.blood_group then
      return new;
    end if;
    if old.accepted_by = auth.uid() and new.status in ('pending', 'completed')
       and (new.accepted_by is null or new.accepted_by = auth.uid())
       and new.patient_id = old.patient_id
       and new.blood_group = old.blood_group then
      return new;
    end if;
  end if;

  raise exception 'Not authorized to modify this blood request';
end;
$$;

drop trigger if exists blood_requests_guard_updates on public.blood_requests;
create trigger blood_requests_guard_updates before update on public.blood_requests
for each row execute function public.guard_blood_request_updates();

drop policy if exists request_participants_update_requests on public.blood_requests;
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