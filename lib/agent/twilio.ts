import type { AvailabilityResult } from "@/lib/availability";
import { normalizeNanp } from "@/lib/phone";

/** Injection seam for tests; defaults to the global fetch. */
export type FetchLike = typeof fetch;

export interface TwilioCredentials {
  /** Always the account SID — it appears in the request path. */
  accountSid: string;
  /** API Key SID (preferred) or the account SID, used as the Basic username. */
  username: string;
  /** API Key secret (preferred) or the auth token, used as the Basic password. */
  password: string;
}

/**
 * Prefer a scoped API Key pair; fall back to the account Auth Token. Both use
 * HTTP Basic auth with the Account SID in the request path.
 */
export function twilioCredentials(): TwilioCredentials | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  if (!accountSid) return null;

  const apiKey = process.env.TWILIO_API_KEY;
  const apiSecret = process.env.TWILIO_API_SECRET;
  if (apiKey && apiSecret) {
    return { accountSid, username: apiKey, password: apiSecret };
  }

  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (authToken) {
    return { accountSid, username: accountSid, password: authToken };
  }

  return null;
}

export function twilioConfigured(): boolean {
  return twilioCredentials() !== null || mockEnabled();
}

/** Deterministic mock mode for local demos/tests: TWILIO_MOCK=true. */
function mockEnabled(): boolean {
  return process.env.TWILIO_MOCK === "true";
}

const API_BASE = "https://api.twilio.com/2010-04-01/Accounts";

export interface ContainsResult {
  pattern: string;
  areaCode: string;
  available: boolean;
  numbers: string[];
  checkedAt: number;
}

interface TwilioNumber {
  phone_number?: string;
  locality?: string;
  region?: string;
}

async function requestAvailable(
  params: Record<string, string>,
  fetchImpl: FetchLike,
): Promise<{ ok: true; data: TwilioNumber[] } | { ok: false; status: number; detail: string }> {
  const credentials = twilioCredentials();
  if (!credentials) return { ok: false, status: 0, detail: "not-configured" };

  const url = new URL(
    `${API_BASE}/${credentials.accountSid}/AvailablePhoneNumbers/US/Local.json`,
  );
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  try {
    const response = await fetchImpl(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString("base64")}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      return { ok: false, status: response.status, detail: detail.slice(0, 180) };
    }

    const data = (await response.json()) as { available_phone_numbers?: TwilioNumber[] };
    return { ok: true, data: Array.isArray(data.available_phone_numbers) ? data.available_phone_numbers : [] };
  } catch {
    return { ok: false, status: 0, detail: "network-error" };
  }
}

/** Exact-number check (used by the UI card button). */
export async function checkTwilioExact(
  rawNumber: string,
  options: { fetchImpl?: FetchLike } = {},
): Promise<AvailabilityResult> {
  const number = normalizeNanp(rawNumber) ?? rawNumber;
  const fetchImpl = options.fetchImpl ?? fetch;

  if (mockEnabled()) {
    const available = number.endsWith("6") || number.endsWith("7");
    return {
      number,
      configured: true,
      available,
      provider: "twilio",
      method: "exact",
      message: available
        ? "Available to purchase from Twilio (mock)."
        : "Not in Twilio's available inventory (mock).",
      checkedAt: Date.now(),
    };
  }

  if (!twilioCredentials()) {
    return {
      number,
      configured: false,
      available: null,
      provider: "none",
      method: "exact",
      message:
        "Availability checks aren't configured. Set TWILIO_ACCOUNT_SID plus TWILIO_API_KEY/TWILIO_API_SECRET (or TWILIO_AUTH_TOKEN) to enable them.",
      checkedAt: Date.now(),
    };
  }

  const result = await requestAvailable({ PhoneNumber: number, PageSize: "1" }, fetchImpl);
  if (!result.ok) {
    return {
      number,
      configured: true,
      available: null,
      provider: "twilio",
      method: "exact",
      message:
        result.detail === "network-error"
          ? "Couldn't reach Twilio. Try again shortly."
          : `Twilio returned ${result.status}. ${result.detail}`,
      checkedAt: Date.now(),
    };
  }

  const match = result.data[0];
  return {
    number,
    configured: true,
    available: Boolean(match),
    provider: "twilio",
    method: "exact",
    message: match ? "Available to purchase from Twilio." : "Not in Twilio's available inventory.",
    locality: match?.locality,
    region: match?.region,
    checkedAt: Date.now(),
  };
}

/**
 * Word/pattern check. Twilio's `Contains` accepts letters A-Z (mapped to digits)
 * and `*` wildcards, so one call confirms every number that spells a word.
 */
export async function checkTwilioContains(
  areaCode: string,
  pattern: string,
  options: { fetchImpl?: FetchLike } = {},
): Promise<ContainsResult> {
  const normalized = pattern.toUpperCase().replace(/[^A-Z0-9*]/g, "");
  const checkedAt = Date.now();

  if (mockEnabled()) {
    const available = normalized.length % 2 === 1;
    return {
      pattern: normalized,
      areaCode,
      available,
      numbers: available ? [`+1${areaCode}000000`] : [],
      checkedAt,
    };
  }

  if (!twilioCredentials()) {
    return { pattern: normalized, areaCode, available: false, numbers: [], checkedAt };
  }

  const result = await requestAvailable(
    { Contains: normalized, AreaCode: areaCode, PageSize: "100" },
    options.fetchImpl ?? fetch,
  );
  if (!result.ok) {
    return { pattern: normalized, areaCode, available: false, numbers: [], checkedAt };
  }

  const numbers = result.data.map((entry) => entry.phone_number).filter((n): n is string => Boolean(n));
  return { pattern: normalized, areaCode, available: numbers.length > 0, numbers, checkedAt };
}

/** Batch-verify several words with bounded concurrency. */
export async function verifyWords(
  areaCode: string,
  patterns: string[],
  options: { fetchImpl?: FetchLike; concurrency?: number } = {},
): Promise<ContainsResult[]> {
  const unique = [...new Set(patterns.map((p) => p.toUpperCase()))];
  const concurrency = Math.max(1, Math.min(options.concurrency ?? 5, 10));
  const results: ContainsResult[] = [];

  for (let index = 0; index < unique.length; index += concurrency) {
    const slice = unique.slice(index, index + concurrency);
    const batch = await Promise.all(
      slice.map((pattern) => checkTwilioContains(areaCode, pattern, options)),
    );
    results.push(...batch);
  }

  return results;
}
