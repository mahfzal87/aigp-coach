import { updates as bundledUpdates } from "@/content/updates";
import { getSupabase } from "@/lib/supabase";
import type { LawUpdate } from "@/lib/types";

// Reads the law-updates feed from Supabase when configured; otherwise from bundled content.
export async function getUpdates(): Promise<LawUpdate[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from("law_updates")
        .select("*")
        .eq("status", "published")
        .order("published_date", { ascending: false });
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
