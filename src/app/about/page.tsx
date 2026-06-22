import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Revision Scheduler",
  description: "Learn about Revision Scheduler and the SM-2 spaced repetition algorithm behind it.",
};

const GITHUB_URL = "https://github.com/pakhomchik2008/revision-scheduler";

export default function AboutPage() {
  return (
    <article className="prose prose-slate mx-auto max-w-2xl py-8">
      <h1>About Revision Scheduler</h1>

      <p>
        Revision Scheduler is a free, open-source study planner that uses the{" "}
        <strong>SM-2 spaced repetition algorithm</strong> to generate personalised day-by-day
        revision plans for university exams.
      </p>

      <h2>How it works</h2>
      <ol>
        <li><strong>Add your exams</strong> — enter the subject and exam date.</li>
        <li><strong>List your topics</strong> — break each subject into the topics you need to revise.</li>
        <li><strong>Study on schedule</strong> — we generate daily sessions that spread revision optimally across the days you have left.</li>
        <li><strong>Rate your confidence</strong> — after each session, tell us how well you knew the material. SM-2 reschedules weaker topics sooner and pushes strong ones further out.</li>
      </ol>

      <h2>The SM-2 algorithm</h2>
      <p>
        SM-2 was developed by Piotr Wozniak in 1987 and is the algorithm behind popular flashcard
        apps like Anki. Unlike Anki, Revision Scheduler does not require you to build decks of
        flashcards — you just list your topics, and the scheduler handles the rest.
      </p>

      <h2>Tech stack</h2>
      <ul>
        <li>Next.js 14 (App Router)</li>
        <li>TypeScript</li>
        <li>Supabase (Postgres + Auth + RLS)</li>
        <li>Tailwind CSS</li>
        <li>Recharts for progress visualisation</li>
        <li>Deployed on Vercel</li>
      </ul>

      <h2>Open source</h2>
      <p>
        The full source code is available on{" "}
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>.
        Contributions, bug reports, and feature requests are welcome.
      </p>

      <h2>Built by</h2>
      <p>
        Created by{" "}
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">pakhomchik2008</a>.
      </p>

      <div className="not-prose mt-8">
        <Link href="/" className="text-sm text-primary hover:underline">&larr; Back to home</Link>
      </div>
    </article>
  );
}
