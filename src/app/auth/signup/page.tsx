"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/components/I18nProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function SignupPage() {
  const router = useRouter();
  const { t } = useI18n();
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
      setInfo(t.auth_check_email_confirm);
    }
  }

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">{t.auth_signup}</h1>
        <LanguageSwitcher compact />
      </div>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700">{t.auth_email_placeholder}</label>
          <input
            id="signup-email"
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700">{t.auth_password_placeholder}</label>
          <input
            id="signup-password"
            type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <p className="mt-1 text-xs text-slate-500">{t.auth_min_chars}</p>
        </div>
        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
        {info && <p className="text-sm text-primary" role="status">{info}</p>}
        <button disabled={loading} className="w-full rounded-lg bg-primary py-2 font-medium text-white disabled:opacity-50">
          {loading ? t.auth_creating : t.auth_signup}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        {t.auth_has_account} <Link href="/auth/login" className="text-primary">{t.auth_login}</Link>
      </p>
    </div>
  );
}
