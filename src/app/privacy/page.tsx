import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Revision Scheduler",
  description: "Revision Scheduler privacy policy. How we handle your data.",
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-slate mx-auto max-w-2xl py-8">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-slate-500">Last updated: June 2025</p>

      <h2>What we collect</h2>
      <p>
        When you create an account we store your <strong>email address</strong> and a
        securely hashed password via Supabase Auth. We also store the study data you
        enter: exams, topics, study sessions, and confidence ratings.
      </p>

      <h2>How we use your data</h2>
      <ul>
        <li>To authenticate you and keep your account secure.</li>
        <li>To generate and personalise your revision schedule using the SM-2 algorithm.</li>
        <li>To display your progress and streak statistics.</li>
      </ul>
      <p>We do not sell, rent, or share your personal data with third parties.</p>

      <h2>Cookies</h2>
      <p>
        We use a single essential authentication cookie to keep you signed in.
        We do not use advertising or tracking cookies.
      </p>

      <h2>Analytics</h2>
      <p>
        If enabled, we use <a href="https://plausible.io" target="_blank" rel="noopener noreferrer">Plausible Analytics</a>,
        a privacy-friendly, cookie-free analytics tool. It collects no personal data and is
        fully GDPR-compliant.
      </p>

      <h2>Data storage</h2>
      <p>
        Your data is stored in a Supabase-hosted PostgreSQL database with row-level security (RLS).
        Only you can access your own data. Data is encrypted in transit (TLS) and at rest.
      </p>

      <h2>Data deletion</h2>
      <p>
        You can delete your exams and all associated data at any time from within the app.
        To delete your entire account, contact us via GitHub and we will remove all data
        within 30 days.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy from time to time. Changes will be posted on this page
        with an updated date.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Open an issue on our{" "}
        <a href="https://github.com/pakhomchik2008/revision-scheduler/issues" target="_blank" rel="noopener noreferrer">
          GitHub repository
        </a>.
      </p>

      <div className="not-prose mt-8">
        <Link href="/" className="text-sm text-primary hover:underline">&larr; Back to home</Link>
      </div>
    </article>
  );
}
