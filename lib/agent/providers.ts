import type { AvailabilityResult } from "@/lib/availability";
import * as telnyx from "./telnyx";
import * as twilio from "./twilio";

/** A number returned by an inventory scan, tagged with its provider. */
export interface ProviderNumber {
  phoneNumber: string;
  locality?: string;
  region?: string;
  provider: "twilio" | "telnyx";
}

export interface ProviderStatus {
  id: "twilio" | "telnyx";
  label: string;
  configured: boolean;
}

export function providerStatuses(): ProviderStatus[] {
  return [
    { id: "twilio", label: "Twilio", configured: twilio.twilioConfigured() },
    { id: "telnyx", label: "Telnyx", configured: telnyx.telnyxConfigured() },
  ];
}

export function anyProviderConfigured(): boolean {
  return providerStatuses().some((provider) => provider.configured);
}

interface ListOptions {
  pages?: number;
  fetchImpl?: typeof fetch;
}

/** Aggregate available inventory across every configured provider. */
export async function listAvailableNumbers(
  areaCode: string,
  options: ListOptions = {},
): Promise<ProviderNumber[]> {
  const results: ProviderNumber[] = [];

  if (twilio.twilioConfigured()) {
    const numbers = await twilio.listAvailableNumbers(areaCode, options);
    results.push(...numbers.map((entry) => ({ ...entry, provider: "twilio" as const })));
  }
  if (telnyx.telnyxConfigured()) {
    const numbers = await telnyx.listAvailableNumbers(areaCode, options);
    results.push(...numbers.map((entry) => ({ ...entry, provider: "telnyx" as const })));
  }

  return results;
}

/**
 * Check a single number across providers. Returns the first "available" hit;
 * otherwise the most informative non-null result, or the first attempt.
 */
export async function checkExact(
  number: string,
  options: { fetchImpl?: typeof fetch } = {},
): Promise<AvailabilityResult> {
  const attempts: AvailabilityResult[] = [];

  if (twilio.twilioConfigured()) attempts.push(await twilio.checkTwilioExact(number, options));
  if (telnyx.telnyxConfigured()) attempts.push(await telnyx.checkTelnyxExact(number, options));

  if (attempts.length === 0) {
    return {
      number,
      configured: false,
      available: null,
      provider: "none",
      method: "exact",
      message: "No carrier is configured. Set Twilio or Telnyx credentials to enable checks.",
      checkedAt: Date.now(),
    };
  }

  return (
    attempts.find((attempt) => attempt.available === true) ??
    attempts.find((attempt) => attempt.available === false) ??
    attempts[0]
  );
}

/** Word/pattern verification is Twilio-only (its `Contains` accepts letters). */
export async function verifyWords(
  areaCode: string,
  patterns: string[],
  options: { fetchImpl?: typeof fetch; concurrency?: number } = {},
): Promise<twilio.ContainsResult[]> {
  return twilio.verifyWords(areaCode, patterns, options);
}
