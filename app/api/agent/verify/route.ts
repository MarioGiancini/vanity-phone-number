import { NextResponse } from "next/server";
import { authorizeAgent } from "@/lib/agent/auth";
import { carrierOverride } from "@/lib/agent/credentials";
import { twilioConfigured, verifyWords } from "@/lib/agent/twilio";
import { clientKey, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface VerifyBody {
  areaCode?: string;
  words?: string[];
}

/**
 * Batch-verify words against Twilio's inventory using the `Contains` pattern:
 * one call per word confirms every number that spells it.
 */
export async function POST(request: Request) {
  const auth = authorizeAgent(request);
  if (!auth.ok) return auth.response;

  const limited = rateLimit(`verify:${clientKey(request)}`, { limit: 30, windowMs: 60_000 });
  const headers = rateLimitHeaders(limited, 30);
  if (!limited.ok) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429, headers });
  }

  const body = (await request.json().catch(() => ({}))) as VerifyBody;
  const areaCode = (body.areaCode ?? "").replace(/[^0-9]/g, "").slice(0, 3);
  const words = (body.words ?? []).map((word) => word.toUpperCase()).filter(Boolean);

  if (areaCode.length !== 3 || words.length === 0) {
    return NextResponse.json(
      { error: "Provide a 3-digit areaCode and a non-empty words array." },
      { status: 400, headers },
    );
  }

  if (words.length > 20) {
    return NextResponse.json(
      { error: "Verify at most 20 words per request." },
      { status: 400, headers },
    );
  }

  const override = carrierOverride(request);
  const configured = twilioConfigured(override?.twilio);
  const results = await verifyWords(areaCode, words, { override: override?.twilio });

  return NextResponse.json(
    {
      areaCode,
      provider: "twilio",
      method: "contains",
      availabilityConfigured: configured,
      notes: configured
        ? ["Twilio inventory at request time; may change without notice."]
        : ["Twilio isn't configured, so every result is reported unavailable."],
      results,
    },
    { headers },
  );
}

export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/agent/verify",
    body: { areaCode: "702", words: ["BIGCODE", "PROGRAM", "ICELUCK"] },
  });
}
