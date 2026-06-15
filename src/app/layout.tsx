import "./globals.css";
import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import { I18nProvider } from "@/components/I18nProvider";
import { ToastProvider } from "@/components/Toast";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Revision Scheduler — Spaced Repetition Study Planner",
  description:
    "Plan your exam revision with SM-2 spaced repetition. Add subjects, list topics, and get a day-by-day schedule that adapts as you study.",
  openGraph: {
    title: "Revision Scheduler",
    description: "Smart spaced-repetition study planner for university exams.",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        <I18nProvider>
          <ToastProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
            >
              Skip to content
            </a>
            {user ? <NavBar email={user.email ?? ""} /> : null}
            <main id="main-content" className="mx-auto max-w-5xl px-4 py-6 pb-24 md:pb-6">
              {children}
            </main>
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
