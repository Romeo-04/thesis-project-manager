export default function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Project Manager</p>
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
      </div>
      {children}
    </div>
  );
}
