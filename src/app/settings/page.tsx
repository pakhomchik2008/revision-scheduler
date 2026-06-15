import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SettingsForm from "./SettingsForm";
import SettingsHeader from "./SettingsHeader";
import type { UserSettings } from "@/lib/supabase/types";

export default async function SettingsPage({
  searchParams,
}: { searchParams: { firstRun?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data } = await supabase
    .from("user_settings").select("*").eq("user_id", user.id).maybeSingle<UserSettings>();

  const initial: UserSettings = data ?? {
    user_id: user.id,
    daily_study_hours: 3,
    study_start_hour: 9,
    include_weekends: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  };

  return (
    <div>
      <SettingsHeader isFirstRun={!!searchParams.firstRun} />
      <SettingsForm initial={initial} isFirstRun={!!searchParams.firstRun} />
    </div>
  );
}
