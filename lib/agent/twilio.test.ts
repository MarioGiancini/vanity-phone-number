import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkTwilioContains, checkTwilioExact, verifyWords } from "./twilio";

function mockFetch(payload: unknown, status = 200): typeof fetch {
  return vi.fn(
    async () =>
      new Response(JSON.stringify(payload), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
  ) as unknown as typeof fetch;
}

describe("twilio availability", () => {
  beforeEach(() => {
    vi.stubEnv("TWILIO_ACCOUNT_SID", "AC123");
    vi.stubEnv("TWILIO_AUTH_TOKEN", "secret");
    vi.stubEnv("TWILIO_MOCK", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("exact: reports available when Twilio returns a match", async () => {
    const fetchImpl = mockFetch({
      available_phone_numbers: [{ phone_number: "+17027764726", locality: "Las Vegas", region: "NV" }],
    });
    const result = await checkTwilioExact("702-776-4726", { fetchImpl });
    expect(result.available).toBe(true);
    expect(result.method).toBe("exact");
    expect(result.locality).toBe("Las Vegas");
  });

  it("exact: reports unavailable when Twilio returns an empty list", async () => {
    const result = await checkTwilioExact("7027764726", {
      fetchImpl: mockFetch({ available_phone_numbers: [] }),
    });
    expect(result.available).toBe(false);
  });

  it("contains: sends the word as a pattern and maps results", async () => {
    const fetchImpl = mockFetch({ available_phone_numbers: [{ phone_number: "+17022442633" }] });
    const result = await checkTwilioContains("702", "BIGCODE", { fetchImpl });
    expect(result.available).toBe(true);
    expect(result.numbers).toEqual(["+17022442633"]);
    const requested = String((fetchImpl as unknown as { mock: { calls: unknown[][] } }).mock.calls[0][0]);
    expect(requested).toContain("Contains=BIGCODE");
    expect(requested).toContain("AreaCode=702");
  });

  it("verifyWords: de-duplicates patterns and preserves order", async () => {
    const results = await verifyWords("702", ["PROGRAM", "program", "BIGCODE"], {
      fetchImpl: mockFetch({ available_phone_numbers: [] }),
    });
    expect(results.map((entry) => entry.pattern)).toEqual(["PROGRAM", "BIGCODE"]);
  });

  it("makes zero network calls when unconfigured", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("TWILIO_ACCOUNT_SID", "");
    vi.stubEnv("TWILIO_AUTH_TOKEN", "");
    const fetchImpl = vi.fn();
    const result = await checkTwilioExact("7027764726", {
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(result.configured).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("mock mode returns deterministic results without credentials", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("TWILIO_MOCK", "true");
    const result = await checkTwilioContains("702", "ABC", {});
    expect(result.available).toBe(true);
  });
});
