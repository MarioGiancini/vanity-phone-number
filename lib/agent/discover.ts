import { DICTIONARY } from "@/data/dictionary";
import { BUILT_IN_LISTS } from "@/data/word-lists";
import { buildDigitIndex, decodeLocal, type DigitIndex } from "@/lib/vanity";
import { isQualityReading } from "@/lib/word-quality";
import type { CarrierOverride } from "./credentials";
import { listAvailableNumbers } from "./providers";

let cachedIndex: DigitIndex | undefined;

function getIndex(): DigitIndex {
  if (!cachedIndex) {
    const words = new Set<string>(DICTIONARY);
    for (const list of BUILT_IN_LISTS) {
      for (const word of list.words) words.add(word.toUpperCase());
    }
    cachedIndex = buildDigitIndex(words);
  }
  return cachedIndex;
}

let cachedCurated: Set<string> | undefined;

function getCuratedWords(): Set<string> {
  if (!cachedCurated) {
    cachedCurated = new Set<string>();
    for (const list of BUILT_IN_LISTS) {
      if (list.group === "Dictionary") continue;
      for (const word of list.words) cachedCurated.add(word.toUpperCase());
    }
  }
  return cachedCurated;
}

export interface DiscoveredNumber {
  /** E.164, e.g. "+17022442633". */
  number: string;
  /** 10 NANP digits, e.g. "7022442633". */
  dialable: string;
  /** "702-BIG-CODE" */
  vanity: string;
  words: string[];
  score: number;
  /** Which carrier's inventory this number came from. */
  provider: string;
  locality?: string;
  region?: string;
}

export interface DiscoverInput {
  areaCode: string;
  /** How many inventory pages (1000 each) to sample. */
  pages?: number;
  limit?: number;
  /** Minimum memorability score (0-100); defaults to 80. */
  minScore?: number;
  /** Per-request carrier credentials (bring-your-own-keys). */
  override?: CarrierOverride;
}

/**
 * Scan Twilio's available inventory for an area code and surface the numbers
 * that spell real words — i.e. "find me a cool available number" without the
 * caller knowing any words in advance.
 */
export async function discoverVanityNumbers(input: DiscoverInput): Promise<{
  areaCode: string;
  scanned: number;
  matches: number;
  results: DiscoveredNumber[];
}> {
  const areaCode = input.areaCode.replace(/[^0-9]/g, "").slice(0, 3);
  const numbers = await listAvailableNumbers(areaCode, {
    pages: input.pages ?? 3,
    override: input.override,
  });
  const index = getIndex();
  const curated = getCuratedWords();
  const minScore = input.minScore ?? 80;

  const found: DiscoveredNumber[] = [];
  for (const entry of numbers) {
    const dialable = entry.phoneNumber.replace(/[^0-9]/g, "").replace(/^1/, "");
    const local = dialable.slice(3);
    // Words can't contain 0 or 1, so those locals can never spell anything.
    if (!/^[0-9]{7}$/.test(local) || /[01]/.test(local)) continue;

    const reading = decodeLocal(local, index, { areaCode, limit: 8 }).find((match) =>
      isQualityReading(match.words, curated),
    );
    if (!reading || reading.score < minScore) continue;

    found.push({
      number: entry.phoneNumber,
      dialable,
      vanity: reading.vanity,
      words: reading.words,
      score: reading.score,
      provider: entry.provider,
      locality: entry.locality,
      region: entry.region,
    });
  }

  found.sort((a, b) => b.score - a.score || a.words.length - b.words.length);

  return {
    areaCode,
    scanned: numbers.length,
    matches: found.length,
    results: found.slice(0, input.limit ?? 20),
  };
}
