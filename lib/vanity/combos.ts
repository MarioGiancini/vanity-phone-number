import { lettersToDigits, normalize } from "./encode";
import { formatLocal, formatNumeric } from "./format";
import { coverageOf, scoreVanity } from "./score";
import type { ComboResult } from "./types";

export interface WordSlot {
  kind: "words";
  length: number;
  words: readonly string[];
  label?: string;
}

export interface DigitSlot {
  kind: "digits";
  length: number;
}

export type Slot = WordSlot | DigitSlot;

export interface ComboOptions {
  areaCode: string;
  slots: Slot[];
  /** Hard cap on generated candidates to keep the UI responsive. */
  limit?: number;
}

const LOCAL_LENGTH = 7;

function expandSlot(slot: Slot): string[] {
  if (slot.kind === "digits") {
    const count = 10 ** slot.length;
    return Array.from({ length: count }, (_, i) => String(i).padStart(slot.length, "0"));
  }

  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of slot.words) {
    const word = normalize(raw);
    if (word.length !== slot.length || seen.has(word)) continue;
    if (!/^[A-Z]+$/.test(word)) continue;
    seen.add(word);
    out.push(word);
  }
  return out;
}

/**
 * Generate every vanity candidate that fits the given slot layout.
 *
 * Example: area 702, slots [{length:3, words:BIG...},{length:4, words:CODE...}]
 * yields "702-BIG-CODE" / "702-244-2633" and everything else in the product.
 */
export function generateCombos({ areaCode, slots, limit = 4000 }: ComboOptions): ComboResult[] {
  const area = normalize(areaCode);
  const total = slots.reduce((sum, slot) => sum + slot.length, 0);
  if (area.length !== 3 || total !== LOCAL_LENGTH) return [];

  const groups = slots.map(expandSlot);
  if (groups.some((group) => group.length === 0)) return [];

  const areaDigits = lettersToDigits(area);
  const groupings = slots.map((slot) => slot.length);
  const letters = slots.reduce((sum, slot) => sum + (slot.kind === "words" ? slot.length : 0), 0);
  const coverage = coverageOf(letters, LOCAL_LENGTH);
  const results: ComboResult[] = [];

  const walk = (index: number, chosen: string[]) => {
    if (results.length >= limit) return;
    if (index === groups.length) {
      const local = chosen.join("");
      const localDigits = lettersToDigits(local);
      const exchangeFirst = localDigits[0];
      if (exchangeFirst === "0" || exchangeFirst === "1") return;

      const words = slots
        .map((slot, i) => (slot.kind === "words" ? chosen[i] : ""))
        .filter(Boolean);

      results.push({
        areaCode: area,
        local,
        words,
        vanity: `${area}-${formatLocal(local, groupings)}`,
        numeric: formatNumeric(`${areaDigits}${localDigits}`),
        dialable: `${areaDigits}${localDigits}`,
        coverage,
        score: scoreVanity(coverage, words, LOCAL_LENGTH - letters),
      });
      return;
    }

    for (const value of groups[index]) {
      chosen.push(value);
      walk(index + 1, chosen);
      chosen.pop();
      if (results.length >= limit) return;
    }
  };

  walk(0, []);

  return results.sort((a, b) => b.score - a.score || a.local.localeCompare(b.local));
}
