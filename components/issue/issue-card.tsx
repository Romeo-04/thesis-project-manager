"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Issue } from "@/lib/db/types";
import { Badge } from "@/components/ui/badge";
import { useUiStore } from "@/store/ui";

const priorityColor: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-rose-100 text-rose-700",
  critical: "bg-rose-200 text-rose-800"
};

export default function IssueCard({ issue }: { issue: Issue }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: issue.id
  });
  const { setSelectedIssue } = useUiStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setSelectedIssue(issue)}
      className={`rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md ${
        isDragging ? "opacity-70" : "opacity-100"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400">{issue.issue_type.toUpperCase()}</p>
          <h4 className="font-medium text-slate-900">{issue.title}</h4>
        </div>
        <Badge className={priorityColor[issue.priority]}>{issue.priority}</Badge>
      </div>
      <div className="mt-2 text-xs text-slate-500">{issue.assignee_id ? "Assigned" : "Unassigned"}</div>
    </div>
  );
}
