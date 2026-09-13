import { describe, expect, it } from "vitest";
import { isNanp, normalizeNanp } from "./phone";

describe("normalizeNanp", () => {
  it("normalizes 10- and 11-digit numbers", () => {
    expect(normalizeNanp("702-776-4726")).toBe("+17027764726");
    expect(normalizeNanp("1 (702) 776-4726")).toBe("+17027764726");
  });

  it("rejects invalid input", () => {
    expect(normalizeNanp("7764726")).toBeNull();
    expect(isNanp("abc")).toBe(false);
  });
});
