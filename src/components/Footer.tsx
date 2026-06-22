import Link from "next/link";

const GITHUB_URL = "https://github.com/pakhomchik2008/revision-scheduler";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white pb-20 md:pb-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:justify-between">
        <p>
          Built by{" "}
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-slate-700 hover:text-primary">
            pakhomchik2008
          </a>
        </p>
        <nav className="flex items-center gap-4" aria-label="Footer navigation">
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
            GitHub
          </a>
          <Link href="/about" className="hover:text-primary">About</Link>
          <Link href="/privacy" className="hover:text-primary">Privacy</Link>
          <Link href="/terms" className="hover:text-primary">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
