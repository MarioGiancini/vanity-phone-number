import { DICTIONARY_RANK } from "@/data/dictionary";

/** Words this common by frequency rank (or curated by the user) count as good. */
const COMMON_RANK = 2500;
const MIN_LENGTH = 3;

/**
 * Whether a word is "meaningful enough" to surface as an alternate reading.
 * Curated list words always qualify (so DEV, CODE, MKDIR pass even though they
 * are rare in general English); otherwise we fall back to frequency rank.
 */
export function isQualityWord(word: string, curated: Set<string>): boolean {
  const normalized = word.toUpperCase();
  if (normalized.length < MIN_LENGTH) return false;
  if (curated.has(normalized)) return true;
  const rank = DICTIONARY_RANK[normalized];
  return rank !== undefined && rank < COMMON_RANK;
}

export function isQualityReading(words: readonly string[], curated: Set<string>): boolean {
  return words.length > 0 && words.every((word) => isQualityWord(word, curated));
}
