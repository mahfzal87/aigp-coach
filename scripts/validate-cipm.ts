// CIPM pack validator: structure, the near-miss rule, answer-letter balance and the
// length-rank tells. Run from the repo root:
//   ./node_modules/.bin/tsx --tsconfig tsconfig.json scripts/validate-cipm.ts all   (or d1..d6, lib)
// PROBLEMS must be zero; fix WARNINGS unless there is a real reason. CIPM_ROOT overrides the pack folder.
import path from "path";
import { competenciesCipm, domainsCipm } from "@/content/exams/cipm/curriculum";
import type { Question, Topic } from "@/lib/types";

const ROOT = process.env.CIPM_ROOT ?? path.join(process.cwd(), "content/exams/cipm");
const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

// Planned counts per competency: topics, practice (2 per topic), hard pool.
export const PLAN: Record<string, { t: number; p: number; h: number }> = {
  "i-a": { t: 3, p: 6, h: 8 }, "i-b": { t: 3, p: 6, h: 7 }, "i-c": { t: 4, p: 8, h: 9 },
  "ii-a": { t: 4, p: 8, h: 9 }, "ii-b": { t: 2, p: 4, h: 4 }, "ii-c": { t: 2, p: 4, h: 5 }, "ii-d": { t: 2, p: 4, h: 4 },
  "iii-a": { t: 3, p: 6, h: 6 }, "iii-b": { t: 2, p: 4, h: 4 }, "iii-c": { t: 1, p: 2, h: 3 }, "iii-d": { t: 3, p: 6, h: 6 }, "iii-e": { t: 2, p: 4, h: 5 },
  "iv-a": { t: 3, p: 6, h: 7 }, "iv-b": { t: 2, p: 4, h: 4 }, "iv-c": { t: 3, p: 6, h: 6 },
  "v-a": { t: 2, p: 4, h: 4 }, "v-b": { t: 2, p: 4, h: 4 }, "v-c": { t: 3, p: 6, h: 5 },
  "vi-a": { t: 3, p: 6, h: 8 }, "vi-b": { t: 3, p: 6, h: 7 }, "vi-c": { t: 2, p: 4, h: 4 },
};

const TYPES = ["best", "not", "ordering", "role", "distinction", "recall"];
const TRAPS = ["too-narrow", "absolute", "premature", "true-but-irrelevant", "synonym-bait", "wrong-economics", "none"];
const problems: string[] = [];
const warnings: string[] = [];
const P = (s: string) => problems.push(s);
const W = (s: string) => warnings.push(s);
const pct = (n: number, d: number) => (d ? Math.round((100 * n) / d) : 0);

function checkQuestion(q: Question, kind: "practice" | "pool", compIds: Set<string>) {
  const id = q.id;
  const prefix = kind === "practice" ? "cmq-" : "cmp-";
  if (!id.startsWith(prefix + q.competencyId + "-")) P(`${id}: id must look like ${prefix}${q.competencyId}-<n>`);
  if (!compIds.has(q.competencyId)) P(`${id}: competency ${q.competencyId} is not in this domain`);
  if (!TYPES.includes(q.type)) P(`${id}: bad type ${q.type}`);
  if (!TRAPS.includes(q.trapType)) P(`${id}: bad trapType ${q.trapType}`);
  if (![1, 2, 3].includes(q.difficulty)) P(`${id}: bad difficulty ${q.difficulty}`);
  if (kind === "pool" && q.difficulty < 2) P(`${id}: pool items must be difficulty 2 or 3`);
  if (q.isMultiselect) P(`${id}: CIPM items are single-answer (isMultiselect false)`);
  if (q.source !== "authored") P(`${id}: source must be "authored"`);
  const comp = competenciesCipm.find((c) => c.id === q.competencyId);
  if (comp && q.bokRef !== `CIPM BoK v4.2.0 §${comp.code}`) P(`${id}: bokRef must be "CIPM BoK v4.2.0 §${comp.code}"`);
  if (!q.stem?.trim() || q.stem.length < 40) P(`${id}: stem missing or too short`);
  if (q.options.length !== 4) P(`${id}: needs exactly 4 options`);
  q.options.forEach((o, i) => {
    if (o.label !== "ABCD"[i]) P(`${id}: option ${i} label should be ${"ABCD"[i]}`);
    if (o.sort !== i) P(`${id}: option ${o.label} sort should be ${i}`);
    if (!o.text?.trim()) P(`${id}: option ${o.label} empty`);
  });
  const correct = q.options.filter((o) => o.isCorrect);
  if (correct.length !== 1) P(`${id}: exactly one correct option (has ${correct.length})`);
  const wrong = q.options.filter((o) => !o.isCorrect).map((o) => o.label);
  for (const l of wrong) {
    const w = q.whyWrong?.[l];
    if (!w) P(`${id}: whyWrong.${l} missing`);
    else if (w.length < 60) W(`${id}: whyWrong.${l} is thin (${w.length} chars)`);
  }
  for (const k of Object.keys(q.whyWrong ?? {})) if (!wrong.includes(k)) P(`${id}: whyWrong.${k} is not a wrong option`);
  if (!q.nearMiss) P(`${id}: nearMiss missing`);
  else if (!wrong.includes(q.nearMiss)) P(`${id}: nearMiss ${q.nearMiss} must be a wrong option`);
  else if ((q.whyWrong[q.nearMiss] ?? "").length < 90) W(`${id}: near-miss rationale should name the discriminator in full (${(q.whyWrong[q.nearMiss] ?? "").length} chars)`);
  if (!q.correctExplanation || q.correctExplanation.length < 120) W(`${id}: correctExplanation is thin`);
  // Length tell: the correct option should not be the obviously longest.
  const lens = q.options.map((o) => o.text.length);
  const c = correct[0];
  if (c) {
    const nm = q.options.find((o) => o.label === q.nearMiss);
    if (nm && c.text.length > nm.text.length * 1.6) W(`${id}: correct option is far longer than the near-miss (${c.text.length} vs ${nm.text.length}) — a length tell`);
    if (Math.max(...lens) === c.text.length && c.text.length > 1.35 * [...lens].sort((a, b) => b - a)[1]) W(`${id}: correct option is conspicuously the longest`);
  }
}

async function checkDomain(n: number) {
  const roman = ROMAN[n - 1];
  const domain = domainsCipm.find((d) => d.code === roman)!;
  const comps = competenciesCipm.filter((c) => c.domainId === domain.id);
  const compIds = new Set(comps.map((c) => c.id));
  let tmod: Record<string, unknown>, qmod: Record<string, unknown>;
  try {
    tmod = await import(`${ROOT}/topics-d${n}.ts`);
    qmod = await import(`${ROOT}/questions-d${n}.ts`);
  } catch (e) {
    P(`d${n}: cannot import files — ${(e as Error).message}`);
    return;
  }
  const topics = (tmod[`topicsD${n}`] ?? []) as Topic[];
  const practice = (qmod[`questionsD${n}`] ?? []) as Question[];
  const pool = (qmod[`poolD${n}`] ?? []) as Question[];
  if (!topics.length) P(`d${n}: export topicsD${n} missing or empty`);
  if (!practice.length) P(`d${n}: export questionsD${n} missing or empty`);
  if (!pool.length) P(`d${n}: export poolD${n} missing or empty`);

  const all = [...practice, ...pool];
  const ids = new Map<string, number>();
  for (const x of [...topics, ...all]) ids.set(x.id, (ids.get(x.id) ?? 0) + 1);
  for (const [id, k] of ids) if (k > 1) P(`${id}: duplicate id (${k}×)`);
  const stems = new Map<string, string>();
  for (const q of all) {
    const key = q.stem.toLowerCase().replace(/\W+/g, " ").trim();
    if (stems.has(key)) P(`${q.id}: same stem as ${stems.get(key)}`);
    stems.set(key, q.id);
  }
  practice.forEach((q) => checkQuestion(q, "practice", compIds));
  pool.forEach((q) => checkQuestion(q, "pool", compIds));

  const practiceIds = new Map(practice.map((q) => [q.id, q]));
  const wired = new Map<string, string>();
  for (const t of topics) {
    if (!t.id.startsWith(`cm-${t.competencyId}-`)) P(`${t.id}: topic id must look like cm-${t.competencyId}-<n>`);
    if (!compIds.has(t.competencyId)) P(`${t.id}: competency ${t.competencyId} not in this domain`);
    if (!t.title?.trim()) P(`${t.id}: title missing`);
    if (!t.conceptMd || t.conceptMd.length < 300) W(`${t.id}: conceptMd is thin (${t.conceptMd?.length ?? 0} chars)`);
    if (!t.exampleMd || t.exampleMd.length < 160) W(`${t.id}: exampleMd is thin (${t.exampleMd?.length ?? 0} chars)`);
    if (t.questionIds.length !== 2) W(`${t.id}: should wire exactly 2 practice questions (has ${t.questionIds.length})`);
    for (const qid of t.questionIds) {
      const q = practiceIds.get(qid);
      if (!q) P(`${t.id}: questionId ${qid} is not in questionsD${n}`);
      else if (q.competencyId !== t.competencyId) P(`${t.id}: ${qid} belongs to ${q.competencyId}`);
      if (wired.has(qid)) P(`${qid}: wired to two topics (${wired.get(qid)}, ${t.id})`);
      wired.set(qid, t.id);
    }
  }
  for (const q of practice) if (!wired.has(q.id)) P(`${q.id}: practice question not wired to any topic`);
  for (const comp of comps) {
    const ts = topics.filter((t) => t.competencyId === comp.id);
    const sorts = ts.map((t) => t.sort).sort((a, b) => a - b);
    if (sorts.some((s, i) => s !== i + 1)) P(`${comp.code}: topic sort should run 1..${ts.length} (has ${sorts.join(",")})`);
    const plan = PLAN[comp.id];
    const p = practice.filter((q) => q.competencyId === comp.id).length;
    const h = pool.filter((q) => q.competencyId === comp.id).length;
    if (ts.length < plan.t || p < plan.p || h < plan.h) W(`${comp.code}: below plan — topics ${ts.length}/${plan.t}, practice ${p}/${plan.p}, pool ${h}/${plan.h}`);
  }

  // Distribution stats.
  const letters: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  const near: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  for (const q of all) {
    const c = q.options.find((o) => o.isCorrect);
    if (c) letters[c.label]++;
    if (q.nearMiss) near[q.nearMiss]++;
  }
  for (const [l, k] of Object.entries(letters)) {
    const share = pct(k, all.length);
    if (share < 15 || share > 35) W(`d${n}: correct answer is ${l} in ${share}% of items — rebalance toward ~25% each`);
  }
  const longest = all.filter((q) => {
    const c = q.options.find((o) => o.isCorrect);
    return c && c.text.length === Math.max(...q.options.map((o) => o.text.length));
  }).length;
  if (pct(longest, all.length) > 40) W(`d${n}: correct option is the longest in ${pct(longest, all.length)}% of items — keep it at or under 40%`);
  // Rank tells (ordering items excluded — their options are permutations of one list).
  // "Drop the two shortest, take the shorter of the last two" must not work.
  const ranked = all.filter((q) => q.type !== "ordering");
  const rankOf = (q: Question, label: string | undefined) => {
    const len = q.options.find((o) => o.label === label)?.text.length ?? 0;
    return 1 + q.options.filter((o) => o.text.length > len).length;
  };
  const keyRank = [0, 0, 0, 0];
  let nearLongest = 0;
  let topTwo = 0;
  for (const q of ranked) {
    const key = q.options.find((o) => o.isCorrect)?.label;
    const kr = rankOf(q, key);
    const nr = rankOf(q, q.nearMiss);
    keyRank[Math.min(kr, 4) - 1]++;
    if (nr === 1) nearLongest++;
    if ((kr === 1 && nr === 2) || (kr === 2 && nr === 1)) topTwo++;
  }
  const keySecond = keyRank[1];
  if (pct(keySecond, ranked.length) > 40) W(`d${n}: correct option is the SECOND-longest in ${pct(keySecond, ranked.length)}% of items — spread its length rank across 1st–4th`);
  if (pct(nearLongest, ranked.length) > 40) W(`d${n}: the near-miss is the longest option in ${pct(nearLongest, ranked.length)}% of items — make a plain distractor the longest in some`);
  if (pct(topTwo, ranked.length) > 50) W(`d${n}: key and near-miss are the two longest options in ${pct(topTwo, ranked.length)}% of items — "drop the two shortest" must not work`);
  const rankTells = { keyLengthRank1to4: keyRank, nearMissLongestPct: pct(nearLongest, ranked.length), keyAndNearAreTopTwoPct: pct(topTwo, ranked.length) };
  const typeMix: Record<string, number> = {};
  for (const q of all) typeMix[q.type] = (typeMix[q.type] ?? 0) + 1;
  const trapNone = all.filter((q) => q.trapType === "none").length;
  if (pct(trapNone, all.length) > 25) W(`d${n}: ${pct(trapNone, all.length)}% of items have trapType "none" — name the trap on most items`);
  const d3pool = pool.filter((q) => q.difficulty === 3).length;
  if (pct(d3pool, pool.length) < 60) W(`d${n}: only ${pct(d3pool, pool.length)}% of the pool is difficulty 3 — aim for 60%+`);
  const diffPractice = [1, 2, 3].map((d) => practice.filter((q) => q.difficulty === d).length);

  console.log(
    JSON.stringify(
      {
        domain: `${roman} ${domain.name}`,
        topics: topics.length,
        practice: practice.length,
        pool: pool.length,
        correctLetters: letters,
        nearMissLetters: near,
        correctIsLongestPct: pct(longest, all.length),
        ...rankTells,
        typeMix,
        trapNone,
        practiceDifficulty123: diffPractice,
        poolD3: `${d3pool}/${pool.length}`,
      },
      null,
      1,
    ),
  );
}

async function checkLib() {
  const compIds = new Set(competenciesCipm.map((c) => c.id));
  const REGIONS = ["EU", "US", "Global", "APAC", "Org"];
  const KINDS = ["Law", "Framework", "Standard", "Principles", "Treaty", "Policy"];
  try {
    const { LAW_MAPS_CIPM = [], CONFUSABLES_CIPM = [] } = await import(`${ROOT}/lawlab.ts`);
    const mapIds = new Set<string>();
    let leaves = 0;
    for (const m of LAW_MAPS_CIPM) {
      if (mapIds.has(m.id)) P(`map ${m.id}: duplicate id`);
      mapIds.add(m.id);
      if (!REGIONS.includes(m.region)) P(`map ${m.id}: region ${m.region} invalid`);
      if (!KINDS.includes(m.kind)) P(`map ${m.id}: kind ${m.kind} invalid`);
      if (![1, 2, 3].includes(m.weight)) P(`map ${m.id}: weight must be 1..3`);
      if (!m.short || m.short.length > 22) W(`map ${m.id}: short name should be ≤ 22 chars (drill options)`);
      const bids = new Set<string>();
      for (const b of m.branches) {
        if (bids.has(b.id)) P(`map ${m.id}: duplicate branch ${b.id}`);
        bids.add(b.id);
        if (b.leaves.length < 3 || b.leaves.length > 7) W(`map ${m.id}.${b.id}: ${b.leaves.length} leaves (aim 3–7)`);
        leaves += b.leaves.length;
      }
      if (m.branches.length < 3) W(`map ${m.id}: only ${m.branches.length} branches`);
      if (m.keywords.length < 4) W(`map ${m.id}: only ${m.keywords.length} trigger keywords`);
      if (!m.traps.length) W(`map ${m.id}: no traps`);
    }
    const cids = new Set<string>();
    for (const c of CONFUSABLES_CIPM) {
      if (cids.has(c.id)) P(`confusable ${c.id}: duplicate id`);
      cids.add(c.id);
      if (c.rows.length < 4) W(`confusable ${c.id}: only ${c.rows.length} rows`);
      if (!c.tell?.trim()) P(`confusable ${c.id}: tell missing`);
    }
    console.log(JSON.stringify({ lawMaps: LAW_MAPS_CIPM.length, facts: leaves, confusables: CONFUSABLES_CIPM.length }));
  } catch (e) {
    P(`lawlab.ts: ${(e as Error).message}`);
  }
  try {
    const lib = await import(`${ROOT}/library.ts`);
    const g = lib.GLOSSARY_CIPM ?? [];
    const gt: string[] = lib.GLOSSARY_TAGS_CIPM ?? [];
    const terms = new Set<string>();
    for (const x of g) {
      if (terms.has(x.term.toLowerCase())) P(`glossary: duplicate term ${x.term}`);
      terms.add(x.term.toLowerCase());
      if (!gt.includes(x.tag)) P(`glossary ${x.term}: tag ${x.tag} not in GLOSSARY_TAGS_CIPM`);
    }
    const ft: string[] = lib.FACT_TAGS_CIPM ?? [];
    (lib.FACTS_CIPM ?? []).forEach((f: { n: number; tag: string }, i: number) => {
      if (f.n !== i + 1) P(`fact ${f.n}: n should be ${i + 1}`);
      if (!ft.includes(f.tag)) P(`fact ${f.n}: tag ${f.tag} not in FACT_TAGS_CIPM`);
    });
    for (const t of lib.TIMELINE_CIPM ?? []) if (!["done", "active", "deferred"].includes(t.status)) P(`timeline ${t.date}: bad status`);
    for (const p of lib.PENALTY_LADDER_CIPM ?? []) if (!(p.width > 0 && p.width <= 100)) P(`penalty ${p.tier}: width 1..100`);
    for (const k of ["GLOSSARY_CIPM", "GLOSSARY_TAGS_CIPM", "FACTS_CIPM", "FACT_TAGS_CIPM", "DISTINCTIONS_CIPM", "TIMELINE_CIPM", "PENALTY_LADDER_CIPM", "INSTRUMENTS_CIPM"])
      if (!lib[k] || !lib[k].length) P(`library.ts: export ${k} missing or empty`);
    console.log(JSON.stringify({ glossary: g.length, facts: (lib.FACTS_CIPM ?? []).length, distinctions: (lib.DISTINCTIONS_CIPM ?? []).length, timeline: (lib.TIMELINE_CIPM ?? []).length, instruments: (lib.INSTRUMENTS_CIPM ?? []).length }));
  } catch (e) {
    P(`library.ts: ${(e as Error).message}`);
  }
  try {
    const { flashcardsCipm = [] } = await import(`${ROOT}/flashcards.ts`);
    const ids = new Set<string>();
    for (const f of flashcardsCipm) {
      if (ids.has(f.id)) P(`flashcard ${f.id}: duplicate`);
      ids.add(f.id);
      if (!f.id.startsWith("cmf-")) P(`flashcard ${f.id}: id must start cmf-`);
      if (!compIds.has(f.competencyId)) P(`flashcard ${f.id}: unknown competency ${f.competencyId}`);
    }
    console.log(JSON.stringify({ flashcards: flashcardsCipm.length }));
  } catch (e) {
    P(`flashcards.ts: ${(e as Error).message}`);
  }
  try {
    const { updatesCipm = [] } = await import(`${ROOT}/updates.ts`);
    for (const u of updatesCipm) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(u.publishedDate)) P(`update ${u.id}: publishedDate must be YYYY-MM-DD`);
      if (!["info", "important", "critical"].includes(u.severity)) P(`update ${u.id}: bad severity`);
      if (!u.sourceUrl) W(`update ${u.id}: add a sourceUrl`);
    }
    console.log(JSON.stringify({ updates: updatesCipm.length }));
  } catch (e) {
    P(`updates.ts: ${(e as Error).message}`);
  }
}

(async () => {
  const arg = process.argv[2] ?? "all";
  if (arg === "lib" || arg === "all") await checkLib();
  for (let n = 1; n <= 6; n++) if (arg === `d${n}` || arg === "all") await checkDomain(n);
  console.log(`\nPROBLEMS (${problems.length})`);
  problems.slice(0, 120).forEach((p) => console.log("  ✗ " + p));
  console.log(`WARNINGS (${warnings.length})`);
  warnings.slice(0, 120).forEach((w) => console.log("  ! " + w));
  process.exit(problems.length ? 1 : 0);
})();
