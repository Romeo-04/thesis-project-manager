import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type {
  Issue,
  Project,
  Sprint,
  WorkflowStatus,
  Comment,
  ActivityLog,
  Attachment,
  Workspace
} from "@/lib/db/types";

const supabase = createSupabaseBrowserClient();

export async function fetchProject(projectId: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();
  if (error) throw error;
  return data as Project;
}

export async function fetchWorkspaces() {
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Workspace[];
}

export async function fetchWorkspaceProjects(workspaceId: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function fetchWorkflowStatuses(projectId: string) {
  const { data, error } = await supabase
    .from("workflow_statuses")
    .select("*")
    .eq("project_id", projectId)
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []) as WorkflowStatus[];
}

export async function fetchBoardIssues(projectId: string) {
  const { data, error } = await supabase
    .from("issues")
    .select("*")
    .eq("project_id", projectId)
    .is("deleted_at", null)
    .order("rank", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Issue[];
}

export async function fetchBacklogIssues(projectId: string) {
  const { data, error } = await supabase
    .from("issues")
    .select("*")
    .eq("project_id", projectId)
    .is("deleted_at", null)
    .order("backlog_rank", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Issue[];
}

export async function fetchProjectIssues(projectId: string) {
  const { data, error } = await supabase
    .from("issues")
    .select("*")
    .eq("project_id", projectId)
    .is("deleted_at", null);
  if (error) throw error;
  return (data ?? []) as Issue[];
}

export async function fetchSprints(projectId: string) {
  const { data, error } = await supabase
    .from("sprints")
    .select("*")
    .eq("project_id", projectId)
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Sprint[];
}

export async function fetchIssueComments(issueId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("issue_id", issueId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Comment[];
}

export async function fetchIssueActivity(issueId: string) {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("entity_id", issueId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ActivityLog[];
}

export async function fetchIssueAttachments(issueId: string) {
  const { data, error } = await supabase
    .from("attachments")
    .select("*")
    .eq("issue_id", issueId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Attachment[];
}
