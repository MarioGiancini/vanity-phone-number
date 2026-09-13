import { describe, expect, it } from "vitest";
import { buildVanity, emptySlots } from "./build";
import { slotsFromText } from "./encode";
import { localGroups } from "./format";

describe("buildVanity", () => {
  it("derives vanity and numeric forms for a full word", () => {
    const built = buildVanity("702", slotsFromText("PROGRAM", 7), [7]);
    expect(built.complete).toBe(true);
    expect(built.formattedVanity).toBe("702-PROGRAM");
    expect(built.formattedNumeric).toBe("702-776-4726");
    expect(built.dialable).toBe("7027764726");
    expect(built.warnings).toEqual([]);
  });

  it("defaults a full 7-digit local to the standard 3+4 split", () => {
    const built = buildVanity("702", slotsFromText("PROGRAM", 7));
    expect(built.formattedVanity).toBe("702-PRO-GRAM");
  });

  it("groups a two-word combo by the provided boundaries", () => {
    const built = buildVanity("702", slotsFromText("BIGCODE", 7), [3, 4]);
    expect(built.formattedVanity).toBe("702-BIG-CODE");
    expect(built.formattedNumeric).toBe("702-244-2633");
  });

  it("reports incomplete numbers", () => {
    const built = buildVanity("702", slotsFromText("BIG", 7));
    expect(built.complete).toBe(false);
    expect(built.localDigits).toBe("244");
    expect(built.formattedNumeric).toBe("");
    expect(localGroups(built.local, [3, 4])).toEqual(["BIG", "\u2022\u2022\u2022\u2022"]);
  });

  it("warns about an exchange that starts with 0 or 1", () => {
    const built = buildVanity("702", ["0", "2", "3", "4", "5", "6", "7"]);
    expect(built.warnings).toContain("Exchange code can't start with 0 or 1.");
  });

  it("starts empty", () => {
    expect(emptySlots()).toHaveLength(7);
    expect(emptySlots().every((slot) => slot === "")).toBe(true);
  });
});
