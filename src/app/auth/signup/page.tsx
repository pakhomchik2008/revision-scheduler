"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setInfo(null); setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) return setError(error.message);
    if (data.session) {
      router.push("/settings?firstRun=1");
      router.refresh();
    } else {
      setInfo("Check your email to confirm your account, then log in.");
    }
  }

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Create your account</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 6 chars)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        {info && <p className="text-sm text-primary">{info}</p>}
        <button disabled={loading} className="w-full rounded-lg bg-primary py-2 font-medium text-white disabled:opacity-50">
          {loading ? "Creating…" : "Sign up"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already have an account? <Link href="/auth/login" className="text-primary">Log in</Link>
      </p>
    </div>
  );
}
