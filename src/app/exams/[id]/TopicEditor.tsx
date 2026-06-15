"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/lib/supabase/client";
import { generateScheduleForExam } from "@/lib/generateSchedule";
import { useI18n } from "@/components/I18nProvider";
import type { Topic, Difficulty } from "@/lib/supabase/types";

const DIFF_CLS: Record<Difficulty, string> = {
  1: "bg-emerald-100 text-emerald-700",
  2: "bg-sky-100 text-sky-700",
  3: "bg-rose-100 text-rose-700",
};

function SortableRow({ topic, idx, onDelete, diffLabel }: {
  topic: Topic; idx: number; onDelete: (id: string) => void; diffLabel: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: topic.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };
  return (
    <li ref={setNodeRef} style={style} className="flex items-center gap-3 py-2 bg-white">
      <span {...attributes} {...listeners} className="cursor-grab select-none text-slate-300 hover:text-slate-500">⋮⋮</span>
      <span className="text-slate-400 w-6 text-right text-sm">{idx + 1}.</span>
      <span className="flex-1 text-slate-900">{topic.name}</span>
      <span className={`rounded-full px-2 py-0.5 text-xs ${DIFF_CLS[topic.difficulty]}`}>{diffLabel}</span>
      <button onClick={() => onDelete(topic.id)} className="text-slate-400 hover:text-danger">✕</button>
    </li>
  );
}

export default function TopicEditor({
  examId, initial, hasSchedule,
}: { examId: string; initial: Topic[]; hasSchedule: boolean }) {
  const router = useRouter();
  const { t } = useI18n();
  const [topics, setTopics] = useState(initial);
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>(2);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [regenPrompt, setRegenPrompt] = useState(false);

  const DIFF_LABELS: Record<Difficulty, string> = { 1: t.exam_easy, 2: t.exam_medium, 3: t.exam_hard };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = topics.findIndex((tp) => tp.id === active.id);
    const newIdx = topics.findIndex((tp) => tp.id === over.id);
    const reordered = arrayMove(topics, oldIdx, newIdx).map((tp, i) => ({ ...tp, order_index: i }));
    setTopics(reordered);
    const supabase = createClient();
    await Promise.all(reordered.map((tp) =>
      supabase.from("topics").update({ order_index: tp.order_index }).eq("id", tp.id),
    ));
  }

  async function addTopic() {
    if (!name.trim()) return;
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setBusy(false);
    const order_index = topics.length;
    const { data, error } = await supabase
      .from("topics").insert({ exam_id: examId, user_id: user.id, name, difficulty, notes, order_index })
      .select().single<Topic>();
    setBusy(false);
    if (error || !data) return;
    setTopics([...topics, data]);
    setName(""); setNotes(""); setDifficulty(2);
    if (hasSchedule) setRegenPrompt(true);
    router.refresh();
  }

  async function deleteTopic(id: string) {
    const supabase = createClient();
    await supabase.from("topics").delete().eq("id", id);
    setTopics(topics.filter((tp) => tp.id !== id));
    router.refresh();
  }

  async function regenerate() {
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await generateScheduleForExam(supabase, examId, user.id);
    setRegenPrompt(false); setBusy(false); router.refresh();
  }

  return (
    <div className="space-y-4">
      {regenPrompt && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {t.exam_regen_prompt}
          <div className="mt-2 flex gap-2">
            <button onClick={regenerate} disabled={busy}
              className="rounded-lg bg-warn px-3 py-1 text-white">{t.exam_regen_full}</button>
            <button onClick={() => setRegenPrompt(false)} className="rounded-lg border border-amber-400 px-3 py-1">
              {t.exam_regen_just_add}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-slate-900">{t.exam_topics_title}</h2>
        {topics.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">{t.exam_no_topics}</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={topics.map((tp) => tp.id)} strategy={verticalListSortingStrategy}>
              <ul className="mt-3 divide-y divide-slate-100">
                {topics.map((tp, i) => (
                  <SortableRow key={tp.id} topic={tp} idx={i} onDelete={deleteTopic} diffLabel={DIFF_LABELS[tp.difficulty]} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="font-semibold text-slate-900">{t.exam_add_topic}</h3>
        <div className="mt-3 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.exam_topic_name}
            className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          <div className="flex gap-2">
            {([1, 2, 3] as Difficulty[]).map((d) => (
              <button key={d} type="button" onClick={() => setDifficulty(d)}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  difficulty === d ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700"
                }`}>{DIFF_LABELS[d]}</button>
            ))}
          </div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder={t.exam_topic_notes} rows={2}
            className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          <button onClick={addTopic} disabled={busy || !name.trim()}
            className="rounded-lg bg-primary px-4 py-2 font-medium text-white disabled:opacity-50">
            {t.exam_add_topic}
          </button>
        </div>
      </div>
    </div>
  );
}
