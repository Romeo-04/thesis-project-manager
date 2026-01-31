"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const action = mode === "signup" ? supabase.auth.signUp : supabase.auth.signInWithPassword;
    const { error } = await action({ email, password });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(mode === "signup" ? "Account created" : "Welcome back");
    router.push("/workspaces");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}
      </Button>
    </form>
  );
}
