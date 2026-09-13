import { describe, expect, it } from "vitest";
import { makeSavedNumber } from "./saved";

describe("makeSavedNumber", () => {
  it("stores display words and a numeric id", () => {
    const saved = makeSavedNumber({ areaCode: "702", local: "BIGCODE", words: ["BIG", "CODE"] });
    expect(saved.id).toBe("7022442633");
    expect(saved.vanity).toBe("702-BIG-CODE");
    expect(saved.numeric).toBe("702-244-2633");
    expect(saved.words).toEqual(["BIG", "CODE"]);
  });
});
