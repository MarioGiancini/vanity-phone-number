import { NextResponse } from "next/server";
import { DICTIONARY } from "@/data/dictionary";
import { BUILT_IN_LISTS } from "@/data/word-lists";
import { authorizeAgent } from "@/lib/agent/auth";
import { clientKey, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { buildDigitIndex, decodeLocal, normalize, type DigitIndex } from "@/lib/vanity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let cachedIndex: DigitIndex | undefined;

function getIndex(): DigitIndex {
  if (!cachedIndex) {
    const words = new Set<string>(DICTIONARY);
    for (const list of BUILT_IN_LISTS) {
      for (const word of list.words) words.add(word.toUpperCase());
    }
    cachedIndex = buildDigitIndex(words);
  }
  return cachedIndex;
}

interface DecodeBody {
  number?: string;
  areaCode?: string;
  minPart?: number;
  maxParts?: number;
  limit?: number;
}

/** Decode a phone number into every dictionary reading that fits its digits. */
export async function POST(request: Request) {
  const auth = authorizeAgent(request);
  if (!auth.ok) return auth.response;

  const limited = rateLimit(`decode:${clientKey(request)}`, { limit: 120, windowMs: 60_000 });
  const headers = rateLimitHeaders(limited, 120);
  if (!limited.ok) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429, headers });
  }

  const body = (await request.json().catch(() => ({}))) as DecodeBody;
  const digits = normalize(String(body.number ?? ""));
  const local = digits.length > 7 ? digits.slice(-7) : digits;
  const areaCode =
    normalize(String(body.areaCode ?? "")) || (digits.length >= 10 ? digits.slice(0, 3) : "702");

  if (!/^[0-9]{7}$/.test(local)) {
    return NextResponse.json(
      { error: "Provide a 7-digit local number (e.g. 7764726) or a 10-digit number." },
      { status: 400, headers },
    );
  }

  const readings = decodeLocal(local, getIndex(), {
    areaCode,
    minPart: body.minPart ?? 2,
    maxParts: body.maxParts ?? 3,
    limit: body.limit ?? 50,
  });

  return NextResponse.json({ areaCode, local, count: readings.length, readings }, { headers });
}

export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/agent/decode",
    body: { number: "702-776-4726", minPart: 2, maxParts: 3, limit: 50 },
  });
}
