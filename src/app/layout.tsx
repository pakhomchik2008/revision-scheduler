import "./globals.css";
import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Revision Scheduler",
  description: "SM-2 spaced repetition study planner for university exams.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        {user ? <NavBar email={user.email ?? ""} /> : null}
        <main className="mx-auto max-w-5xl px-4 py-6 pb-24 md:pb-6">{children}</main>
      </body>
    </html>
  );
}
