import { getActiveExam } from "@/lib/exam-state";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import type { ProgressExport } from "@/lib/types";

// Anonymous "sync code" cloud save — no login. Progress is stored in Supabase
// under an unguessable code, one row per exam; enter the same code on another
// device to restore. Table (see supabase/progress_sync.sql + multi_exam.sql):
//   progress_sync(code text, exam_id text, data jsonb, updated_at timestamptz,
//   primary key (code, exam_id))

const TABLE = "progress_sync";
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I/L

export const syncConfigured = supabaseConfigured;

export function genSyncCode(): string {
  const bytes = new Uint8Array(8);
  (globalThis.crypto ?? window.crypto).getRandomValues(bytes);
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]);
  return `AIGP-${chars.slice(0, 4).join("")}-${chars.slice(4, 8).join("")}`;
}

export function normalizeCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

export async function pushProgress(code: string, data: ProgressExport): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb || !code) return { ok: false, error: "not-configured" };
  const { error } = await sb
    .from(TABLE)
    .upsert({ code, exam_id: getActiveExam(), data, updated_at: new Date().toISOString() }, { onConflict: "code,exam_id" });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function pullProgress(code: string): Promise<{ ok: boolean; data?: ProgressExport; error?: string }> {
  const sb = getSupabase();
  if (!sb || !code) return { ok: false, error: "not-configured" };
  const { data, error } = await sb.from(TABLE).select("data").eq("code", code).eq("exam_id", getActiveExam()).maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "not-found" };
  return { ok: true, data: data.data as ProgressExport };
}
