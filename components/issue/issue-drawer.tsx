"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useUiStore } from "@/store/ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchIssueActivity,
  fetchIssueAttachments,
  fetchIssueComments,
  fetchWorkflowStatuses
} from "@/lib/db/queries";
import { addComment, updateIssue, uploadAttachment } from "@/lib/db/mutations";
import { usePrefersReducedMotion } from "@/lib/animation/usePrefersReducedMotion";
import gsap from "gsap";

export default function IssueDrawer({ projectId }: { projectId: string }) {
  const { selectedIssue, setSelectedIssue } = useUiStore();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { data: statuses = [] } = useQuery({
    queryKey: ["workflow-statuses", projectId],
    queryFn: () => fetchWorkflowStatuses(projectId),
    enabled: !!projectId
  });

  const issueId = selectedIssue?.id;
  const { data: comments = [] } = useQuery({
    queryKey: ["issue-comments", issueId],
    queryFn: () => fetchIssueComments(issueId!),
    enabled: !!issueId
  });

  const { data: activity = [] } = useQuery({
    queryKey: ["issue-activity", issueId],
    queryFn: () => fetchIssueActivity(issueId!),
    enabled: !!issueId
  });

  const { data: attachments = [] } = useQuery({
    queryKey: ["issue-attachments", issueId],
    queryFn: () => fetchIssueAttachments(issueId!),
    enabled: !!issueId
  });

  useEffect(() => {
    if (!containerRef.current || reducedMotion || !selectedIssue) return;
    gsap.fromTo(
      containerRef.current,
      { x: 80, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.35, ease: "power2.out" }
    );
  }, [selectedIssue, reducedMotion]);

  const statusOptions = useMemo(
    () => statuses.map((status) => ({ id: status.id, name: status.name })),
    [statuses]
  );

  if (!selectedIssue) return null;

  return (
    <Sheet open={!!selectedIssue} onOpenChange={(open) => !open && setSelectedIssue(null)}>
      <SheetContent ref={containerRef} className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Issue</p>
            <Input
              className="mt-2 text-lg font-semibold"
              defaultValue={selectedIssue.title}
              onBlur={(event) => updateIssue(selectedIssue.id, { title: event.target.value })}
            />
          </div>
          <SheetClose asChild>
            <Button variant="ghost">Close</Button>
          </SheetClose>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs text-slate-500">Status</p>
            <Select
              defaultValue={selectedIssue.status_id}
              onValueChange={(value) => updateIssue(selectedIssue.id, { status_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-slate-500">Priority</p>
            <Select
              defaultValue={selectedIssue.priority}
              onValueChange={(value) => updateIssue(selectedIssue.id, { priority: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {[
                  { label: "Low", value: "low" },
                  { label: "Medium", value: "medium" },
                  { label: "High", value: "high" },
                  { label: "Critical", value: "critical" }
                ].map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-900">Comments</p>
          <div className="space-y-2">
            <textarea
              className="w-full rounded-lg border border-slate-200 p-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="Write a comment..."
              rows={3}
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
            />
            <Button
              size="sm"
              onClick={() => {
                if (!commentText.trim()) return;
                addComment(selectedIssue.id, commentText).then(() => {
                  setCommentText("");
                  queryClient.invalidateQueries({ queryKey: ["issue-comments", selectedIssue.id] });
                });
              }}
            >
              Add comment
            </Button>
          </div>
          <div className="space-y-3">
            {comments.length === 0 && <p className="text-sm text-slate-500">No comments yet.</p>}
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                {comment.body}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-900">Attachments</p>
          <Input
            type="file"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              uploadAttachment(selectedIssue.id, file).then(() => {
                queryClient.invalidateQueries({ queryKey: ["issue-attachments", selectedIssue.id] });
              });
            }}
          />
          <div className="space-y-2 text-sm text-slate-600">
            {attachments.length === 0 && <p>No attachments yet.</p>}
            {attachments.map((file) => (
              <div key={file.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>{file.file_name}</span>
                <span className="text-xs text-slate-400">{Math.round(file.size / 1024)} KB</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-900">Activity</p>
          <div className="space-y-2">
            {activity.length === 0 && <p className="text-sm text-slate-500">No activity yet.</p>}
            {activity.map((entry) => (
              <div key={entry.id} className="text-xs text-slate-500">
                {entry.action} · {new Date(entry.created_at).toLocaleString()}
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
