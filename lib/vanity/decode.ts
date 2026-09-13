import { lettersToDigits, normalize } from "./encode";
import { formatLocal, formatNumeric } from "./format";
import { coverageOf, scoreVanity } from "./score";
import type { DecodeMatch } from "./types";

export type DigitIndex = Map<string, string[]>;

/** Build a "7764726" -> ["PROGRAM", ...] lookup from any word source. */
export function buildDigitIndex(words: Iterable<string>): DigitIndex {
  const index: DigitIndex = new Map();
  for (const raw of words) {
    const word = normalize(raw);
    if (!/^[A-Z]+$/.test(word)) continue;
    const key = lettersToDigits(word);
    const bucket = index.get(key);
    if (bucket) {
      if (!bucket.includes(word)) bucket.push(word);
    } else {
      index.set(key, [word]);
    }
  }
  return index;
}

export function wordsForDigits(digits: string, index: DigitIndex): string[] {
  return index.get(normalize(digits)) ?? [];
}

function compositions(n: number, minPart: number, maxParts: number): number[][] {
  const out: number[][] = [];
  const walk = (remaining: number, parts: number[]) => {
    if (remaining === 0) {
      out.push([...parts]);
      return;
    }
    if (parts.length >= maxParts) return;
    for (let len = remaining; len >= minPart; len--) {
      const rest = remaining - len;
      if (rest !== 0 && rest < minPart) continue;
      parts.push(len);
      walk(rest, parts);
      parts.pop();
    }
  };
  walk(n, []);
  return out;
}

export interface DecodeOptions {
  areaCode: string;
  /** Minimum letters per word. 2 keeps "GO"/"UP" but drops single letters. */
  minPart?: number;
  maxParts?: number;
  /** Hard cap on returned readings. */
  limit?: number;
}

/** Recover every way a 7-digit local number can be read as words. */
export function decodeLocal(digits: string, index: DigitIndex, options: DecodeOptions): DecodeMatch[] {
  const local = normalize(digits);
  if (local.length !== LOCAL_LENGTH || !/^[0-9]{7}$/.test(local)) return [];

  const { areaCode, minPart = 2, maxParts = 3, limit = 500 } = options;
  const area = normalize(areaCode);
  const areaDigits = lettersToDigits(area);
  const results: DecodeMatch[] = [];

  for (const parts of compositions(LOCAL_LENGTH, minPart, maxParts)) {
    let cursor = 0;
    const optionsPerPart: string[][] = [];
    let viable = true;
    for (const len of parts) {
      const segment = local.slice(cursor, cursor + len);
      cursor += len;
      const words = index.get(segment);
      if (!words || words.length === 0) {
        viable = false;
        break;
      }
      optionsPerPart.push(words);
    }
    if (!viable) continue;

    const walk = (partIndex: number, chosen: string[]) => {
      if (results.length >= limit) return;
      if (partIndex === optionsPerPart.length) {
        const wordChars = chosen.join("");
        const letters = wordChars.length;
        const coverage = coverageOf(letters, LOCAL_LENGTH);
        results.push({
          areaCode: area,
          words: [...chosen],
          local: wordChars,
          vanity: `${area}-${formatLocal(wordChars, parts)}`,
          numeric: formatNumeric(`${areaDigits}${local}`),
          dialable: `${areaDigits}${local}`,
          coverage,
          score: scoreVanity(coverage, chosen, LOCAL_LENGTH - letters),
        });
        return;
      }
      for (const word of optionsPerPart[partIndex]) {
        chosen.push(word);
        walk(partIndex + 1, chosen);
        chosen.pop();
        if (results.length >= limit) return;
      }
    };
    walk(0, []);
  }

  return results.sort((a, b) => b.score - a.score || a.words.join("").localeCompare(b.words.join("")));
}

const LOCAL_LENGTH = 7;
