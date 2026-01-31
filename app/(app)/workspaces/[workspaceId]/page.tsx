"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWorkspaceProjects } from "@/lib/db/queries";
import { createProject } from "@/lib/db/mutations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function WorkspaceOverview({ params }: { params: { workspaceId: string } }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");

  const { data: projects = [] } = useQuery({
    queryKey: ["projects", params.workspaceId],
    queryFn: () => fetchWorkspaceProjects(params.workspaceId)
  });

  const mutation = useMutation({
    mutationFn: () => createProject(params.workspaceId, name, key.toUpperCase(), description),
    onSuccess: () => {
      setName("");
      setKey("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["projects", params.workspaceId] });
    },
    onError: (error: any) => {
      toast.error(error.message ?? "Failed to create project");
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Workspace</h1>
          <p className="text-sm text-slate-500">Projects and reports</p>
        </div>
      </div>
      <div className="glass-panel space-y-3 p-6">
        <p className="text-sm text-slate-600">Create a new project.</p>
        <div className="grid gap-2 md:grid-cols-3">
          <Input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Key (e.g. THESIS)" value={key} onChange={(e) => setKey(e.target.value)} />
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <Button onClick={() => mutation.mutate()} disabled={!name.trim() || !key.trim()}>
          Create project
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.length === 0 && (
          <div className="glass-panel p-6 text-sm text-slate-500">No projects yet.</div>
        )}
        {projects.map((project) => (
          <div key={project.id} className="glass-panel p-5">
            <h2 className="font-semibold text-slate-900">{project.name}</h2>
            <p className="text-xs text-slate-500">{project.key}</p>
            <p className="mt-2 text-sm text-slate-600">{project.description ?? "No description"}</p>
            <Link
              className="mt-3 inline-flex text-sm font-semibold text-slate-900"
              href={`/workspaces/${params.workspaceId}/projects/${project.id}/board`}
            >
              Open board
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
