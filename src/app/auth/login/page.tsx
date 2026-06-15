"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/components/I18nProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">{t.auth_login}</h1>
        <LanguageSwitcher compact />
      </div>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder={t.auth_email_placeholder}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder={t.auth_password_placeholder}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button disabled={loading} className="w-full rounded-lg bg-primary py-2 font-medium text-white disabled:opacity-50">
          {loading ? t.auth_logging_in : t.auth_login}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        {t.auth_no_account} <Link href="/auth/signup" className="text-primary">{t.auth_signup}</Link>
      </p>
      <p className="mt-1 text-sm">
        <Link href="/auth/forgot-password" className="text-slate-500 hover:text-primary">{t.auth_forgot_password}</Link>
      </p>
    </div>
  );
}
