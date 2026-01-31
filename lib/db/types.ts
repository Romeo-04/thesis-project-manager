export type Role = "owner" | "admin" | "member" | "viewer";

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type Project = {
  id: string;
  workspace_id: string;
  name: string;
  key: string;
  description: string | null;
  created_at: string;
};

export type WorkflowStatus = {
  id: string;
  project_id: string;
  name: string;
  category: "backlog" | "todo" | "in_progress" | "review" | "done";
  position: number;
};

export type Sprint = {
  id: string;
  project_id: string;
  name: string;
  goal: string | null;
  start_date: string | null;
  end_date: string | null;
  status: "planned" | "active" | "completed";
  position: number;
};

export type Issue = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  issue_type: "task" | "bug" | "story" | "epic";
  status_id: string;
  priority: "low" | "medium" | "high" | "critical";
  assignee_id: string | null;
  reporter_id: string | null;
  epic_id: string | null;
  sprint_id: string | null;
  due_date: string | null;
  story_points: number | null;
  rank: string;
  backlog_rank: string;
  sprint_rank: string | null;
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  issue_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

export type Attachment = {
  id: string;
  issue_id: string;
  file_name: string;
  file_path: string;
  mime_type: string | null;
  size: number | null;
  created_at: string;
};

export type ActivityLog = {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  changed_fields: Record<string, unknown> | null;
  actor_id: string;
  created_at: string;
};
