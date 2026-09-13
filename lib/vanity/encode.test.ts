import { describe, expect, it } from "vitest";
import { lettersToDigits, slotsFromText, tokenLengths } from "./encode";
import { formatNumeric } from "./format";
import { charToDigit } from "./encode";

describe("keypad encoding", () => {
  it("maps letters to their dial digits", () => {
    expect(lettersToDigits("PROGRAM")).toBe("7764726");
    expect(lettersToDigits("BIG CODE")).toBe("2442633");
    expect(lettersToDigits("mkdir")).toBe("65347");
    expect(lettersToDigits("702")).toBe("702");
  });

  it("maps each letter correctly", () => {
    expect(charToDigit("P")).toBe("7");
    expect(charToDigit("R")).toBe("7");
    expect(charToDigit("S")).toBe("7");
    expect(charToDigit("Z")).toBe("9");
    expect(charToDigit("2")).toBe("2");
    expect(charToDigit("")).toBe("");
  });

  it("keeps digits and drops separators", () => {
    expect(formatNumeric("7027764726")).toBe("702-776-4726");
    expect(slotsFromText("BIG-CODE", 7)).toEqual(["B", "I", "G", "C", "O", "D", "E"]);
    expect(tokenLengths("BIG CODE")).toEqual([3, 4]);
    expect(tokenLengths("PROGRAM")).toEqual([7]);
  });
});
