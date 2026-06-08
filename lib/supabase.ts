import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Optional: the app runs fully on bundled content. When Supabase env is set,
// dynamic content (e.g. the law-updates feed) can be read from the DB so it
// updates without a redeploy.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anon);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (!client) client = createClient(url as string, anon as string, { auth: { persistSession: false } });
  return client;
}
