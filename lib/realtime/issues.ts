import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function subscribeToProjectIssues(projectId: string, onChange: () => void) {
  const supabase = createSupabaseBrowserClient();
  const channel = supabase
    .channel(`issues:${projectId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "issues", filter: `project_id=eq.${projectId}` },
      () => onChange()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
