/**
 * Memorability heuristic. A vanity number is "good" when its letters cover
 * most of the local number, the words are few, and none of it relies on
 * filler digits.
 */
export function scoreVanity(coverage: number, words: readonly string[], digitCount = 0): number {
  let score = coverage * 80;

  if (words.length === 1 && words[0].length === 7) {
    score += 18;
  } else if (words.length === 1) {
    score += 8;
  } else if (words.length === 2) {
    score += 10;
  } else if (words.length > 2) {
    score += 3;
  }

  const shortest = words.reduce((min, word) => Math.min(min, word.length), Infinity);
  if (shortest >= 3) score += 4;

  score -= digitCount * 6;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function coverageOf(letterCount: number, total = 7): number {
  return Math.max(0, Math.min(1, letterCount / total));
}
