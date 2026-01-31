"use client";

import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import BoardColumn from "@/components/board/board-column";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBoardIssues, fetchWorkflowStatuses } from "@/lib/db/queries";
import { updateIssue } from "@/lib/db/mutations";
import { getNewRank } from "@/lib/db/ranking";
import type { Issue } from "@/lib/db/types";
import { subscribeToProjectIssues } from "@/lib/realtime/issues";
import { usePrefersReducedMotion } from "@/lib/animation/usePrefersReducedMotion";
import gsap from "gsap";
import { useEffect, useRef } from "react";

export default function BoardView({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const reducedMotion = usePrefersReducedMotion();
  const columnsRef = useRef<HTMLDivElement | null>(null);

  const { data: statuses = [] } = useQuery({
    queryKey: ["workflow-statuses", projectId],
    queryFn: () => fetchWorkflowStatuses(projectId)
  });

  const { data: issues = [] } = useQuery({
    queryKey: ["board-issues", projectId],
    queryFn: () => fetchBoardIssues(projectId)
  });

  useEffect(() => {
    const unsubscribe = subscribeToProjectIssues(projectId, () => {
      queryClient.invalidateQueries({ queryKey: ["board-issues", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-issues", projectId] });
    });
    return unsubscribe;
  }, [projectId, queryClient]);

  useEffect(() => {
    if (!columnsRef.current || reducedMotion) return;
    gsap.fromTo(
      columnsRef.current.children,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: "power2.out" }
    );
  }, [statuses, reducedMotion]);

  const mutation = useMutation({
    mutationFn: ({ issueId, statusId, rank }: { issueId: string; statusId: string; rank: string }) =>
      updateIssue(issueId, { status_id: statusId, rank }),
    onMutate: async ({ issueId, statusId, rank }) => {
      await queryClient.cancelQueries({ queryKey: ["board-issues", projectId] });
      const previous = queryClient.getQueryData<Issue[]>(["board-issues", projectId]);
      if (previous) {
        queryClient.setQueryData<Issue[]>(["board-issues", projectId], (old) =>
          (old ?? []).map((issue) =>
            issue.id === issueId ? { ...issue, status_id: statusId, rank } : issue
          )
        );
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["board-issues", projectId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["board-issues", projectId] });
    }
  });

  const issuesByStatus = useMemo(() => {
    const map = new Map<string, Issue[]>();
    statuses.forEach((status) => map.set(status.id, []));
    issues.forEach((issue) => {
      const list = map.get(issue.status_id) ?? [];
      list.push(issue);
      map.set(issue.status_id, list);
    });
    map.forEach((list) => list.sort((a, b) => Number(a.rank) - Number(b.rank)));
    return map;
  }, [issues, statuses]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const issueId = String(active.id);
    const containerId = over.data.current?.sortable?.containerId ?? over.id;
    const targetStatusId = String(containerId);

    const statusIssues = issuesByStatus.get(targetStatusId) ?? [];
    const overIndex = statusIssues.findIndex((issue) => issue.id === over.id);
    const safeIndex = overIndex === -1 ? statusIssues.length : overIndex;
    const prev = statusIssues[safeIndex - 1]?.rank ?? null;
    const next = statusIssues[safeIndex]?.rank ?? null;
    const newRank = getNewRank(prev, next);

    mutation.mutate({ issueId, statusId: targetStatusId, rank: newRank });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div ref={columnsRef} className="grid gap-4 lg:grid-cols-4">
        {statuses.map((status) => (
          <BoardColumn key={status.id} status={status} issues={issuesByStatus.get(status.id) ?? []} />
        ))}
      </div>
    </DndContext>
  );
}
