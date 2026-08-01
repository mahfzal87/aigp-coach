"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, RotateCcw, X } from "lucide-react";
import {
  getCompetenciesByDomain,
  getCompetency,
  getDomains,
  getFlashcards,
  getQuestionsByCompetency,
} from "@/lib/content";
import { isAnswerCorrect, shuffle } from "@/lib/scoring";
import { LESSON_PASS, XP_LESSON_BONUS, XP_TEST_BONUS } from "@/lib/gamify";
import { celebrate } from "@/lib/celebrate";
import type { Question } from "@/lib/types";
import { useProgress } from "@/store/progress";
import { Button, Card, CardBody } from "@/components/ui";
import { QuestionView } from "@/components/quiz/question-view";

export default function LessonPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const recordAttempt = useProgress((s) => s.recordAttempt);
  const completeLesson = useProgress((s) => s.completeLesson);
  const sound = useProgress((s) => s.settings.sound ?? false);

  const isTest = id.startsWith("test-");
  const meta = useMemo(() => buildLesson(id), [id]);

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [missed, setMissed] = useState<Question[]>([]);
  const [done, setDone] = useState(false);
  const [startTs, setStartTs] = useState(Date.now());

  if (!meta) {
    return <div className="text-sm text-[var(--muted)]">Module not found. <Link href="/" className="text-[var(--accent)] underline">Back to study plan</Link></div>;
  }

  const steps = meta.steps;
  const totalQ = steps.filter((s) => s.kind === "q").length;
  const cur = steps[step];
  const progress = (step / steps.length) * 100;

  function finish(finalCorrect: number) {
    const score = totalQ ? finalCorrect / totalQ : 1;
    completeLesson(id, score, isTest ? XP_TEST_BONUS : XP_LESSON_BONUS);
    if (isTest && score >= LESSON_PASS) celebrate({ sound, big: false });
    setDone(true);
  }

  function next() {
    if (step + 1 >= steps.length) finish(correctCount);
    else {
      setStep((s) => s + 1);
      setSelected([]);
      setRevealed(false);
      setFlipped(false);
      setStartTs(Date.now());
    }
  }

  function toggle(label: string, q: Question) {
    if (q.isMultiselect) setSelected((s) => (s.includes(label) ? s.filter((x) => x !== label) : [...s, label]));
    else setSelected([label]);
  }

  function check(q: Question) {
    const correct = isAnswerCorrect(q, selected);
    recordAttempt({ questionId: q.id, competencyId: q.competencyId, chosen: selected, correct, confidence: 2, timeMs: Date.now() - startTs, mode: isTest ? "mock" : "practice" });
    if (correct) setCorrectCount((c) => c + 1);
    else setMissed((m) => [...m, q]);
    setRevealed(true);
  }

  // ── Completion summary ──
  if (done) {
    const score = totalQ ? correctCount / totalQ : 1;
    const passed = score >= LESSON_PASS;
    return (
      <div className="mx-auto max-w-lg space-y-4 py-6">
        <div className="text-center">
          <CheckCircle2 size={44} className={`mx-auto ${passed ? "text-[var(--success)]" : "text-[var(--muted)]"}`} />
          <h1 className="mt-3 text-2xl font-bold">{passed ? (isTest ? "Domain test passed" : "Module complete") : "Reviewed — run it again"}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {correctCount} of {totalQ} correct ({Math.round(score * 100)}%)
            {passed && <> · +{isTest ? XP_TEST_BONUS : XP_LESSON_BONUS} pts</>}
            {!passed && <> · {Math.round(LESSON_PASS * 100)}% needed to mark complete</>}
          </p>
        </div>

        {missed.length > 0 && (
          <Card><CardBody>
            <div className="mb-2 text-sm font-bold">Review your misses ({missed.length})</div>
            <ul className="space-y-2">
              {missed.map((q) => (
                <li key={q.id} className="text-sm">
                  <div className="font-medium">{q.stem}</div>
                  <div className="mt-0.5 text-xs text-[var(--muted)]">✓ {q.options.find((o) => o.isCorrect)?.text} — {q.correctExplanation}</div>
                </li>
              ))}
            </ul>
          </CardBody></Card>
        )}

        <div className="flex flex-col gap-2">
          <Button onClick={() => router.push("/")}>Back to study plan</Button>
          <Button variant="outline" onClick={() => { setStep(0); setDone(false); setCorrectCount(0); setMissed([]); setSelected([]); setRevealed(false); }}><RotateCcw size={15} /> Run again</Button>
          {meta.competencyId && (
            <Link href={`/learn/${meta.competencyId}`} className="w-full"><Button variant="ghost" className="w-full"><BookOpen size={15} /> Read the study notes</Button></Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      {/* top bar: exit + progress */}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/" aria-label="Exit module" className="press grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-2)]"><X size={20} /></Link>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className="h-full rounded-full bg-[var(--primary)] transition-all duration-300" style={{ width: `${progress}%` }} /></div>
        <span className="text-xs font-semibold tabular-nums text-[var(--muted)]">{step + 1}/{steps.length}</span>
      </div>

      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{meta.title}</div>

      {cur.kind === "card" ? (
        <Card>
          <button onClick={() => setFlipped((f) => !f)} className="block w-full cursor-pointer text-left">
            <CardBody className="min-h-40">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">{flipped ? "Answer" : "Key concept"}</div>
              <div className="mt-2 text-[15px] font-semibold leading-relaxed">{flipped ? cur.card.back : cur.card.front}</div>
              {!flipped && <div className="mt-4 text-xs text-[var(--muted)]">Click to reveal</div>}
            </CardBody>
          </button>
        </Card>
      ) : (
        <Card><CardBody><QuestionView question={cur.q} selected={selected} onToggle={(l) => toggle(l, cur.q)} revealed={revealed} /></CardBody></Card>
      )}

      <div className="mt-5">
        {cur.kind === "card" ? (
          <Button className="w-full" onClick={next}>Continue</Button>
        ) : !revealed ? (
          <Button className="w-full" onClick={() => check(cur.q)} disabled={selected.length === 0}>Check answer</Button>
        ) : (
          <Button className="w-full" variant={isAnswerCorrect(cur.q, selected) ? "primary" : "outline"} onClick={next}>Continue</Button>
        )}
      </div>
    </div>
  );
}

type Step = { kind: "card"; card: { front: string; back: string } } | { kind: "q"; q: Question };

function buildLesson(id: string): { title: string; competencyId: string | null; steps: Step[] } | null {
  if (id.startsWith("test-")) {
    const code = id.slice(5);
    const domain = getDomains().find((d) => d.code === code);
    if (!domain) return null;
    const comps = getCompetenciesByDomain(domain.id);
    const qs = shuffle(comps.flatMap((c) => getQuestionsByCompetency(c.id))).slice(0, 10);
    if (qs.length === 0) return null;
    return { title: `${domain.name} — domain test`, competencyId: null, steps: qs.map((q) => ({ kind: "q", q })) };
  }
  const comp = getCompetency(id);
  if (!comp) return null;
  const cards = getFlashcards().filter((f) => f.competencyId === id).slice(0, 2);
  const qs = shuffle(getQuestionsByCompetency(id)).slice(0, 6);
  if (qs.length === 0) return null;
  const steps: Step[] = [...cards.map((c) => ({ kind: "card" as const, card: { front: c.front, back: c.back } })), ...qs.map((q) => ({ kind: "q" as const, q }))];
  return { title: `${comp.code} · ${comp.name}`, competencyId: id, steps };
}
