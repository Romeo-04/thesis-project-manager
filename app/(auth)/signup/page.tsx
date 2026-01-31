import AuthForm from "@/components/auth/auth-form";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <AuthForm mode="signup" />
      <p className="text-sm text-slate-500">
        Already have an account? <Link className="text-slate-900 underline" href="/login">Sign in</Link>
      </p>
    </div>
  );
}
