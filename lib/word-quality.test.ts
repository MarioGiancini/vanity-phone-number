import { describe, expect, it } from "vitest";
import { isQualityReading, isQualityWord } from "./word-quality";

describe("word quality", () => {
  const curated = new Set(["CODE", "DEV", "MKDIR"]);

  it("accepts curated words regardless of rarity", () => {
    expect(isQualityWord("MKDIR", curated)).toBe(true);
  });

  it("accepts common dictionary words", () => {
    expect(isQualityWord("TIME", curated)).toBe(true);
  });

  it("rejects short and rare words", () => {
    expect(isQualityWord("AM", curated)).toBe(false);
    expect(isQualityWord("EDT", curated)).toBe(false);
  });

  it("requires every word in a reading to qualify", () => {
    expect(isQualityReading(["DEV", "CODE"], curated)).toBe(true);
    expect(isQualityReading(["DEV", "EDT"], curated)).toBe(false);
  });
});
