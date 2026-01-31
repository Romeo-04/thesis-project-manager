export default function ProjectSettings({ params }: { params: { projectId: string } }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Project settings</h1>
      <div className="glass-panel p-6">
        <p className="text-sm text-slate-500">Configure workflow statuses, roles, and integrations.</p>
        <p className="text-xs text-slate-400">Project: {params.projectId}</p>
      </div>
    </div>
  );
}
