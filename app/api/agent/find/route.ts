import { NextResponse } from "next/server";
import { authorizeAgent } from "@/lib/agent/auth";
import { findCandidates, type FindInput } from "@/lib/agent/find";
import { checkTwilioExact, twilioConfigured } from "@/lib/agent/twilio";
import type { AvailabilityResult } from "@/lib/availability";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface FindBody extends FindInput {
  checkAvailability?: boolean;
  onlyAvailable?: boolean;
  availabilityLimit?: number;
}

const AVAILABILITY_RE = /availab|purchas|for sale|to buy|buy it/i;

export async function POST(request: Request) {
  const auth = authorizeAgent(request);
  if (!auth.ok) return auth.response;

  const limited = rateLimit(`find:${clientKey(request)}`, { limit: 60, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  const body = (await request.json().catch(() => ({}))) as FindBody;
  const prompt = body.prompt ?? "";
  const wantsAvailable = body.onlyAvailable ?? AVAILABILITY_RE.test(prompt);
  // Cost-safe default: only hit Twilio when the request asks for availability.
  const shouldCheck = body.checkAvailability ?? wantsAvailable;

  const { resolved, candidates } = findCandidates(body);

  let results: (typeof candidates[number] & { availability: AvailabilityResult | null })[] =
    candidates.map((candidate) => ({ ...candidate, availability: null }));

  const notes: string[] = [];
  const configured = twilioConfigured();

  if (shouldCheck && configured && results.length > 0) {
    const count = Math.max(1, Math.min(body.availabilityLimit ?? 5, results.length));
    const checked = await Promise.all(
      results
        .slice(0, count)
        .map(async (candidate) => ({
          ...candidate,
          availability: await checkTwilioExact(candidate.dialable),
        })),
    );
    results = [...checked, ...results.slice(count)];
    notes.push(
      `Availability checked against Twilio's inventory for the top ${count} candidate(s) at request time. "Available" means Twilio can sell it; it may still be owned by another carrier.`,
    );
  } else if (shouldCheck && !configured) {
    notes.push(
      "Availability was requested but Twilio isn't configured on the server. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to enable it.",
    );
  }

  if (wantsAvailable) {
    const available = results.filter((candidate) => candidate.availability?.available === true);
    if (available.length > 0 || configured) results = available;
  }

  return NextResponse.json({
    resolved,
    availabilityConfigured: configured,
    checkedAvailability: shouldCheck && configured,
    count: results.length,
    notes,
    results,
  });
}

export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/agent/find",
    description:
      "Find ranked vanity phone numbers from a brief or explicit words, optionally verifying availability.",
    body: {
      prompt: "cool vanity number for a Las Vegas tech business that is available",
      areaCode: "702 (optional, overrides prompt)",
      theme: "built-in list id, e.g. tech | trendy | luxury | money | health (optional)",
      words: ["BIG", "CODE"],
      limit: 10,
      checkAvailability: false,
      onlyAvailable: false,
      availabilityLimit: 5,
    },
  });
}
