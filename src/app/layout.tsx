import "./globals.css";
import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import FeedbackWidget from "@/components/FeedbackWidget";
import { I18nProvider } from "@/components/I18nProvider";
import { ToastProvider } from "@/components/Toast";
import { createClient } from "@/lib/supabase/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://revision-scheduler-alpha.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Revision Scheduler — Spaced Repetition Study Planner",
  description:
    "Plan your exam revision with SM-2 spaced repetition. Add subjects, list topics, and get a day-by-day schedule that adapts as you study.",
  openGraph: {
    title: "Revision Scheduler",
    description: "Build your exam schedule in 2 minutes. SM-2 spaced repetition generates a day-by-day revision plan that adapts as you study.",
    type: "website",
    siteName: "Revision Scheduler",
  },
  twitter: {
    card: "summary_large_image",
    title: "Revision Scheduler",
    description: "SM-2 spaced-repetition study planner for university exams.",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <html lang="en">
      <head>
        {plausibleDomain && (
          <script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.js" />
        )}
      </head>
      <body className="flex min-h-screen flex-col">
        <I18nProvider>
          <ToastProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
            >
              Skip to content
            </a>
            {user ? <NavBar email={user.email ?? ""} /> : null}
            <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 md:pb-6">
              {children}
            </main>
            <Footer />
            {user ? <FeedbackWidget userId={user.id} /> : null}
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
