-- 002_seed.sql
-- Replace user_id with an actual auth user id.

do $$
declare
  user_id uuid := '00000000-0000-0000-0000-000000000000';
  workspace_id uuid := gen_random_uuid();
  project_id uuid := gen_random_uuid();
  workflow_id uuid := gen_random_uuid();
  backlog_status uuid := gen_random_uuid();
  todo_status uuid := gen_random_uuid();
  in_progress_status uuid := gen_random_uuid();
  review_status uuid := gen_random_uuid();
  done_status uuid := gen_random_uuid();
begin
  insert into public.workspaces (id, name, slug, created_by)
  values (workspace_id, 'Default Workspace', 'default-workspace', user_id);

  insert into public.workspace_members (workspace_id, user_id, role)
  values (workspace_id, user_id, 'owner');

  insert into public.projects (id, workspace_id, name, key, description, created_by)
  values (project_id, workspace_id, 'Thesis Project', 'THESIS', 'Undergraduate thesis board', user_id);

  insert into public.workflows (id, project_id, name)
  values (workflow_id, project_id, 'Default Workflow');

  insert into public.workflow_statuses (id, workflow_id, project_id, name, category, position)
  values
    (backlog_status, workflow_id, project_id, 'Backlog', 'backlog', 0),
    (todo_status, workflow_id, project_id, 'Todo', 'todo', 1),
    (in_progress_status, workflow_id, project_id, 'In Progress', 'in_progress', 2),
    (review_status, workflow_id, project_id, 'In Review', 'review', 3),
    (done_status, workflow_id, project_id, 'Done', 'done', 4);

  insert into public.issues (project_id, title, issue_type, status_id, priority, reporter_id, rank, backlog_rank)
  values
    (project_id, 'Set up Supabase schema', 'task', todo_status, 'high', user_id, 1, 1),
    (project_id, 'Prototype Kanban board', 'story', todo_status, 'medium', user_id, 2, 2),
    (project_id, 'Write thesis introduction', 'task', backlog_status, 'low', user_id, 3, 3);
end $$;
