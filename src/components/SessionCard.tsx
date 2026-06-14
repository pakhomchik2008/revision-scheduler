import Link from "next/link";

interface Props {
  sessionId: string;
  subject: string;
  subjectColor: string;
  topicName: string;
  difficulty: 1 | 2 | 3;
  reviewNumber?: number;
  estMinutes?: number;
}

const diffLabel = { 1: "Easy", 2: "Medium", 3: "Hard" } as const;
const diffColor = { 1: "bg-emerald-100 text-emerald-700", 2: "bg-sky-100 text-sky-700", 3: "bg-rose-100 text-rose-700" } as const;

export default function SessionCard({
  sessionId, subject, subjectColor, topicName, difficulty, reviewNumber, estMinutes = 45,
}: Props) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
      style={{ borderLeft: `6px solid ${subjectColor}` }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-wide text-slate-500">{subject}</p>
        <p className="font-medium text-slate-900 truncate">{topicName}</p>
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span className={`rounded-full px-2 py-0.5 ${diffColor[difficulty]}`}>{diffLabel[difficulty]}</span>
          {reviewNumber ? <span className="text-slate-500">Review {reviewNumber}</span> : null}
          <span className="text-slate-500">~{estMinutes} min</span>
        </div>
      </div>
      <Link href={`/study/${sessionId}`} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
        Start
      </Link>
    </div>
  );
}
