import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");
  return (
    <div className="mx-auto mt-16 max-w-xl text-center">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">Revision Scheduler</h1>
      <p className="mt-3 text-slate-600">
        Spaced-repetition study planner for your exams. Add subjects, list topics, and we&apos;ll
        build a day-by-day schedule that adapts as you go.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/auth/signup" className="rounded-lg bg-primary px-5 py-2.5 text-white font-medium">
          Get started
        </Link>
        <Link href="/auth/login" className="rounded-lg border border-slate-300 px-5 py-2.5 text-slate-700">
          Log in
        </Link>
      </div>
    </div>
  );
}
