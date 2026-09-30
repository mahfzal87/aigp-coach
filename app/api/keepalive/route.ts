import { NextResponse } from "next/server";

// Pinged daily by Vercel Cron (see vercel.json). Free-tier Supabase pauses
// projects after ~7 days without traffic — which silently kills cloud sync.
// One lightweight read a day keeps the project active.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ ok: false, reason: "not-configured" }, { status: 200 });
  try {
    const res = await fetch(`${url}/rest/v1/progress_sync?select=code&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    return NextResponse.json({ ok: res.ok, status: res.status }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ ok: false, reason: (e as Error).message }, { status: 200 });
  }
}
