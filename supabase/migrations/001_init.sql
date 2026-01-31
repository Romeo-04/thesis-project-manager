-- 001_init.sql
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

create type public.app_role as enum ('owner', 'admin', 'member', 'viewer');
create type public.issue_type as enum ('task', 'bug', 'story', 'epic');
create type public.priority as enum ('low', 'medium', 'high', 'critical');
create type public.sprint_status as enum ('planned', 'active', 'completed');
create type public.workflow_category as enum ('backlog', 'todo', 'in_progress', 'review', 'done');
create type public.issue_link_type as enum ('blocks', 'blocked_by', 'relates');
create type public.notification_type as enum ('mention', 'assignment', 'status_change');

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid references auth.users not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.workspace_members (
  workspace_id uuid references public.workspaces on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role public.app_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces on delete cascade not null,
  name text not null,
  key text not null,
  description text,
  created_by uuid references auth.users,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists projects_workspace_key_unique on public.projects (workspace_id, key);

create table if not exists public.project_members (
  project_id uuid references public.projects on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects on delete cascade not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.workflow_statuses (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid references public.workflows on delete cascade not null,
  project_id uuid references public.projects on delete cascade not null,
  name text not null,
  category public.workflow_category not null,
  position int not null,
  created_at timestamptz not null default now()
);

create table if not exists public.sprints (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects on delete cascade not null,
  name text not null,
  goal text,
  start_date date,
  end_date date,
  status public.sprint_status not null default 'planned',
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.epics (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects on delete cascade not null,
  title text not null,
  description text,
  status_id uuid references public.workflow_statuses,
  rank numeric not null default 1,
  created_by uuid references auth.users,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects on delete cascade not null,
  title text not null,
  description text,
  issue_type public.issue_type not null default 'task',
  status_id uuid references public.workflow_statuses,
  priority public.priority not null default 'medium',
  assignee_id uuid references auth.users,
  reporter_id uuid references auth.users,
  epic_id uuid references public.epics,
  sprint_id uuid references public.sprints,
  parent_id uuid references public.issues,
  due_date date,
  story_points int,
  rank numeric not null default 1,
  backlog_rank numeric not null default 1,
  sprint_rank numeric,
  created_by uuid references auth.users,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists issues_project_idx on public.issues (project_id);
create index if not exists issues_status_idx on public.issues (status_id);
create index if not exists issues_sprint_idx on public.issues (sprint_id);

create table if not exists public.labels (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects on delete cascade not null,
  name text not null,
  color text not null default '#94a3b8',
  created_at timestamptz not null default now()
);

create unique index if not exists labels_project_name_unique on public.labels (project_id, name);

create table if not exists public.issue_labels (
  issue_id uuid references public.issues on delete cascade,
  label_id uuid references public.labels on delete cascade,
  primary key (issue_id, label_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid references public.issues on delete cascade not null,
  author_id uuid references auth.users not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid references public.issues on delete cascade not null,
  file_name text not null,
  file_path text not null,
  mime_type text,
  size bigint,
  uploader_id uuid references auth.users,
  created_at timestamptz not null default now()
);

create table if not exists public.issue_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects on delete cascade not null,
  source_issue_id uuid references public.issues on delete cascade not null,
  target_issue_id uuid references public.issues on delete cascade not null,
  link_type public.issue_link_type not null,
  created_at timestamptz not null default now(),
  unique (source_issue_id, target_issue_id, link_type)
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces on delete cascade,
  project_id uuid references public.projects on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  changed_fields jsonb,
  actor_id uuid references auth.users,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references auth.users on delete cascade not null,
  workspace_id uuid references public.workspaces on delete cascade,
  project_id uuid references public.projects on delete cascade,
  type public.notification_type not null,
  payload jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.workspace_role(target_workspace uuid)
returns public.app_role
language sql
stable
as $$
  select role
  from public.workspace_members
  where workspace_id = target_workspace
    and user_id = auth.uid();
$$;

create or replace function public.project_role(target_project uuid)
returns public.app_role
language sql
stable
as $$
  select coalesce(
    (select role from public.project_members where project_id = target_project and user_id = auth.uid()),
    (select role from public.workspace_members wm
      join public.projects p on p.workspace_id = wm.workspace_id
     where p.id = target_project and wm.user_id = auth.uid())
  );
$$;

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace and user_id = auth.uid()
  );
$$;

create or replace function public.can_manage_workspace(target_workspace uuid)
returns boolean
language sql
stable
as $$
  select public.workspace_role(target_workspace) in ('owner', 'admin');
$$;

create or replace function public.can_write_project(target_project uuid)
returns boolean
language sql
stable
as $$
  select public.project_role(target_project) in ('owner', 'admin', 'member');
$$;

create or replace function public.project_workspace_id(target_project uuid)
returns uuid
language sql
stable
as $$
  select workspace_id from public.projects where id = target_project;
$$;

create or replace function public.log_issue_activity()
returns trigger
language plpgsql
security definer
as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.activity_logs (workspace_id, project_id, entity_type, entity_id, action, changed_fields, actor_id)
    values (public.project_workspace_id(new.project_id), new.project_id, 'issue', new.id, 'created', null, auth.uid());
  elsif (tg_op = 'UPDATE') then
    insert into public.activity_logs (workspace_id, project_id, entity_type, entity_id, action, changed_fields, actor_id)
    values (public.project_workspace_id(new.project_id), new.project_id, 'issue', new.id, 'updated',
      jsonb_build_object('before', to_jsonb(old), 'after', to_jsonb(new)), auth.uid());
  end if;
  return new;
end;
$$;

create or replace function public.notify_issue_assignment()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.assignee_id is not null and (old.assignee_id is null or old.assignee_id <> new.assignee_id) then
    insert into public.notifications (recipient_id, workspace_id, project_id, type, payload)
    values (new.assignee_id, public.project_workspace_id(new.project_id), new.project_id, 'assignment',
      jsonb_build_object('issue_id', new.id, 'title', new.title));
  end if;
  return new;
end;
$$;

create trigger workspaces_updated_at before update on public.workspaces
for each row execute function public.handle_updated_at();

create trigger projects_updated_at before update on public.projects
for each row execute function public.handle_updated_at();

create trigger sprints_updated_at before update on public.sprints
for each row execute function public.handle_updated_at();

create trigger epics_updated_at before update on public.epics
for each row execute function public.handle_updated_at();

create trigger issues_updated_at before update on public.issues
for each row execute function public.handle_updated_at();

create trigger issues_activity_log after insert or update on public.issues
for each row execute function public.log_issue_activity();

create trigger issues_assignment_notification after update on public.issues
for each row execute function public.notify_issue_assignment();

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.workflows enable row level security;
alter table public.workflow_statuses enable row level security;
alter table public.sprints enable row level security;
alter table public.epics enable row level security;
alter table public.issues enable row level security;
alter table public.labels enable row level security;
alter table public.issue_labels enable row level security;
alter table public.comments enable row level security;
alter table public.attachments enable row level security;
alter table public.issue_links enable row level security;
alter table public.activity_logs enable row level security;
alter table public.notifications enable row level security;

create policy "Profiles are self" on public.profiles
for select using (auth.uid() = id);

create policy "Profiles insert self" on public.profiles
for insert with check (auth.uid() = id);

create policy "Profiles update self" on public.profiles
for update using (auth.uid() = id);

create policy "Workspace members can read workspaces" on public.workspaces
for select using (public.is_workspace_member(id));

create policy "Workspace members can insert workspaces" on public.workspaces
for insert with check (auth.uid() = created_by);

create policy "Workspace owners manage workspace" on public.workspaces
for update using (public.can_manage_workspace(id));

create policy "Workspace owners delete workspace" on public.workspaces
for delete using (public.can_manage_workspace(id));

create policy "Workspace members can read members" on public.workspace_members
for select using (public.is_workspace_member(workspace_id));

create policy "Workspace admins manage members" on public.workspace_members
for insert with check (public.can_manage_workspace(workspace_id));

create policy "Workspace admins update members" on public.workspace_members
for update using (public.can_manage_workspace(workspace_id));

create policy "Workspace admins remove members" on public.workspace_members
for delete using (public.can_manage_workspace(workspace_id));

create policy "Workspace members can read projects" on public.projects
for select using (public.is_workspace_member(workspace_id));

create policy "Workspace admins create projects" on public.projects
for insert with check (public.can_manage_workspace(workspace_id));

create policy "Workspace admins update projects" on public.projects
for update using (public.can_manage_workspace(workspace_id));

create policy "Workspace admins delete projects" on public.projects
for delete using (public.can_manage_workspace(workspace_id));

create policy "Project members can read" on public.project_members
for select using (public.is_workspace_member((select workspace_id from public.projects where id = project_id)));

create policy "Workspace admins manage project members" on public.project_members
for insert with check (public.can_manage_workspace((select workspace_id from public.projects where id = project_id)));

create policy "Workspace admins update project members" on public.project_members
for update using (public.can_manage_workspace((select workspace_id from public.projects where id = project_id)));

create policy "Workspace admins delete project members" on public.project_members
for delete using (public.can_manage_workspace((select workspace_id from public.projects where id = project_id)));

create policy "Project members read workflows" on public.workflows
for select using (public.is_workspace_member(public.project_workspace_id(project_id)));

create policy "Project admins manage workflows" on public.workflows
for insert with check (public.can_manage_workspace(public.project_workspace_id(project_id)));

create policy "Project admins update workflows" on public.workflows
for update using (public.can_manage_workspace(public.project_workspace_id(project_id)));

create policy "Project admins delete workflows" on public.workflows
for delete using (public.can_manage_workspace(public.project_workspace_id(project_id)));

create policy "Project members read statuses" on public.workflow_statuses
for select using (public.is_workspace_member(public.project_workspace_id(project_id)));

create policy "Project admins manage statuses" on public.workflow_statuses
for insert with check (public.can_manage_workspace(public.project_workspace_id(project_id)));

create policy "Project admins update statuses" on public.workflow_statuses
for update using (public.can_manage_workspace(public.project_workspace_id(project_id)));

create policy "Project admins delete statuses" on public.workflow_statuses
for delete using (public.can_manage_workspace(public.project_workspace_id(project_id)));

create policy "Project members read sprints" on public.sprints
for select using (public.is_workspace_member(public.project_workspace_id(project_id)));

create policy "Project members manage sprints" on public.sprints
for insert with check (public.can_write_project(project_id));

create policy "Project members update sprints" on public.sprints
for update using (public.can_write_project(project_id));

create policy "Project members delete sprints" on public.sprints
for delete using (public.can_write_project(project_id));

create policy "Project members read epics" on public.epics
for select using (public.is_workspace_member(public.project_workspace_id(project_id)));

create policy "Project members manage epics" on public.epics
for insert with check (public.can_write_project(project_id));

create policy "Project members update epics" on public.epics
for update using (public.can_write_project(project_id));

create policy "Project members delete epics" on public.epics
for delete using (public.can_write_project(project_id));

create policy "Project members read issues" on public.issues
for select using (public.is_workspace_member(public.project_workspace_id(project_id)));

create policy "Project members manage issues" on public.issues
for insert with check (public.can_write_project(project_id));

create policy "Project members update issues" on public.issues
for update using (public.can_write_project(project_id));

create policy "Project members delete issues" on public.issues
for delete using (public.can_write_project(project_id));

create policy "Project members read labels" on public.labels
for select using (public.is_workspace_member(public.project_workspace_id(project_id)));

create policy "Project members manage labels" on public.labels
for insert with check (public.can_write_project(project_id));

create policy "Project members update labels" on public.labels
for update using (public.can_write_project(project_id));

create policy "Project members delete labels" on public.labels
for delete using (public.can_write_project(project_id));

create policy "Project members read issue labels" on public.issue_labels
for select using (
  public.is_workspace_member(public.project_workspace_id((select project_id from public.issues where id = issue_id)))
);

create policy "Project members manage issue labels" on public.issue_labels
for insert with check (
  public.can_write_project((select project_id from public.issues where id = issue_id))
);

create policy "Project members delete issue labels" on public.issue_labels
for delete using (
  public.can_write_project((select project_id from public.issues where id = issue_id))
);

create policy "Project members read comments" on public.comments
for select using (
  public.is_workspace_member(public.project_workspace_id((select project_id from public.issues where id = issue_id)))
);

create policy "Project members manage comments" on public.comments
for insert with check (
  public.can_write_project((select project_id from public.issues where id = issue_id))
);

create policy "Project members update comments" on public.comments
for update using (
  public.can_write_project((select project_id from public.issues where id = issue_id))
);

create policy "Project members delete comments" on public.comments
for delete using (
  public.can_write_project((select project_id from public.issues where id = issue_id))
);

create policy "Project members read attachments" on public.attachments
for select using (
  public.is_workspace_member(public.project_workspace_id((select project_id from public.issues where id = issue_id)))
);

create policy "Project members manage attachments" on public.attachments
for insert with check (
  public.can_write_project((select project_id from public.issues where id = issue_id))
);

create policy "Project members delete attachments" on public.attachments
for delete using (
  public.can_write_project((select project_id from public.issues where id = issue_id))
);

create policy "Project members read issue links" on public.issue_links
for select using (public.is_workspace_member(public.project_workspace_id(project_id)));

create policy "Project members manage issue links" on public.issue_links
for insert with check (public.can_write_project(project_id));

create policy "Project members delete issue links" on public.issue_links
for delete using (public.can_write_project(project_id));

create policy "Project members read activity" on public.activity_logs
for select using (public.is_workspace_member(workspace_id));

create policy "Recipients read notifications" on public.notifications
for select using (recipient_id = auth.uid());

create policy "Recipients update notifications" on public.notifications
for update using (recipient_id = auth.uid());

-- Storage policy example (apply in Supabase SQL editor if needed):
-- create policy "Members can read attachments" on storage.objects
-- for select using (
--   bucket_id = 'attachments' and
--   public.is_workspace_member((select workspace_id from public.projects where id = (select project_id from public.issues where id::text = (storage.foldername(name))[2])) )
-- );
