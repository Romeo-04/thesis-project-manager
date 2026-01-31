"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import IssueCard from "@/components/issue/issue-card";
import type { Issue, WorkflowStatus } from "@/lib/db/types";

export default function BoardColumn({
  status,
  issues
}: {
  status: WorkflowStatus;
  issues: Issue[];
}) {
  const { setNodeRef } = useDroppable({ id: status.id });

  return (
    <div className="glass-panel flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{status.name}</h3>
        <span className="text-xs text-slate-400">{issues.length}</span>
      </div>
      <SortableContext items={issues.map((issue) => issue.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex flex-col gap-3 min-h-[120px]" data-status-id={status.id}>
          {issues.map((issue) => (
            <div key={issue.id} data-status-id={status.id}>
              <IssueCard issue={issue} />
            </div>
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
