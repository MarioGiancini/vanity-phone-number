import { NextResponse } from "next/server";
import { discoverVanityNumbers } from "@/lib/agent/discover";
import { twilioConfigured } from "@/lib/agent/twilio";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Same-origin route for the Discover tab. Unlike /api/agent/discover this does
 * not require the agent key (the UI can't hold a server secret), so it is
 * tightly rate-limited and capped to a small number of inventory pages.
 */
export async function POST(request: Request) {
  const limited = rateLimit(`discover-ui:${clientKey(request)}`, { limit: 3, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in a minute." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  const body = (await request.json().catch(() => ({}))) as { areaCode?: string; pages?: number };
  const areaCode = (body.areaCode ?? "").replace(/[^0-9]/g, "").slice(0, 3);
  if (areaCode.length !== 3) {
    return NextResponse.json({ error: "Provide a 3-digit areaCode." }, { status: 400 });
  }

  if (!twilioConfigured()) {
    return NextResponse.json({
      areaCode,
      availabilityConfigured: false,
      scanned: 0,
      matches: 0,
      results: [],
      notes: ["Availability checking isn't configured on the server."],
    });
  }

  const discovery = await discoverVanityNumbers({
    areaCode,
    pages: Math.min(Math.max(body.pages ?? 2, 1), 3),
    limit: 24,
  });

  return NextResponse.json({
    ...discovery,
    availabilityConfigured: true,
    notes: [
      "Scanned a sample of available inventory; results are provider-scoped and change over time.",
    ],
  });
}
