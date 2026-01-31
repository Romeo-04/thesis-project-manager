-- 003_workspace_project_functions.sql

create or replace function public.create_workspace_with_owner(
  workspace_name text,
  workspace_slug text
)
returns public.workspaces
language plpgsql
security definer
as $$
declare
  new_workspace public.workspaces;
begin
  insert into public.workspaces (name, slug, created_by)
  values (workspace_name, workspace_slug, auth.uid())
  returning * into new_workspace;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace.id, auth.uid(), 'owner');

  return new_workspace;
end;
$$;

create or replace function public.create_project_with_defaults(
  target_workspace uuid,
  project_name text,
  project_key text,
  project_description text default null
)
returns public.projects
language plpgsql
security definer
as $$
declare
  new_project public.projects;
  workflow_id uuid := gen_random_uuid();
begin
  if not public.can_manage_workspace(target_workspace) then
    raise exception 'not_authorized';
  end if;

  insert into public.projects (workspace_id, name, key, description, created_by)
  values (target_workspace, project_name, project_key, project_description, auth.uid())
  returning * into new_project;

  insert into public.workflows (id, project_id, name)
  values (workflow_id, new_project.id, 'Default Workflow');

  insert into public.workflow_statuses (workflow_id, project_id, name, category, position)
  values
    (workflow_id, new_project.id, 'Backlog', 'backlog', 0),
    (workflow_id, new_project.id, 'Todo', 'todo', 1),
    (workflow_id, new_project.id, 'In Progress', 'in_progress', 2),
    (workflow_id, new_project.id, 'In Review', 'review', 3),
    (workflow_id, new_project.id, 'Done', 'done', 4);

  return new_project;
end;
$$;

grant execute on function public.create_workspace_with_owner(text, text) to authenticated;
grant execute on function public.create_project_with_defaults(uuid, text, text, text) to authenticated;
