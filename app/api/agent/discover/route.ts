import { NextResponse } from "next/server";
import { authorizeAgent } from "@/lib/agent/auth";
import { carrierOverride } from "@/lib/agent/credentials";
import { discoverVanityNumbers } from "@/lib/agent/discover";
import { anyProviderConfigured } from "@/lib/agent/providers";
import { clientKey, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface DiscoverBody {
  areaCode?: string;
  pages?: number;
  limit?: number;
  minScore?: number;
}

/**
 * Scan a carrier's available inventory for an area code and return the numbers
 * that spell real words. This is the "find me a cool available number" tool —
 * the caller doesn't need to know any words up front.
 */
export async function POST(request: Request) {
  const auth = authorizeAgent(request);
  if (!auth.ok) return auth.response;

  const limited = rateLimit(`discover:${clientKey(request)}`, { limit: 6, windowMs: 60_000 });
  const headers = rateLimitHeaders(limited, 6);
  if (!limited.ok) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429, headers });
  }

  const body = (await request.json().catch(() => ({}))) as DiscoverBody;
  const areaCode = (body.areaCode ?? "").replace(/[^0-9]/g, "").slice(0, 3);
  if (areaCode.length !== 3) {
    return NextResponse.json({ error: "Provide a 3-digit areaCode." }, { status: 400, headers });
  }

  const override = carrierOverride(request);
  if (!anyProviderConfigured(override)) {
    return NextResponse.json(
      {
        areaCode,
        availabilityConfigured: false,
        scanned: 0,
        matches: 0,
        results: [],
        notes: ["No carrier is configured, so there's no inventory to scan."],
      },
      { status: 200, headers },
    );
  }

  const discovery = await discoverVanityNumbers({
    areaCode,
    pages: body.pages,
    limit: body.limit,
    minScore: body.minScore,
    override,
  });

  return NextResponse.json(
    {
      ...discovery,
      availabilityConfigured: true,
      notes: [
        "Scanned a sample of available inventory for this area code; results are provider-scoped and change over time.",
      ],
    },
    { headers },
  );
}

export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/agent/discover",
    description:
      "Scan available inventory for an area code and return the numbers that spell real words.",
    body: { areaCode: "702", pages: 3, limit: 20, minScore: 80 },
  });
}
