import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkTelnyxExact, listAvailableNumbers } from "./telnyx";

function page(data: unknown[]): Response {
  return new Response(JSON.stringify({ data, links: { next: null } }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("telnyx availability", () => {
  beforeEach(() => {
    vi.stubEnv("TELNYX_API_KEY", "KEY123");
    vi.stubEnv("TELNYX_MOCK", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("lists available numbers for an area code", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        page([
          {
            phone_number: "+17022442633",
            region_information: [{ region_type: "state", region_name: "NV" }],
          },
        ]),
      ),
    );
    const results = await listAvailableNumbers("702", { pages: 1 });
    expect(results).toEqual([{ phoneNumber: "+17022442633", region: "NV" }]);
  });

  it("confirms an exact number present in the results", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => page([{ phone_number: "+17022442633" }])));
    const result = await checkTelnyxExact("702-244-2633");
    expect(result.available).toBe(true);
    expect(result.provider).toBe("telnyx");
  });

  it("rejects a non-matching result", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => page([{ phone_number: "+17028420466" }])));
    const result = await checkTelnyxExact("7027764726");
    expect(result.available).toBe(false);
  });

  it("reports unconfigured without a key", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("TELNYX_MOCK", "");
    const result = await checkTelnyxExact("7027764726");
    expect(result.configured).toBe(false);
  });
});
