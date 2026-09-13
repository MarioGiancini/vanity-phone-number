export interface AvailabilityResult {
  /** E.164 number that was checked, e.g. "+17023382633". */
  number: string;
  /** Whether Twilio credentials are present on the server. */
  configured: boolean;
  /** true = purchasable, false = not in inventory, null = unknown/error. */
  available: boolean | null;
  provider: "twilio" | "none";
  /** How the check was performed. */
  method?: "exact" | "contains";
  message: string;
  locality?: string;
  region?: string;
  checkedAt: number;
}

const cache = new Map<string, AvailabilityResult>();

/**
 * Ask the server whether a number is available. The server route reads
 * TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN and never exposes them to the client.
 * Results are cached for the session to avoid repeat lookups.
 */
export async function checkAvailability(rawNumber: string): Promise<AvailabilityResult> {
  const key = (rawNumber ?? "").replace(/[^0-9]/g, "");
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    const response = await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: rawNumber }),
    });
    const data = (await response.json()) as AvailabilityResult;
    if (data.configured && data.available !== null) cache.set(key, data);
    return data;
  } catch {
    return {
      number: rawNumber,
      configured: false,
      available: null,
      provider: "none",
      message: "Couldn't reach the availability service.",
      checkedAt: Date.now(),
    };
  }
}
