import type { AvailabilityResult } from "@/lib/availability";
import { normalizeNanp } from "@/lib/phone";
import type { TelnyxOverride } from "./credentials";

/** Injection seam for tests; defaults to the global fetch. */
export type FetchLike = typeof fetch;

const API_BASE = "https://api.telnyx.com/v2";

export function telnyxApiKey(override?: TelnyxOverride): string | undefined {
  return override?.apiKey || process.env.TELNYX_API_KEY;
}

export function telnyxConfigured(override?: TelnyxOverride): boolean {
  if (telnyxApiKey(override)) return true;
  return !override && telnyxMock();
}

function telnyxMock(): boolean {
  return process.env.TELNYX_MOCK === "true";
}

interface TelnyxNumber {
  phone_number?: string;
  region_information?: { region_name?: string; region_type?: string }[];
}

function regionOf(entry: TelnyxNumber): string | undefined {
  return (
    entry.region_information?.find((info) => info.region_type === "state")?.region_name ??
    entry.region_information?.[0]?.region_name
  );
}

function digits(value: string): string {
  const d = value.replace(/[^0-9]/g, "");
  return d.length === 11 && d.startsWith("1") ? d.slice(1) : d;
}

export interface AvailableNumber {
  phoneNumber: string;
  locality?: string;
  region?: string;
}

interface TelnyxPage {
  data?: TelnyxNumber[];
  links?: { next?: string | null };
}

export interface TelnyxOptions {
  fetchImpl?: FetchLike;
  override?: TelnyxOverride;
}

async function get(url: string, key: string, fetchImpl: FetchLike): Promise<TelnyxPage | null> {
  try {
    const response = await fetchImpl(url, {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as TelnyxPage;
  } catch {
    return null;
  }
}

/** Page through Telnyx's available inventory for an area code (SMS-capable). */
export async function listAvailableNumbers(
  areaCode: string,
  options: TelnyxOptions & { pages?: number } = {},
): Promise<AvailableNumber[]> {
  const key = telnyxApiKey(options.override);

  if (!options.override && telnyxMock()) {
    return [
      { phoneNumber: `+1${areaCode}2442633`, region: "NV" },
      { phoneNumber: `+1${areaCode}7764726`, region: "NV" },
    ];
  }
  if (!key) return [];

  const pages = Math.max(1, Math.min(options.pages ?? 3, 10));
  const fetchImpl = options.fetchImpl ?? fetch;
  const area = areaCode.replace(/[^0-9]/g, "").slice(0, 3);
  const results: AvailableNumber[] = [];
  let url: string | null =
    `${API_BASE}/available_phone_numbers?filter[national_destination_code]=${area}` +
    `&filter[features][]=sms&page[size]=250`;

  for (let page = 0; page < pages && url; page += 1) {
    const data = await get(url, key, fetchImpl);
    if (!data) break;
    for (const entry of data.data ?? []) {
      if (entry.phone_number) {
        results.push({ phoneNumber: entry.phone_number, region: regionOf(entry) });
      }
    }
    url = data.links?.next ?? null;
  }

  return results;
}

/** Exact availability on Telnyx. */
export async function checkTelnyxExact(
  rawNumber: string,
  options: TelnyxOptions = {},
): Promise<AvailabilityResult> {
  const number = normalizeNanp(rawNumber) ?? rawNumber;

  if (!options.override && telnyxMock()) {
    return {
      number,
      configured: true,
      available: number.endsWith("6") || number.endsWith("7"),
      provider: "telnyx",
      method: "exact",
      message: "Available on Telnyx (mock).",
      checkedAt: Date.now(),
    };
  }

  const key = telnyxApiKey(options.override);
  if (!key) {
    return {
      number,
      configured: false,
      available: null,
      provider: "none",
      method: "exact",
      message: "Telnyx isn't configured. Add a Telnyx API key or set TELNYX_API_KEY.",
      checkedAt: Date.now(),
    };
  }

  const url =
    `${API_BASE}/available_phone_numbers?filter[national_destination_code]=${digits(number).slice(0, 3)}` +
    `&filter[phone_number][contains]=${digits(number).slice(3)}&filter[features][]=sms&page[size]=250`;

  const data = await get(url, key, options.fetchImpl ?? fetch);
  if (!data) {
    return {
      number,
      configured: true,
      available: null,
      provider: "telnyx",
      method: "exact",
      message: "Couldn't reach Telnyx.",
      checkedAt: Date.now(),
    };
  }

  const match = (data.data ?? []).some(
    (entry) => entry.phone_number && digits(entry.phone_number) === digits(number),
  );
  return {
    number,
    configured: true,
    available: match,
    provider: "telnyx",
    method: "exact",
    message: match ? "Available on Telnyx." : "Not in Telnyx's available inventory.",
    checkedAt: Date.now(),
  };
}
