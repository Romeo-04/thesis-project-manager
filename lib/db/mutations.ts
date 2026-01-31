import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { issueSchema, sprintSchema } from "@/lib/validation/schemas";

const supabase = createSupabaseBrowserClient();

export async function updateIssue(issueId: string, payload: Record<string, unknown>) {
  const { error } = await supabase
    .from("issues")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", issueId)
    .select()
    .single();
  if (error) throw error;
}

export async function createIssue(projectId: string, payload: unknown) {
  const data = issueSchema.parse(payload);
  const { error } = await supabase.from("issues").insert({ project_id: projectId, ...data });
  if (error) throw error;
}

export async function createSprint(projectId: string, payload: unknown) {
  const data = sprintSchema.parse(payload);
  const { error } = await supabase.from("sprints").insert({ project_id: projectId, ...data });
  if (error) throw error;
}

export async function moveIssueToSprint(issueId: string, sprintId: string | null, sprintRank: string | null) {
  const { error } = await supabase
    .from("issues")
    .update({ sprint_id: sprintId, sprint_rank: sprintRank })
    .eq("id", issueId);
  if (error) throw error;
}

export async function uploadAttachment(issueId: string, file: File) {
  const filePath = `${issueId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from("attachments").upload(filePath, file);
  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase.from("attachments").insert({
    issue_id: issueId,
    file_name: file.name,
    file_path: filePath,
    mime_type: file.type,
    size: file.size
  });
  if (insertError) throw insertError;
}

export async function addComment(issueId: string, body: string) {
  const { error } = await supabase.from("comments").insert({ issue_id: issueId, body });
  if (error) throw error;
}

export async function createWorkspace(name: string, slug: string) {
  const { data, error } = await supabase.rpc("create_workspace_with_owner", {
    workspace_name: name,
    workspace_slug: slug
  });
  if (error) throw error;
  return data;
}

export async function createProject(
  workspaceId: string,
  name: string,
  key: string,
  description?: string
) {
  const { data, error } = await supabase.rpc("create_project_with_defaults", {
    target_workspace: workspaceId,
    project_name: name,
    project_key: key,
    project_description: description ?? null
  });
  if (error) throw error;
  return data;
}
