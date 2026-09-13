import { describe, expect, it } from "vitest";
import { buildDigitIndex, decodeLocal, wordsForDigits } from "./decode";

describe("decodeLocal", () => {
  it("recovers a single full word", () => {
    const index = buildDigitIndex(["PROGRAM"]);
    const matches = decodeLocal("7764726", index, { areaCode: "702" });
    expect(matches.map((match) => match.words.join(" "))).toContain("PROGRAM");
    expect(matches[0].vanity).toBe("702-PROGRAM");
  });

  it("recovers a two-word combo", () => {
    const index = buildDigitIndex(["BIG", "CODE", "LIVE", "ACE"]);
    const matches = decodeLocal("2442633", index, { areaCode: "702" });
    expect(matches.some((match) => match.words.join(" ") === "BIG CODE")).toBe(true);
  });

  it("finds dictionary words for a segment", () => {
    const index = buildDigitIndex(["GREP", "CODE"]);
    expect(wordsForDigits("4737", index)).toEqual(["GREP"]);
    expect(wordsForDigits("0000", index)).toEqual([]);
  });

  it("ignores numbers that are not 7 digits", () => {
    const index = buildDigitIndex(["GREP"]);
    expect(decodeLocal("473", index, { areaCode: "702" })).toEqual([]);
    expect(decodeLocal("47371234", index, { areaCode: "702" })).toEqual([]);
  });
});
