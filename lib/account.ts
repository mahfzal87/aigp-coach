import type { Session } from "@supabase/supabase-js";
import { getActiveExam } from "@/lib/exam-state";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import type { ProgressExport } from "@/lib/types";

// Optional accounts (email + password) on top of Supabase Auth.
// The session lives in this browser and auto-refreshes, so there is no expiry
// from the user's point of view: you stay signed in until you log out.
// Progress mirrors to account_progress (one row per user PER EXAM, owner-only
// RLS). Schema: supabase/accounts.sql + supabase/multi_exam.sql.

export const authConfigured = supabaseConfigured;

// Set NEXT_PUBLIC_REQUIRE_AUTH=true to lock the whole app behind login —
// for forks that want a private instance. Off means accounts are optional.
export const authRequired = process.env.NEXT_PUBLIC_REQUIRE_AUTH === "true" && supabaseConfigured;

const TABLE = "account_progress";

export async function signUp(email: string, password: string): Promise<{ ok: boolean; needsConfirm?: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "not-configured" };
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) return { ok: false, error: error.message };
  // With email confirmation enabled on the project, no session comes back
  // until the link in the email is clicked.
  return { ok: true, needsConfirm: !data.session };
}

export async function signIn(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "not-configured" };
  const { error } = await sb.auth.signInWithPassword({ email, password });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function signOut(): Promise<void> {
  await getSupabase()?.auth.signOut();
}

// First name for personalisation. Source of truth is the auth user's metadata
// (travels with the session, zero extra reads); mirrored to profiles.first_name
// for the SaaS side of the house.
export function firstNameOf(session: Session | null): string {
  const n = session?.user.user_metadata?.first_name;
  return typeof n === "string" ? n.trim() : "";
}

export async function setFirstName(name: string): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "not-configured" };
  const first = name.trim().slice(0, 40);
  const { data, error } = await sb.auth.updateUser({ data: { first_name: first } });
  if (error) return { ok: false, error: error.message };
  if (data.user) await sb.from("profiles").update({ first_name: first }).eq("id", data.user.id);
  return { ok: true };
}

export async function getSession(): Promise<Session | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session;
}

export function onAuthChange(cb: (session: Session | null) => void): () => void {
  const sb = getSupabase();
  if (!sb) return () => {};
  const { data } = sb.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data.subscription.unsubscribe();
}

export async function pushAccountProgress(userId: string, data: ProgressExport): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb || !userId) return { ok: false, error: "not-configured" };
  const { error } = await sb
    .from(TABLE)
    .upsert({ user_id: userId, exam_id: getActiveExam(), data, updated_at: new Date().toISOString() }, { onConflict: "user_id,exam_id" });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function pullAccountProgress(userId: string): Promise<{ ok: boolean; data?: ProgressExport; error?: string }> {
  const sb = getSupabase();
  if (!sb || !userId) return { ok: false, error: "not-configured" };
  const { data, error } = await sb.from(TABLE).select("data").eq("user_id", userId).eq("exam_id", getActiveExam()).maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "not-found" };
  return { ok: true, data: data.data as ProgressExport };
}
