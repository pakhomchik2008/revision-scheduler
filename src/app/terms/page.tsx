import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Revision Scheduler",
  description: "Revision Scheduler terms of service.",
};

export default function TermsPage() {
  return (
    <article className="prose prose-slate mx-auto max-w-2xl py-8">
      <h1>Terms of Service</h1>
      <p className="text-sm text-slate-500">Last updated: June 2025</p>

      <h2>1. Acceptance</h2>
      <p>
        By creating an account or using Revision Scheduler, you agree to these terms.
        If you do not agree, do not use the service.
      </p>

      <h2>2. The service</h2>
      <p>
        Revision Scheduler is a free study planning tool. We provide it &quot;as is&quot;
        without warranty of any kind. We may change, suspend, or discontinue any part
        of the service at any time.
      </p>

      <h2>3. Your account</h2>
      <p>
        You are responsible for keeping your login credentials secure. You must provide
        a valid email address. You may not use the service for any unlawful purpose.
      </p>

      <h2>4. Your data</h2>
      <p>
        You retain ownership of all content you create (exams, topics, notes). We do
        not claim any intellectual property rights over your data. See our{" "}
        <Link href="/privacy">Privacy Policy</Link> for how we store and handle it.
      </p>

      <h2>5. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Attempt to access other users&apos; data.</li>
        <li>Reverse-engineer, attack, or disrupt the service.</li>
        <li>Use automated tools to scrape or overload the service.</li>
      </ul>

      <h2>6. Limitation of liability</h2>
      <p>
        Revision Scheduler is provided for educational planning purposes only. We are
        not liable for exam outcomes, lost data, or any damages arising from use of the
        service.
      </p>

      <h2>7. Open source</h2>
      <p>
        The source code is available under the terms specified in the{" "}
        <a
          href="https://github.com/pakhomchik2008/revision-scheduler"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub repository
        </a>. This does not grant you rights to the Revision Scheduler name or brand.
      </p>

      <h2>8. Changes</h2>
      <p>
        We may update these terms. Continued use after changes constitutes acceptance.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions? Open an issue on{" "}
        <a
          href="https://github.com/pakhomchik2008/revision-scheduler/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>.
      </p>

      <div className="not-prose mt-8">
        <Link href="/" className="text-sm text-primary hover:underline">&larr; Back to home</Link>
      </div>
    </article>
  );
}
