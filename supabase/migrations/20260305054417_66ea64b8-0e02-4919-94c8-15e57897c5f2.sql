
-- Task activity log for project timeline
create table public.task_activity_log (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid not null,
  action text not null,
  old_value text,
  new_value text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

alter table public.task_activity_log enable row level security;

create policy "Users manage own activity logs"
on public.task_activity_log
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Auto-log task status/priority changes
create or replace function public.log_task_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if OLD.status is distinct from NEW.status then
    insert into public.task_activity_log (task_id, project_id, user_id, action, old_value, new_value)
    values (NEW.id, NEW.project_id, NEW.user_id, 'status_changed', OLD.status, NEW.status);
  end if;
  if OLD.priority is distinct from NEW.priority then
    insert into public.task_activity_log (task_id, project_id, user_id, action, old_value, new_value)
    values (NEW.id, NEW.project_id, NEW.user_id, 'priority_changed', OLD.priority::text, NEW.priority::text);
  end if;
  return NEW;
end;
$$;

create trigger on_task_update_log
after update on public.tasks
for each row
execute function public.log_task_status_change();

-- Auto-log task creation
create or replace function public.log_task_creation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.task_activity_log (task_id, project_id, user_id, action, new_value)
  values (NEW.id, NEW.project_id, NEW.user_id, 'created', NEW.title);
  return NEW;
end;
$$;

create trigger on_task_create_log
after insert on public.tasks
for each row
execute function public.log_task_creation();
