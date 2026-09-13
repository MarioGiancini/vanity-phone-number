import { NextResponse } from "next/server";
import { carrierOverride } from "@/lib/agent/credentials";
import { discoverVanityNumbers } from "@/lib/agent/discover";
import { anyProviderConfigured } from "@/lib/agent/providers";
import { clientKey, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Same-origin route for the Discover tab. Unlike /api/agent/discover this does
 * not require the agent key (the UI can't hold a server secret), so it is
 * tightly rate-limited and capped to a small number of inventory pages.
 * Visitors can bring their own carrier keys via the Carrier keys dialog.
 */
export async function POST(request: Request) {
  const override = carrierOverride(request);
  const limit = override ? 6 : 2;
  const limited = rateLimit(`discover-ui:${override ? "byo" : "server"}:${clientKey(request)}`, {
    limit,
    windowMs: 60_000,
  });
  const headers = rateLimitHeaders(limited, limit);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in a minute, or add your own carrier keys." },
      { status: 429, headers },
    );
  }

  const body = (await request.json().catch(() => ({}))) as { areaCode?: string; pages?: number };
  const areaCode = (body.areaCode ?? "").replace(/[^0-9]/g, "").slice(0, 3);
  if (areaCode.length !== 3) {
    return NextResponse.json({ error: "Provide a 3-digit areaCode." }, { status: 400, headers });
  }

  if (!anyProviderConfigured(override)) {
    return NextResponse.json(
      {
        areaCode,
        availabilityConfigured: false,
        scanned: 0,
        matches: 0,
        results: [],
        notes: ["No carrier is configured. Add your own keys or set them on the server."],
      },
      { headers },
    );
  }

  const discovery = await discoverVanityNumbers({
    areaCode,
    pages: Math.min(Math.max(body.pages ?? 2, 1), 3),
    limit: 24,
    override,
  });

  return NextResponse.json(
    {
      ...discovery,
      availabilityConfigured: true,
      notes: [
        "Scanned a sample of available inventory; results are provider-scoped and change over time.",
      ],
    },
    { headers },
  );
}
