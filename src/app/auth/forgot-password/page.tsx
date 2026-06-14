"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset-password`,
    });
    setLoading(false);
    if (error) return setError(error.message);
    setSent(true);
  }

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Reset password</h1>
      {sent ? (
        <div className="mt-4">
          <p className="text-emerald-700">Check your email for a password reset link.</p>
          <Link href="/auth/login" className="mt-3 inline-block text-sm text-primary">Back to login</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <p className="text-sm text-slate-600">Enter your email and we&apos;ll send you a reset link.</p>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button disabled={loading} className="w-full rounded-lg bg-primary py-2 font-medium text-white disabled:opacity-50">
            {loading ? "Sending…" : "Send reset link"}
          </button>
          <Link href="/auth/login" className="block text-sm text-slate-500 hover:text-primary">Back to login</Link>
        </form>
      )}
    </div>
  );
}
