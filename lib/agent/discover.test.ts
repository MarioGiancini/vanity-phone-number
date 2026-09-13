import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { discoverVanityNumbers } from "./discover";

describe("discoverVanityNumbers", () => {
  beforeEach(() => {
    vi.stubEnv("TWILIO_ACCOUNT_SID", "AC123");
    vi.stubEnv("TWILIO_API_KEY", "SK123");
    vi.stubEnv("TWILIO_API_SECRET", "apisecret");
    vi.stubEnv("TWILIO_MOCK", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("finds available numbers that spell real words", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            available_phone_numbers: [
              { phone_number: "+17022442633", locality: "Las Vegas", region: "NV" },
              { phone_number: "+17020000001", locality: "Las Vegas", region: "NV" },
            ],
            next_page_uri: null,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await discoverVanityNumbers({ areaCode: "702", pages: 1, minScore: 80 });
    expect(result.scanned).toBe(2);
    expect(result.results.map((entry) => entry.vanity)).toContain("702-BIG-CODE");
  });

  it("returns nothing when Twilio isn't configured", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("TWILIO_MOCK", "");
    const result = await discoverVanityNumbers({ areaCode: "702", pages: 1 });
    expect(result.scanned).toBe(0);
    expect(result.results).toEqual([]);
  });
});
