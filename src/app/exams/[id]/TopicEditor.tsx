"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Topic, Difficulty } from "@/lib/supabase/types";

const DIFF_LABELS: Record<Difficulty, string> = { 1: "Easy", 2: "Medium", 3: "Hard" };
const DIFF_CLS: Record<Difficulty, string> = {
  1: "bg-emerald-100 text-emerald-700",
  2: "bg-sky-100 text-sky-700",
  3: "bg-rose-100 text-rose-700",
};

export default function TopicEditor({ examId, initial }: { examId: string; initial: Topic[] }) {
  const router = useRouter();
  const [topics, setTopics] = useState(initial);
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>(2);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function addTopic() {
    if (!name.trim()) return;
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setBusy(false);
    const order_index = topics.length;
    const { data, error } = await supabase
      .from("topics")
      .insert({ exam_id: examId, user_id: user.id, name, difficulty, notes, order_index })
      .select()
      .single<Topic>();
    setBusy(false);
    if (error || !data) return;
    setTopics([...topics, data]);
    setName(""); setNotes(""); setDifficulty(2);
    router.refresh();
  }

  async function deleteTopic(id: string) {
    const supabase = createClient();
    await supabase.from("topics").delete().eq("id", id);
    setTopics(topics.filter((t) => t.id !== id));
    router.refresh();
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = topics.findIndex((t) => t.id === id);
    const next = idx + dir;
    if (next < 0 || next >= topics.length) return;
    const reordered = [...topics];
    [reordered[idx], reordered[next]] = [reordered[next], reordered[idx]];
    const updated = reordered.map((t, i) => ({ ...t, order_index: i }));
    setTopics(updated);
    const supabase = createClient();
    await Promise.all(
      updated.map((t) =>
        supabase.from("topics").update({ order_index: t.order_index }).eq("id", t.id),
      ),
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-slate-900">Topics</h2>
        {topics.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No topics yet. Add one below.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {topics.map((t, i) => (
              <li key={t.id} className="flex items-center gap-3 py-2">
                <span className="text-slate-400 w-6 text-right text-sm">{i + 1}.</span>
                <span className="flex-1 text-slate-900">{t.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${DIFF_CLS[t.difficulty]}`}>
                  {DIFF_LABELS[t.difficulty]}
                </span>
                <button onClick={() => move(t.id, -1)} className="text-slate-400 hover:text-slate-700">▲</button>
                <button onClick={() => move(t.id, 1)} className="text-slate-400 hover:text-slate-700">▼</button>
                <button onClick={() => deleteTopic(t.id)} className="text-slate-400 hover:text-danger">✕</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="font-semibold text-slate-900">Add a topic</h3>
        <div className="mt-3 space-y-3">
          <input
            value={name} onChange={(e) => setName(e.target.value)} placeholder="Topic name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <div className="flex gap-2">
            {(Object.keys(DIFF_LABELS) as unknown as Difficulty[]).map((d) => (
              <button
                key={d} type="button" onClick={() => setDifficulty(Number(d) as Difficulty)}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  difficulty === Number(d)
                    ? "bg-slate-900 text-white"
                    : "border border-slate-300 text-slate-700"
                }`}
              >{DIFF_LABELS[d]}</button>
            ))}
          </div>
          <textarea
            value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)" rows={2}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <button onClick={addTopic} disabled={busy || !name.trim()}
            className="rounded-lg bg-primary px-4 py-2 font-medium text-white disabled:opacity-50">
            Add topic
          </button>
        </div>
      </div>
    </div>
  );
}
