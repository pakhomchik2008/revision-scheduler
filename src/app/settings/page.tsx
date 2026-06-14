import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SettingsForm from "./SettingsForm";
import type { UserSettings } from "@/lib/supabase/types";

export default async function SettingsPage({
  searchParams,
}: { searchParams: { firstRun?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<UserSettings>();

  const initial: UserSettings = data ?? {
    user_id: user.id,
    daily_study_hours: 3,
    study_start_hour: 9,
    include_weekends: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
      {searchParams.firstRun && (
        <p className="mt-1 text-slate-600">Welcome! Set your study preferences to get started.</p>
      )}
      <SettingsForm initial={initial} isFirstRun={!!searchParams.firstRun} />
    </div>
  );
}
