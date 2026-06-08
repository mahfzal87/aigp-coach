"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Check, Heart, PartyPopper, X, Zap } from "lucide-react";
import {
  getCompetenciesByDomain,
  getCompetency,
  getDomains,
  getFlashcards,
  getQuestionsByCompetency,
} from "@/lib/content";
import { isAnswerCorrect, shuffle } from "@/lib/scoring";
import { LESSON_PASS, XP_LESSON_BONUS, XP_TEST_BONUS } from "@/lib/gamify";
import { buzzFail, celebrate } from "@/lib/celebrate";
import type { Question } from "@/lib/types";
import { useProgress } from "@/store/progress";
import { Button, Card, CardBody } from "@/components/ui";
import { QuestionView } from "@/components/quiz/question-view";

export default function LessonPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const recordAttempt = useProgress((s) => s.recordAttempt);
  const completeLesson = useProgress((s) => s.completeLesson);
  const sound = useProgress((s) => s.settings.sound ?? true);

  const isTest = id.startsWith("test-");
  const meta = useMemo(() => buildLesson(id), [id]);

  const [step, setStep] = useState(0); // index over the steps array
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [hearts, setHearts] = useState(isTest ? 5 : 3);
  const [done, setDone] = useState(false);
  const [startTs, setStartTs] = useState(Date.now());

  if (!meta) {
    return <div className="text-sm font-bold text-[var(--muted)]">Lesson not found. <Link href="/" className="text-[var(--accent)] underline">Back to path</Link></div>;
  }

  const steps = meta.steps;
  const totalQ = steps.filter((s) => s.kind === "q").length;
  const cur = steps[step];
  const progress = (step / steps.length) * 100;

  function finish(finalCorrect: number) {
    const score = totalQ ? finalCorrect / totalQ : 1;
    completeLesson(id, score, isTest ? XP_TEST_BONUS : XP_LESSON_BONUS);
    if (score >= LESSON_PASS) celebrate({ sound, big: isTest || finalCorrect === totalQ });
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
    else { setHearts((h) => h - 1); buzzFail({ sound }); }
    setRevealed(true);
  }

  // ── Celebration ──
  if (done) {
    const score = totalQ ? correctCount / totalQ : 1;
    const passed = score >= LESSON_PASS;
    const perfect = correctCount === totalQ;
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <div className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full" style={{ background: passed ? "var(--gold)" : "var(--surface-2)", boxShadow: passed ? "0 6px 0 0 #d9a800" : "none" }}>
          <PartyPopper size={44} className={passed ? "text-white" : "text-[var(--muted)]"} />
        </div>
        <h1 className="font-display text-3xl font-extrabold">{perfect ? "Flawless!" : passed ? "Lesson complete!" : "Keep going!"}</h1>
        <p className="mt-2 text-sm font-bold text-[var(--muted)]">You got {correctCount} of {totalQ} right.</p>
        <div className="mx-auto mt-6 flex max-w-xs justify-center gap-3">
          <Card className="flex-1"><CardBody className="p-3"><div className="flex items-center justify-center gap-1 font-display text-xl font-extrabold text-[var(--gold)]"><Zap size={18} fill="var(--gold)" />+{passed ? (isTest ? XP_TEST_BONUS : XP_LESSON_BONUS) : 0}</div><div className="text-[10px] font-extrabold text-[var(--muted)]">BONUS XP</div></CardBody></Card>
          <Card className="flex-1"><CardBody className="p-3"><div className="font-display text-xl font-extrabold">{Math.round(score * 100)}%</div><div className="text-[10px] font-extrabold text-[var(--muted)]">SCORE</div></CardBody></Card>
        </div>
        <div className="mt-8 flex flex-col gap-2">
          <Button onClick={() => router.push("/")}>Continue</Button>
          <Button variant="ghost" onClick={() => { setStep(0); setDone(false); setCorrectCount(0); setHearts(isTest ? 5 : 3); setSelected([]); setRevealed(false); }}>Retry</Button>
        </div>
      </div>
    );
  }

  // ── Out of hearts ──
  if (hearts <= 0 && !revealed) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <Heart size={56} className="mx-auto text-[var(--danger)]" fill="var(--danger)" />
        <h1 className="mt-4 font-display text-2xl font-extrabold">Out of hearts</h1>
        <p className="mt-2 text-sm font-bold text-[var(--muted)]">Review the concept and try again — no penalty, this is about learning.</p>
        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={() => { setStep(0); setCorrectCount(0); setHearts(isTest ? 5 : 3); setSelected([]); setRevealed(false); }}>Try again</Button>
          <Link href={meta.competencyId ? `/learn/${meta.competencyId}` : "/"}><Button variant="outline" className="w-full">Review the lesson</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      {/* top bar: exit + progress + hearts */}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/" className="press grid h-9 w-9 place-items-center rounded-xl text-[var(--muted)] hover:bg-[var(--surface-2)]"><X size={22} /></Link>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className="h-full rounded-full bg-[var(--primary)] transition-all duration-300" style={{ width: `${progress}%` }} /></div>
        <span className="flex items-center gap-1 font-extrabold text-[var(--danger)]"><Heart size={20} fill="var(--danger)" />{hearts}</span>
      </div>

      <div className="mb-1 text-xs font-extrabold uppercase tracking-wide text-[var(--muted)]">{meta.title}</div>

      {cur.kind === "card" ? (
        <Card>
          <button onClick={() => setFlipped((f) => !f)} className="block w-full text-left">
            <CardBody className="min-h-44">
              <div className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--muted)]">{flipped ? "Answer" : "Learn this"}</div>
              <div className="mt-2 font-display text-lg font-extrabold leading-snug">{flipped ? cur.card.back : cur.card.front}</div>
              {!flipped && <div className="mt-4 text-xs font-bold text-[var(--muted)]">Tap to reveal the answer</div>}
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
          <Button className="w-full" onClick={() => check(cur.q)} disabled={selected.length === 0}>Check</Button>
        ) : (
          <Button className="w-full" variant={isAnswerCorrect(cur.q, selected) ? "primary" : "danger"} onClick={next}>Continue</Button>
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
    return { title: `${domain.name} — Unit Test`, competencyId: null, steps: qs.map((q) => ({ kind: "q", q })) };
  }
  const comp = getCompetency(id);
  if (!comp) return null;
  const cards = getFlashcards().filter((f) => f.competencyId === id).slice(0, 2);
  const qs = shuffle(getQuestionsByCompetency(id)).slice(0, 5);
  if (qs.length === 0) return null;
  const steps: Step[] = [...cards.map((c) => ({ kind: "card" as const, card: { front: c.front, back: c.back } })), ...qs.map((q) => ({ kind: "q" as const, q }))];
  return { title: `${comp.code} · ${comp.name}`, competencyId: id, steps };
}
