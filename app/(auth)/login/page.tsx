import AuthForm from "@/components/auth/auth-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <AuthForm mode="login" />
      <p className="text-sm text-slate-500">
        Need an account? <Link className="text-slate-900 underline" href="/signup">Sign up</Link>
      </p>
    </div>
  );
}
