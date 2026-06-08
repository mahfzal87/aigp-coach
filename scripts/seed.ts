/* Seed Supabase from the bundled /content modules. Run with: npm run seed
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { domains, competencies } from "../content/curriculum";
import { notes } from "../content/notes";
import { questions } from "../content/questions";
import { flashcards } from "../content/flashcards";
import { updates } from "../content/updates";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

async function upsert(table: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const { error } = await sb.from(table).upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`  ✓ ${table}: ${rows.length}`);
}

async function main() {
  console.log("Seeding AIGP Coach content…");

  await upsert("domains", domains.map((d) => ({ id: d.id, code: d.code, name: d.name, summary: d.summary, min_q: d.minQ, max_q: d.maxQ, sort: d.sort })));
  await upsert("competencies", competencies.map((c) => ({ id: c.id, domain_id: c.domainId, code: c.code, name: c.name, description: c.description, min_q: c.minQ, max_q: c.maxQ, sort: c.sort })));
  await upsert("study_notes", notes.map((n) => ({ id: n.id, competency_id: n.competencyId, title: n.title, body_md: n.bodyMd, tags: n.tags, sort: n.sort, source: n.source ?? null })));

  await upsert("questions", questions.map((q) => ({
    id: q.id, competency_id: q.competencyId, type: q.type, difficulty: q.difficulty, scenario: q.scenario ?? null,
    stem: q.stem, is_multiselect: q.isMultiselect, correct_explanation: q.correctExplanation, why_wrong: q.whyWrong,
    strategy_note: q.strategyNote ?? null, trap_type: q.trapType, bok_ref: q.bokRef, source: q.source, status: "live",
  })));

  // replace options for each question, then insert fresh (avoids identity-id conflicts)
  const qids = questions.map((q) => q.id);
  await sb.from("question_options").delete().in("question_id", qids);
  const options = questions.flatMap((q) => q.options.map((o) => ({ question_id: q.id, label: o.label, text: o.text, is_correct: o.isCorrect, sort: o.sort })));
  if (options.length) {
    const { error } = await sb.from("question_options").insert(options);
    if (error) throw new Error(`question_options: ${error.message}`);
    console.log(`  ✓ question_options: ${options.length}`);
  }

  await upsert("flashcards", flashcards.map((f) => ({ id: f.id, competency_id: f.competencyId, front: f.front, back: f.back, tags: f.tags })));
  await upsert("law_updates", updates.map((u) => ({ id: u.id, title: u.title, body_md: u.bodyMd, source_url: u.sourceUrl ?? null, jurisdiction: u.jurisdiction, published_date: u.publishedDate, bok_relevant: u.bokRelevant, severity: u.severity, status: u.status })));
  await upsert("content_meta", [
    { key: "bok_version", value: "2.1" },
    { key: "seed_version", value: String(Date.now()) },
    { key: "last_updated", value: new Date().toISOString() },
  ]);

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
