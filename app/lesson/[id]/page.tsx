"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Lightbulb, RotateCcw, X } from "lucide-react";
import {
  getCompetenciesByDomain,
  getCompetency,
  getDomains,
  getFlashcards,
  getQuestion,
  getQuestionsByCompetency,
  getTopicsByCompetency,
} from "@/lib/content";
import { isAnswerCorrect, shuffle } from "@/lib/scoring";
import { LESSON_PASS, XP_LESSON_BONUS, XP_TEST_BONUS } from "@/lib/gamify";
import { celebrate } from "@/lib/celebrate";
import type { Question, Topic } from "@/lib/types";
import { useProgress } from "@/store/progress";
import { Badge, Button, Card, CardBody } from "@/components/ui";
import { QuestionView } from "@/components/quiz/question-view";
import { m, MotionBar, Reveal, springSoft } from "@/components/motion";
import { haptic } from "@/lib/haptics";
import { Markdown } from "@/components/markdown";

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
  const [correctCount, setCorrectCount] = useState(0);
  const [missed, setMissed] = useState<{ q: Question; topicTitle?: string }[]>([]);
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
    if (score >= LESSON_PASS) haptic(isTest ? "milestone" : "success");
    if (isTest && score >= LESSON_PASS) celebrate({ sound, big: false });
    setDone(true);
  }

  function next() {
    if (step + 1 >= steps.length) finish(correctCount);
    else {
      setStep((s) => s + 1);
      setSelected([]);
      setRevealed(false);
      setStartTs(Date.now());
    }
  }

  function toggle(label: string, q: Question) {
    if (q.isMultiselect) setSelected((s) => (s.includes(label) ? s.filter((x) => x !== label) : [...s, label]));
    else setSelected([label]);
  }

  function check(q: Question, topicTitle?: string) {
    const correct = isAnswerCorrect(q, selected);
    recordAttempt({ questionId: q.id, competencyId: q.competencyId, chosen: selected, correct, confidence: 2, timeMs: Date.now() - startTs, mode: isTest ? "mock" : "practice" });
    haptic(correct ? "success" : "error");
    if (correct) setCorrectCount((c) => c + 1);
    else setMissed((prev) => [...prev, { q, topicTitle }]);
    setRevealed(true);
  }

  // ── Completion summary ──
  if (done) {
    const score = totalQ ? correctCount / totalQ : 1;
    const passed = score >= LESSON_PASS;
    const missedByTopic = new Map<string, Question[]>();
    for (const mq of missed) {
      const key = mq.topicTitle ?? "General";
      const list = missedByTopic.get(key) ?? [];
      list.push(mq.q);
      missedByTopic.set(key, list);
    }
    return (
      <Reveal className="mx-auto max-w-lg space-y-4 py-6">
        <div className="text-center">
          <CheckCircle2 size={44} className={`anim-pop mx-auto ${passed ? "text-[var(--success)]" : "text-[var(--muted)]"}`} />
          <h1 className="mt-3 text-2xl font-bold">{passed ? (isTest ? "Domain test passed" : "Module complete") : "Reviewed — run it again"}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {correctCount} of {totalQ} correct ({Math.round(score * 100)}%)
            {passed && <> · +{isTest ? XP_TEST_BONUS : XP_LESSON_BONUS} pts</>}
            {!passed && <> · {Math.round(LESSON_PASS * 100)}% needed to mark complete</>}
          </p>
        </div>

        {missed.length > 0 && (
          <Card><CardBody>
            <div className="mb-3 text-sm font-bold">Topics to revisit ({missedByTopic.size})</div>
            <div className="space-y-4">
              {[...missedByTopic.entries()].map(([topicTitle, items]) => (
                <div key={topicTitle}>
                  <Badge tone="danger">{topicTitle}</Badge>
                  <ul className="mt-2 space-y-2">
                    {items.map((q) => (
                      <li key={q.id} className="text-sm">
                        <div className="font-medium">{q.stem}</div>
                        <div className="mt-0.5 text-xs text-[var(--muted)]">✓ {q.options.find((o) => o.isCorrect)?.text} — {q.correctExplanation}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-[var(--muted)]">These misses feed your topic-level weakness tracking on the Progress page.</p>
          </CardBody></Card>
        )}

        <div className="flex flex-col gap-2">
          <Button onClick={() => router.push("/")}>Back to study plan</Button>
          <Button variant="outline" onClick={() => { setStep(0); setDone(false); setCorrectCount(0); setMissed([]); setSelected([]); setRevealed(false); }}><RotateCcw size={15} /> Run again</Button>
          {meta.competencyId && (
            <Link href={`/learn/${meta.competencyId}`} className="w-full"><Button variant="ghost" className="w-full"><BookOpen size={15} /> Read the study notes</Button></Link>
          )}
        </div>
      </Reveal>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      {/* top bar: exit + progress */}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/" aria-label="Exit module" className="press grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-2)]"><X size={20} /></Link>
        <MotionBar value={progress} className="flex-1" />
        <span className="text-xs font-semibold tabular-nums text-[var(--muted)]">{step + 1}/{steps.length}</span>
      </div>

      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{meta.title}</div>

      <m.div key={step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={springSoft}>
      {cur.kind === "topic" ? (
        <Card>
          <CardBody className="space-y-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">Learn · topic {cur.index + 1} of {cur.count}</div>
              <h2 className="mt-1 text-lg font-bold leading-snug">{cur.topic.title}</h2>
            </div>
            <div className="prose-note text-[15px] leading-relaxed"><Markdown>{cur.topic.conceptMd}</Markdown></div>
            <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/6 p-4">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--accent)]"><Lightbulb size={13} /> Example</div>
              <div className="prose-note text-sm leading-relaxed"><Markdown>{cur.topic.exampleMd}</Markdown></div>
            </div>
            <p className="text-xs text-[var(--muted)]">Next: an exam-style question on exactly this.</p>
          </CardBody>
        </Card>
      ) : cur.kind === "card" ? (
        <Card>
          <CardBody className="min-h-40 space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Key concept</div>
            <div className="text-[15px] font-semibold leading-relaxed">{cur.card.front}</div>
            <div className="prose-note text-sm text-[var(--muted)]"><Markdown>{cur.card.back}</Markdown></div>
          </CardBody>
        </Card>
      ) : (
        <Card><CardBody>
          {cur.topicTitle && <div className="mb-2"><Badge tone="accent">{cur.topicTitle}</Badge></div>}
          <QuestionView question={cur.q} selected={selected} onToggle={(l) => toggle(l, cur.q)} revealed={revealed} />
        </CardBody></Card>
      )}
      </m.div>

      <div className="mt-5">
        {cur.kind !== "q" ? (
          <Button className="w-full" onClick={() => { haptic("tap"); next(); }}>{cur.kind === "topic" ? "Got it — test me" : "Continue"}</Button>
        ) : !revealed ? (
          <Button className="w-full" onClick={() => check(cur.q, cur.topicTitle)} disabled={selected.length === 0}>Check answer</Button>
        ) : (
          <Button className="w-full" variant={isAnswerCorrect(cur.q, selected) ? "primary" : "outline"} onClick={next}>Continue</Button>
        )}
      </div>
    </div>
  );
}

type Step =
  | { kind: "topic"; topic: Topic; index: number; count: number }
  | { kind: "card"; card: { front: string; back: string } }
  | { kind: "q"; q: Question; topicTitle?: string };

function buildLesson(id: string): { title: string; competencyId: string | null; steps: Step[] } | null {
  if (id.startsWith("test-")) {
    const code = id.slice(5);
    const domain = getDomains().find((d) => d.code === code);
    if (!domain) return null;
    const comps = getCompetenciesByDomain(domain.id);
    const qs = shuffle(comps.flatMap((c) => getQuestionsByCompetency(c.id))).slice(0, 12);
    if (qs.length === 0) return null;
    return { title: `${domain.name} — domain test`, competencyId: null, steps: qs.map((q) => ({ kind: "q", q })) };
  }
  const comp = getCompetency(id);
  if (!comp) return null;

  // Topic-driven lesson: concept+example, then its convoluted question(s) — every topic, in order.
  const topics = getTopicsByCompetency(id);
  if (topics.length > 0) {
    const steps: Step[] = [];
    topics.forEach((t, i) => {
      steps.push({ kind: "topic", topic: t, index: i, count: topics.length });
      for (const qid of t.questionIds) {
        const q = getQuestion(qid);
        if (q) steps.push({ kind: "q", q, topicTitle: t.title });
      }
    });
    return { title: `${comp.code} · ${comp.name}`, competencyId: id, steps };
  }

  // Fallback (no topics authored yet): legacy flashcards + random questions.
  const cards = getFlashcards().filter((f) => f.competencyId === id).slice(0, 2);
  const qs = shuffle(getQuestionsByCompetency(id)).slice(0, 6);
  if (qs.length === 0) return null;
  const steps: Step[] = [...cards.map((c) => ({ kind: "card" as const, card: { front: c.front, back: c.back } })), ...qs.map((q) => ({ kind: "q" as const, q }))];
  return { title: `${comp.code} · ${comp.name}`, competencyId: id, steps };
}
