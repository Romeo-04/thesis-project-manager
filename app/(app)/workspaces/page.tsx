"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWorkspaces } from "@/lib/db/queries";
import { createWorkspace } from "@/lib/db/mutations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/db/slug";
import { toast } from "sonner";

export default function WorkspacesPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const { data: workspaces = [] } = useQuery({
    queryKey: ["workspaces"],
    queryFn: fetchWorkspaces
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const slug = slugify(name);
      if (!slug) throw new Error("Invalid workspace name");
      return createWorkspace(name, slug);
    },
    onSuccess: () => {
      setName("");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: (error: any) => {
      toast.error(error.message ?? "Failed to create workspace");
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Your workspaces</h1>
      </div>
      <div className="glass-panel space-y-3 p-6">
        <p className="text-sm text-slate-600">Create a new workspace.</p>
        <div className="flex gap-2">
          <Input placeholder="Workspace name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={() => mutation.mutate()} disabled={!name.trim()}>
            Create
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {workspaces.length === 0 && (
          <div className="glass-panel p-6 text-sm text-slate-500">No workspaces yet.</div>
        )}
        {workspaces.map((workspace) => (
          <div key={workspace.id} className="glass-panel p-5">
            <h2 className="font-semibold text-slate-900">{workspace.name}</h2>
            <p className="text-xs text-slate-500">{workspace.slug}</p>
            <Link
              className="mt-3 inline-flex text-sm font-semibold text-slate-900"
              href={`/workspaces/${workspace.id}`}
            >
              Open workspace
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
