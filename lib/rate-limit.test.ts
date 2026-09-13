import { describe, expect, it } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  it("allows up to the limit, then blocks with a retry hint", () => {
    const options = { limit: 3, windowMs: 60_000 };
    expect(rateLimit("burst", options, 1_000_000).ok).toBe(true);
    expect(rateLimit("burst", options, 1_000_000).ok).toBe(true);
    expect(rateLimit("burst", options, 1_000_000).ok).toBe(true);
    const blocked = rateLimit("burst", options, 1_000_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("refills over time", () => {
    const options = { limit: 1, windowMs: 1000 };
    expect(rateLimit("refill", options, 0).ok).toBe(true);
    expect(rateLimit("refill", options, 100).ok).toBe(false);
    expect(rateLimit("refill", options, 1100).ok).toBe(true);
  });

  it("isolates separate keys", () => {
    const options = { limit: 1, windowMs: 1000 };
    expect(rateLimit("key-a", options, 0).ok).toBe(true);
    expect(rateLimit("key-b", options, 0).ok).toBe(true);
    expect(rateLimit("key-a", options, 0).ok).toBe(false);
  });
});
