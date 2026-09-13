import { NextResponse } from "next/server";
import { checkTwilioExact, twilioConfigured } from "@/lib/agent/twilio";
import { normalizeNanp } from "@/lib/phone";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Reports whether availability checking is configured (no credentials leak). */
export async function GET() {
  return NextResponse.json({ configured: twilioConfigured(), provider: "twilio" });
}

/** Checks whether a number is in Twilio's purchasable inventory. */
export async function POST(request: Request) {
  const limited = rateLimit(`availability:${clientKey(request)}`, { limit: 20, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  const body = (await request.json().catch(() => ({}))) as { number?: string };
  const number = normalizeNanp(body.number ?? "");

  if (!number) {
    return NextResponse.json(
      {
        number: body.number ?? "",
        configured: twilioConfigured(),
        available: null,
        provider: "none",
        method: "exact",
        message: "Enter a valid 10-digit US number.",
        checkedAt: Date.now(),
      },
      { status: 400 },
    );
  }

  const result = await checkTwilioExact(number);
  return NextResponse.json(result, {
    status: result.available === null && result.configured ? 502 : 200,
  });
}
