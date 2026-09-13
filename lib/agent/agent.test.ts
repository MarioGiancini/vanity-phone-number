import { describe, expect, it } from "vitest";
import { findCandidates } from "./find";
import { detectAreaCode, detectTheme, detectWords } from "./intent";

describe("agent intent", () => {
  it("detects a theme keyword", () => {
    expect(detectTheme("cool vanity number for a tech company")).toBe("tech");
    expect(detectTheme("a trendy new brand")).toBe("trendy");
  });

  it("detects an area code by city and by code", () => {
    expect(detectAreaCode("something in Las Vegas")).toBe("702");
    expect(detectAreaCode("looking for 415 numbers")).toBe("415");
  });

  it("detects quoted words", () => {
    expect(detectWords('find me "BIG" "CODE"')).toEqual(["BIG", "CODE"]);
  });
});

describe("findCandidates", () => {
  it("resolves a Las Vegas tech brief", () => {
    const { resolved, candidates } = findCandidates({
      prompt: "cool vanity number in Las Vegas for a tech business",
    });
    expect(resolved.areaCode).toBe("702");
    expect(resolved.theme).toBe("tech");
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0].vanity.startsWith("702-")).toBe(true);
  });

  it("honors explicit words", () => {
    const { candidates } = findCandidates({ areaCode: "702", words: ["BIG", "CODE"] });
    expect(candidates.some((candidate) => candidate.local === "BIGCODE")).toBe(true);
  });

  it("pads a short phrase with wildcard digits", () => {
    const { candidates } = findCandidates({ areaCode: "702", words: ["MKDIR"] });
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every((candidate) => candidate.local.startsWith("MKDIR"))).toBe(true);
    expect(candidates[0].local).toHaveLength(7);
  });
});
