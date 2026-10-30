import { NextResponse } from "next/server";
import { getCompetencies, getQuestions, getTopics } from "@/lib/content";
import { EXAM_DEFS, getExamQuestions, getExamStats } from "@/lib/exams";

// Content-integrity audit. Run after every content drop: GET /api/audit
// Checks the merged bank for structural problems the type system can't see.
export async function GET() {
  const qs = getQuestions();
  const compIds = new Set(getCompetencies().map((c) => c.id));
  const problems: string[] = [];
  // Legacy community items (x-*) shipped with a combined rationale and no per-letter
  // whyWrong — tracked as gaps, not errors, so real defects stay visible.
  let legacyWhyWrongGaps = 0;

  // duplicate ids survive the merge de-dupe silently — detect collisions at source
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
  }

  // dangling topic question refs
  const qIds = new Set(qs.map((q) => q.id));
  for (const t of getTopics()) {
    for (const qid of t.questionIds) if (!qIds.has(qid)) problems.push(`topic ${t.id}: dangling question ${qid}`);
  }

  // exam clusters: size + full-form disjointness
  const exams: Record<string, unknown> = {};
  for (const def of EXAM_DEFS) exams[def.id] = getExamStats(def.id);
  const formIds = ["form-a", "form-b", "form-c"].map((id) => getExamQuestions(id).map((q) => q.id));
  const overlapAB = formIds[0].filter((id) => formIds[1].includes(id)).length;
  const overlapAC = formIds[0].filter((id) => formIds[2].includes(id)).length;
  const overlapBC = formIds[1].filter((id) => formIds[2].includes(id)).length;

  const byPrefix: Record<string, number> = {};
  for (const q of qs) {
    const p = q.id.split("-")[0];
    byPrefix[p] = (byPrefix[p] ?? 0) + 1;
  }

  return NextResponse.json({
    ok: problems.length === 0,
    bank: qs.length,
    byPrefix,
    d3: qs.filter((q) => q.difficulty === 3).length,
    multiselect: qs.filter((q) => q.isMultiselect).length,
    formOverlap: { AB: overlapAB, AC: overlapAC, BC: overlapBC },
    exams,
    legacyWhyWrongGaps,
    problems: problems.slice(0, 200),
    problemCount: problems.length,
  });
}
