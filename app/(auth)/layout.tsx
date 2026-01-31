import AuthCard from "@/components/auth/auth-card";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-amber-50 to-sky-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md glass-panel p-6">
        <AuthCard>{children}</AuthCard>
      </div>
    </div>
  );
}
