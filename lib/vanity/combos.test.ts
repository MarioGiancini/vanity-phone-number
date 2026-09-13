import { describe, expect, it } from "vitest";
import { generateCombos, type Slot } from "./combos";

const exchange: Slot = { kind: "words", length: 3, words: ["BIG", "ACE", "BOY"] };
const line: Slot = { kind: "words", length: 4, words: ["CODE", "LIVE"] };

describe("generateCombos", () => {
  it("generates the cartesian product as vanity numbers", () => {
    const results = generateCombos({ areaCode: "702", slots: [exchange, line] });
    expect(results).toHaveLength(6);
    const big = results.find((result) => result.local === "BIGCODE");
    expect(big?.vanity).toBe("702-BIG-CODE");
    expect(big?.numeric).toBe("702-244-2633");
    expect(big?.words).toEqual(["BIG", "CODE"]);
    expect(big?.coverage).toBe(1);
  });

  it("respects a reversed slot order", () => {
    const results = generateCombos({ areaCode: "702", slots: [line, exchange] });
    expect(results.some((result) => result.vanity === "702-CODE-BIG")).toBe(true);
    expect(results.every((result) => result.words.length === 2)).toBe(true);
  });

  it("fills wildcard digits and rejects invalid exchanges", () => {
    const slots: Slot[] = [{ kind: "digits", length: 2 }, { kind: "words", length: 5, words: ["MKDIR"] }];
    const results = generateCombos({ areaCode: "702", slots });
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((result) => result.vanity === "702-11-MKDIR")).toBe(false);
    expect(results.every((result) => /^[2-9]/.test(result.local))).toBe(true);
  });

  it("returns nothing when the slots do not fill a local number", () => {
    expect(generateCombos({ areaCode: "702", slots: [{ kind: "words", length: 4, words: ["CODE"] }] })).toEqual([]);
  });

  it("caps output", () => {
    const words = Array.from(
      { length: 40 },
      (_, i) => `${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + Math.floor(i / 26))}A`,
    );
    const many: Slot[] = [
      { kind: "words", length: 3, words },
      { kind: "words", length: 4, words: ["CODE"] },
    ];
    const results = generateCombos({ areaCode: "702", slots: many, limit: 5 });
    expect(results.length).toBeLessThanOrEqual(5);
  });
});
