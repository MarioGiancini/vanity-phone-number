import { LETTER_TO_DIGIT } from "./keypad";
import type { SlotChar } from "./types";

/** Uppercase and strip everything that can't live in a slot. */
export function normalize(text: string): string {
  return text.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Map one slot character to its dial digit. Digits pass through, "" -> "". */
export function charToDigit(char: SlotChar): string {
  if (!char) return "";
  if (char >= "0" && char <= "9") return char;
  return LETTER_TO_DIGIT[char] ?? "";
}

/** "big code!" -> "2442633" */
export function lettersToDigits(text: string): string {
  return normalize(text).split("").map(charToDigit).join("");
}

/** Turn free text into slot characters, capped at `max`. */
export function slotsFromText(text: string, max = 10): SlotChar[] {
  return normalize(text).split("").slice(0, max);
}

/** Map a slot array to digits. Blanks are dropped. */
export function slotsToDigits(slots: SlotChar[]): string {
  return slots.map(charToDigit).join("");
}

/** Keep the characters a user is allowed to type, preserving spaces/hyphens. */
export function sanitizeEntry(text: string): string {
  return text.toUpperCase().replace(/[^A-Z0-9\s-]/g, "").replace(/\s+/g, " ").slice(0, 32);
}

/** Word lengths in a raw entry, used to preserve display grouping. */
export function tokenLengths(entry: string): number[] {
  return entry
    .split(/[\s-]+/)
    .map((token) => token.replace(/[^A-Z0-9]/g, ""))
    .filter(Boolean)
    .map((token) => token.length);
}

/**
 * Display grouping from a raw entry. Only words (entries containing letters)
 * define grouping; a plain number falls back to the standard 3+4 split so the
 * dialer shows "233-2566" rather than "2332566".
 */
export function entryGrouping(entry: string): number[] {
  const tokens = entry
    .split(/[\s-]+/)
    .map((token) => token.replace(/[^A-Za-z0-9]/g, ""))
    .filter(Boolean);
  if (!tokens.some((token) => /[A-Za-z]/.test(token))) return [];
  return tokens.map((token) => token.length);
}
