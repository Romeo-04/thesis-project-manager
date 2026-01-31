"use client";

import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProjectIssues, fetchSprints } from "@/lib/db/queries";
import { createSprint, moveIssueToSprint } from "@/lib/db/mutations";
import { getNewRank } from "@/lib/db/ranking";
import type { Issue, Sprint } from "@/lib/db/types";
import IssueCard from "@/components/issue/issue-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { subscribeToProjectIssues } from "@/lib/realtime/issues";

function SprintColumn({ sprint, issues }: { sprint: Sprint; issues: Issue[] }) {
  const { setNodeRef } = useDroppable({ id: sprint.id });

  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{sprint.name}</h3>
          <p className="text-xs text-slate-500">{sprint.status.toUpperCase()}</p>
        </div>
        <span className="text-xs text-slate-400">{issues.length} issues</span>
      </div>
      <SortableContext items={issues.map((issue) => issue.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="space-y-3 min-h-[120px]">
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default function BacklogView({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [sprintName, setSprintName] = useState("");

  const { data: projectIssues = [] } = useQuery({
    queryKey: ["project-issues", projectId],
    queryFn: () => fetchProjectIssues(projectId)
  });

  const { data: sprints = [] } = useQuery({
    queryKey: ["sprints", projectId],
    queryFn: () => fetchSprints(projectId)
  });

  useEffect(() => {
    const unsubscribe = subscribeToProjectIssues(projectId, () => {
      queryClient.invalidateQueries({ queryKey: ["project-issues", projectId] });
      queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
    });
    return unsubscribe;
  }, [projectId, queryClient]);

  const { backlogIssues, issuesBySprint } = useMemo(() => {
    const map = new Map<string, Issue[]>();
    sprints.forEach((sprint) => map.set(sprint.id, []));
    const backlog = projectIssues
      .filter((issue) => !issue.sprint_id)
      .sort((a, b) => Number(a.backlog_rank) - Number(b.backlog_rank));
    projectIssues
      .filter((issue) => issue.sprint_id)
      .forEach((issue) => {
        const list = map.get(issue.sprint_id!) ?? [];
        list.push(issue);
        map.set(issue.sprint_id!, list);
      });
    map.forEach((list) => list.sort((a, b) => Number(a.sprint_rank) - Number(b.sprint_rank)));
    return { backlogIssues: backlog, issuesBySprint: map };
  }, [projectIssues, sprints]);

  const moveMutation = useMutation({
    mutationFn: ({ issueId, sprintId, sprintRank }: { issueId: string; sprintId: string | null; sprintRank: string }) =>
      moveIssueToSprint(issueId, sprintId, sprintRank),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["project-issues", projectId] });
      queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
    }
  });

  const sprintMutation = useMutation({
    mutationFn: (name: string) => createSprint(projectId, { name }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["project-issues", projectId] });
      queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
      setSprintName("");
    }
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const issueId = String(active.id);
    const containerId = over.data.current?.sortable?.containerId ?? over.id;
    const sprintId = String(containerId);
    if (!sprints.find((sprint) => sprint.id === sprintId)) return;
    const sprintIssues = issuesBySprint.get(sprintId) ?? [];
    const overIndex = sprintIssues.findIndex((issue) => issue.id === over.id);
    const safeIndex = overIndex === -1 ? sprintIssues.length : overIndex;
    const prev = sprintIssues[safeIndex - 1]?.sprint_rank ?? null;
    const next = sprintIssues[safeIndex]?.sprint_rank ?? null;
    const newRank = getNewRank(prev, next);

    moveMutation.mutate({ issueId, sprintId, sprintRank: newRank });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid gap-6">
        <div className="glass-panel p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Backlog</h2>
          </div>
          <SortableContext items={backlogIssues.map((issue) => issue.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {backlogIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          </SortableContext>
        </div>

        <div className="glass-panel p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Sprints</h2>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Sprint name"
                value={sprintName}
                onChange={(event) => setSprintName(event.target.value)}
              />
              <Button
                size="sm"
                onClick={() => sprintMutation.mutate(sprintName)}
                disabled={!sprintName.trim()}
              >
                Add sprint
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {sprints.map((sprint) => (
              <SprintColumn key={sprint.id} sprint={sprint} issues={issuesBySprint.get(sprint.id) ?? []} />
            ))}
          </div>
        </div>
      </div>
    </DndContext>
  );
}
