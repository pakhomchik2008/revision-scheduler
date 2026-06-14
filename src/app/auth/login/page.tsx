"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Log in</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@university.edu"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button disabled={loading} className="w-full rounded-lg bg-primary py-2 font-medium text-white disabled:opacity-50">
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        No account? <Link href="/auth/signup" className="text-primary">Sign up</Link>
      </p>
    </div>
  );
}
