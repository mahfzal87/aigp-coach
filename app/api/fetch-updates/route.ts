import { NextResponse } from "next/server";

// Optional, feature-flagged web-update fetcher. Off by default (no runtime AI).
// To enable: set UPDATES_FETCH_ENABLED=true and provide the keys your chosen
// search/LLM provider needs, then implement the fetch+summarize+insert logic here.
export async function POST() {
  if (process.env.UPDATES_FETCH_ENABLED !== "true") {
    return NextResponse.json(
      {
        message:
          "In-app fetching is not configured. Updates are curated from Claude Code and seeded to the database. To enable the live fetcher, set UPDATES_FETCH_ENABLED=true and configure provider keys.",
      },
      { status: 200 }
    );
  }
  // Placeholder for the live pipeline (search → summarize → insert as pending_review).
  return NextResponse.json({ message: "Live fetcher enabled, but no provider implementation is wired yet." });
}
