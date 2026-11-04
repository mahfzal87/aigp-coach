import { getPackExtras } from "@/lib/content";
import { getActiveExam } from "@/lib/exam-state";
import { getSupabase } from "@/lib/supabase";
import type { LawUpdate } from "@/lib/types";

// Reads the law-updates feed from Supabase when configured; otherwise from the
// active pack's bundled feed. The DB table only holds AIGP rows, so other exams
// always read their bundle.
export async function getUpdates(): Promise<LawUpdate[]> {
  const bundledUpdates = getPackExtras().updates;
  const sb = getActiveExam() === "aigp" ? getSupabase() : null;
  if (sb) {
    try {
      // A paused or unreachable backend must not hold the page on "Loading…":
      // after 2.5 s, fall back to the bundled feed.
      const query = sb.from("law_updates").select("*").eq("status", "published").order("published_date", { ascending: false });
      const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 2500));
      const { data, error } = await Promise.race([query, timeout]);
      if (!error && data && data.length) {
        return data.map((r: Record<string, unknown>) => ({
          id: String(r.id),
          title: String(r.title),
          bodyMd: String(r.body_md ?? ""),
          sourceUrl: (r.source_url as string) ?? undefined,
          jurisdiction: String(r.jurisdiction ?? ""),
          publishedDate: String(r.published_date ?? ""),
          bokRelevant: Boolean(r.bok_relevant),
          severity: (r.severity as LawUpdate["severity"]) ?? "info",
          status: "published",
        }));
      }
    } catch {
      // fall through to bundled
    }
  }
  return [...bundledUpdates].sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
}
