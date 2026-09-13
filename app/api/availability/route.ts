import { NextResponse } from "next/server";
import { carrierOverride } from "@/lib/agent/credentials";
import { anyProviderConfigured, checkExact, providerStatuses } from "@/lib/agent/providers";
import { normalizeNanp } from "@/lib/phone";
import { clientKey, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Reports whether availability checking is configured (no credentials leak). */
export async function GET() {
  return NextResponse.json({
    configured: anyProviderConfigured(),
    providers: providerStatuses(),
  });
}

/** Checks whether a number is in a configured carrier's purchasable inventory. */
export async function POST(request: Request) {
  const override = carrierOverride(request);
  // Aggressive throttling on the server's own keys; BYO-keys callers get more.
  const limit = override ? 60 : 10;
  const limited = rateLimit(`availability:${override ? "byo" : "server"}:${clientKey(request)}`, {
    limit,
    windowMs: 60_000,
  });
  const headers = rateLimitHeaders(limited, limit);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again shortly, or add your own carrier keys." },
      { status: 429, headers },
    );
  }

  const body = (await request.json().catch(() => ({}))) as { number?: string };
  const number = normalizeNanp(body.number ?? "");

  if (!number) {
    return NextResponse.json(
      {
        number: body.number ?? "",
        configured: anyProviderConfigured(override),
        available: null,
        provider: "none",
        method: "exact",
        message: "Enter a valid 10-digit US number.",
        checkedAt: Date.now(),
      },
      { status: 400, headers },
    );
  }

  const result = await checkExact(number, { override });
  return NextResponse.json(result, {
    status: result.available === null && result.configured ? 502 : 200,
    headers,
  });
}
