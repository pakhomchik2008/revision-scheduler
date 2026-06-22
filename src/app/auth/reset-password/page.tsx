"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/components/I18nProvider";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) return setError(t.auth_passwords_mismatch);
    if (password.length < 6) return setError(t.auth_min_chars);
    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (error) return setError(error.message);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">{t.auth_update_password}</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-slate-700">{t.auth_new_password}</label>
          <input
            id="new-password"
            type="password" required minLength={6} value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <p className="mt-1 text-xs text-slate-500">{t.auth_min_chars}</p>
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">{t.auth_confirm_password}</label>
          <input
            id="confirm-password"
            type="password" required minLength={6} value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
        <button disabled={loading} className="w-full rounded-lg bg-primary py-2 font-medium text-white disabled:opacity-50">
          {loading ? t.auth_updating : t.auth_update_password}
        </button>
      </form>
    </div>
  );
}
