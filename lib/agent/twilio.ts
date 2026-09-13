import type { AvailabilityResult } from "@/lib/availability";
import { normalizeNanp } from "@/lib/phone";
import { lettersToDigits } from "@/lib/vanity/encode";

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

/** Does an E.164 number actually spell/contain the given pattern? */
function matchesPattern(e164: string, pattern: string): boolean {
  const expected = lettersToDigits(pattern.replace(/\*/g, ""));
  if (!expected) return true;
  return e164.replace(/[^0-9]/g, "").includes(expected);
}

function digitsOf(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

/** NANP digits without the country code, e.g. "+17027764726" -> "7027764726". */
function nanpDigits(value: string): string {
  const digits = digitsOf(value);
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
}

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

export interface AvailableNumber {
  phoneNumber: string;
  locality?: string;
  region?: string;
}

interface TwilioPage {
  available_phone_numbers?: TwilioNumber[];
  next_page_uri?: string | null;
}

/**
 * Page through Twilio's available inventory for an area code. PageSize maxes at
 * 1000, so this walks `next_page_uri` to sample a few thousand numbers.
 */
export async function listAvailableNumbers(
  areaCode: string,
  options: { pages?: number; fetchImpl?: FetchLike } = {},
): Promise<AvailableNumber[]> {
  const credentials = twilioCredentials();
  if (!credentials) return [];
  if (mockEnabled()) {
    return [
      { phoneNumber: `+1${areaCode}2442633`, locality: "Las Vegas", region: "NV" },
      { phoneNumber: `+1${areaCode}7764726`, locality: "Las Vegas", region: "NV" },
    ];
  }

  const pages = Math.max(1, Math.min(options.pages ?? 3, 10));
  const fetchImpl = options.fetchImpl ?? fetch;
  const headers = {
    Authorization: `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString("base64")}`,
  };

  const results: AvailableNumber[] = [];
  let url: string | null =
    `${API_BASE}/${credentials.accountSid}/AvailablePhoneNumbers/US/Local.json` +
    `?AreaCode=${areaCode.replace(/[^0-9]/g, "").slice(0, 3)}&PageSize=1000`;

  for (let page = 0; page < pages && url; page += 1) {
    try {
      const response = await fetchImpl(url, { headers, cache: "no-store" });
      if (!response.ok) break;
      const data = (await response.json()) as TwilioPage;
      for (const entry of data.available_phone_numbers ?? []) {
        if (entry.phone_number) {
          results.push({
            phoneNumber: entry.phone_number,
            locality: entry.locality,
            region: entry.region,
          });
        }
      }
      url = data.next_page_uri ? `https://api.twilio.com${data.next_page_uri}` : null;
    } catch {
      break;
    }
  }

  return results;
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

  // Twilio ignores the `PhoneNumber` filter, so scope by area code + a Contains
  // pattern on the local digits, then confirm the exact number is in the result.
  const digits = nanpDigits(number);
  const areaCode = digits.slice(0, 3);
  const local = digits.slice(3);

  const result = await requestAvailable(
    { AreaCode: areaCode, Contains: local, PageSize: "20" },
    fetchImpl,
  );
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

  const match = result.data.find((entry) => entry.phone_number && nanpDigits(entry.phone_number) === digits);
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

  const numbers = result.data
    .map((entry) => entry.phone_number)
    .filter((value): value is string => Boolean(value))
    .filter((value) => matchesPattern(value, normalized));
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
