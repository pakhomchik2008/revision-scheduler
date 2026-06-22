"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/components/I18nProvider";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
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
      <h1 className="text-2xl font-semibold text-slate-900">{t.auth_reset_password}</h1>
      {sent ? (
        <div className="mt-4">
          <p className="text-emerald-700" role="status">{t.auth_check_email}</p>
          <Link href="/auth/login" className="mt-3 inline-block text-sm text-primary">{t.auth_back_to_login}</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <p className="text-sm text-slate-600">{t.auth_reset_subtitle}</p>
          <div>
            <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700">{t.auth_email_placeholder}</label>
            <input
              id="reset-email"
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          {error && <p className="text-sm text-danger" role="alert">{error}</p>}
          <button disabled={loading} className="w-full rounded-lg bg-primary py-2 font-medium text-white disabled:opacity-50">
            {loading ? t.auth_sending : t.auth_send_reset}
          </button>
          <Link href="/auth/login" className="block text-sm text-slate-500 hover:text-primary">{t.auth_back_to_login}</Link>
        </form>
      )}
    </div>
  );
}
