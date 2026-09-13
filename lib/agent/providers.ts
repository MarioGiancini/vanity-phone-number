import type { AvailabilityResult } from "@/lib/availability";
import type { CarrierOverride } from "./credentials";
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

export interface ProviderOptions {
  fetchImpl?: typeof fetch;
  /** Bring-your-own-keys, read from request headers. */
  override?: CarrierOverride;
}

export function providerStatuses(override?: CarrierOverride): ProviderStatus[] {
  return [
    { id: "twilio", label: "Twilio", configured: twilio.twilioConfigured(override?.twilio) },
    { id: "telnyx", label: "Telnyx", configured: telnyx.telnyxConfigured(override?.telnyx) },
  ];
}

export function anyProviderConfigured(override?: CarrierOverride): boolean {
  return providerStatuses(override).some((provider) => provider.configured);
}

/** Aggregate available inventory across every configured provider. */
export async function listAvailableNumbers(
  areaCode: string,
  options: ProviderOptions & { pages?: number } = {},
): Promise<ProviderNumber[]> {
  const results: ProviderNumber[] = [];

  if (twilio.twilioConfigured(options.override?.twilio)) {
    const numbers = await twilio.listAvailableNumbers(areaCode, {
      pages: options.pages,
      fetchImpl: options.fetchImpl,
      override: options.override?.twilio,
    });
    results.push(...numbers.map((entry) => ({ ...entry, provider: "twilio" as const })));
  }
  if (telnyx.telnyxConfigured(options.override?.telnyx)) {
    const numbers = await telnyx.listAvailableNumbers(areaCode, {
      pages: options.pages,
      fetchImpl: options.fetchImpl,
      override: options.override?.telnyx,
    });
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
  options: ProviderOptions = {},
): Promise<AvailabilityResult> {
  const attempts: AvailabilityResult[] = [];

  if (twilio.twilioConfigured(options.override?.twilio)) {
    attempts.push(
      await twilio.checkTwilioExact(number, { fetchImpl: options.fetchImpl, override: options.override?.twilio }),
    );
  }
  if (telnyx.telnyxConfigured(options.override?.telnyx)) {
    attempts.push(
      await telnyx.checkTelnyxExact(number, { fetchImpl: options.fetchImpl, override: options.override?.telnyx }),
    );
  }

  if (attempts.length === 0) {
    return {
      number,
      configured: false,
      available: null,
      provider: "none",
      method: "exact",
      message:
        "No carrier is configured. Add your own keys in Carrier keys (bottom right), or set them on the server.",
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
  options: ProviderOptions & { concurrency?: number } = {},
): Promise<twilio.ContainsResult[]> {
  if (!twilio.twilioConfigured(options.override?.twilio)) {
    const checkedAt = Date.now();
    return patterns.map((pattern) => ({
      pattern: pattern.toUpperCase(),
      areaCode,
      available: false,
      numbers: [],
      checkedAt,
    }));
  }
  return twilio.verifyWords(areaCode, patterns, {
    fetchImpl: options.fetchImpl,
    concurrency: options.concurrency,
    override: options.override?.twilio,
  });
}
