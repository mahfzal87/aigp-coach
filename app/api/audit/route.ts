import { NextResponse } from "next/server";
import { getCompetencies, getQuestions, getTopics } from "@/lib/content";
import { getExamDefs, getExamQuestions, getExamStats } from "@/lib/exams";
import { __setActiveExamUnsafe, DEFAULT_EXAM, EXAM_SLUGS } from "@/lib/exam-state";

// Content-integrity audit over EVERY exam pack. Run after every content drop:
// GET /api/audit — checks each bank for structural problems the type system
// can't see, plus paper sizes and full-form disjointness per exam.

function auditActivePack() {
  const qs = getQuestions();
  const compIds = new Set(getCompetencies().map((c) => c.id));
  const problems: string[] = [];
  // Legacy community items shipped with a combined rationale and no per-letter
  // whyWrong — tracked as gaps, not errors, so real defects stay visible.
  let legacyWhyWrongGaps = 0;
  // The near-miss standard applies to newly authored banks; older AIGP items
  // predate it, so missing nearMiss is reported as a count, not a problem.
  let nearMissGaps = 0;

  const seen = new Map<string, number>();
  for (const q of qs) seen.set(q.id, (seen.get(q.id) ?? 0) + 1);

  for (const q of qs) {
    const correct = q.options.filter((o) => o.isCorrect);
    const labels = new Set(q.options.map((o) => o.label));
    if (!compIds.has(q.competencyId)) problems.push(`${q.id}: unknown competency ${q.competencyId}`);
    if (q.isMultiselect) {
      if (q.options.length !== 5) problems.push(`${q.id}: multiselect must have 5 options (has ${q.options.length})`);
      if (correct.length !== 3) problems.push(`${q.id}: multiselect must have exactly 3 correct (has ${correct.length})`);
    } else if (correct.length !== 1) {
      problems.push(`${q.id}: single-answer must have exactly 1 correct (has ${correct.length})`);
    }
    for (const k of Object.keys(q.whyWrong)) {
      if (!labels.has(k)) problems.push(`${q.id}: whyWrong references missing option ${k}`);
    }
    for (const o of q.options) {
      if (!o.isCorrect && !q.whyWrong[o.label]) {
        if (q.source === "community") legacyWhyWrongGaps++;
        else problems.push(`${q.id}: option ${o.label} wrong but unexplained`);
      }
    }
    if (!q.correctExplanation?.trim()) problems.push(`${q.id}: missing correctExplanation`);
    if (!q.stem?.trim()) problems.push(`${q.id}: empty stem`);
    if (q.nearMiss) {
      if (!labels.has(q.nearMiss)) problems.push(`${q.id}: nearMiss ${q.nearMiss} is not an option`);
      else if (q.options.find((o) => o.label === q.nearMiss)?.isCorrect) problems.push(`${q.id}: nearMiss ${q.nearMiss} is the correct answer`);
    } else {
      nearMissGaps++;
    }
  }

  const qIds = new Set(qs.map((q) => q.id));
  for (const t of getTopics()) {
    for (const qid of t.questionIds) if (!qIds.has(qid)) problems.push(`topic ${t.id}: dangling question ${qid}`);
  }

  const exams: Record<string, unknown> = {};
  for (const def of getExamDefs()) exams[def.id] = getExamStats(def.id);
  const fullIds = getExamDefs().filter((d) => d.kind === "full").map((d) => d.id);
  const formSets = fullIds.map((id) => getExamQuestions(id).map((q) => q.id));
  const formOverlap: Record<string, number> = {};
  for (let i = 0; i < formSets.length; i++)
    for (let j = i + 1; j < formSets.length; j++)
      formOverlap[`${fullIds[i]}~${fullIds[j]}`] = formSets[i].filter((id) => formSets[j].includes(id)).length;

  const byPrefix: Record<string, number> = {};
  for (const q of qs) {
    const p = q.id.split("-")[0];
    byPrefix[p] = (byPrefix[p] ?? 0) + 1;
  }

  return {
    ok: problems.length === 0,
    bank: qs.length,
    topics: getTopics().length,
    byPrefix,
    d3: qs.filter((q) => q.difficulty === 3).length,
    multiselect: qs.filter((q) => q.isMultiselect).length,
    formOverlap,
    exams,
    legacyWhyWrongGaps,
    nearMissGaps,
    problems: problems.slice(0, 200),
    problemCount: problems.length,
  };
}

export async function GET() {
  const packs: Record<string, ReturnType<typeof auditActivePack>> = {};
  try {
    for (const slug of EXAM_SLUGS) {
      __setActiveExamUnsafe(slug);
      packs[slug] = auditActivePack();
    }
  } finally {
    __setActiveExamUnsafe(DEFAULT_EXAM);
  }
  return NextResponse.json({ ok: Object.values(packs).every((p) => p.ok), packs });
}
