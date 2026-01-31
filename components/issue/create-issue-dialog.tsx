"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createIssue } from "@/lib/db/mutations";
import { fetchWorkflowStatuses } from "@/lib/db/queries";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CreateIssueDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [issueType, setIssueType] = useState("task");
  const [priority, setPriority] = useState("medium");
  const [statusId, setStatusId] = useState<string | undefined>();
  const queryClient = useQueryClient();

  const { data: statuses = [] } = useQuery({
    queryKey: ["workflow-statuses", projectId],
    queryFn: () => fetchWorkflowStatuses(projectId)
  });

  useEffect(() => {
    if (!statusId && statuses.length > 0) setStatusId(statuses[0].id);
  }, [statuses, statusId]);

  const mutation = useMutation({
    mutationFn: () =>
      createIssue(projectId, {
        title,
        issue_type: issueType,
        priority,
        status_id: statusId ?? statuses[0]?.id
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-issues", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-issues", projectId] });
      setTitle("");
      setOpen(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Create issue</Button>
      </DialogTrigger>
      <DialogContent className="space-y-4">
        <DialogTitle className="text-lg font-semibold">Create issue</DialogTitle>
        <Input placeholder="Issue title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <div className="grid gap-3 md:grid-cols-3">
          <Select defaultValue={issueType} onValueChange={setIssueType}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {[
                { label: "Task", value: "task" },
                { label: "Bug", value: "bug" },
                { label: "Story", value: "story" },
                { label: "Epic", value: "epic" }
              ].map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {[
                { label: "Low", value: "low" },
                { label: "Medium", value: "medium" },
                { label: "High", value: "high" },
                { label: "Critical", value: "critical" }
              ].map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setStatusId}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => mutation.mutate()} disabled={!title.trim() || !statusId}>
          Create
        </Button>
      </DialogContent>
    </Dialog>
  );
}
