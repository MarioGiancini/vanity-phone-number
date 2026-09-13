import { BUILT_IN_LISTS } from "@/data/word-lists";
import { generateCombos, normalize, type ComboResult, type Slot } from "@/lib/vanity";
import { detectArea, detectTheme } from "./intent";

export interface FindInput {
  /** Natural-language brief, e.g. "cool vanity number for a Vegas tech shop". */
  prompt?: string;
  /** Explicit area code (overrides the prompt). */
  areaCode?: string;
  /** Built-in or custom list id to draw words from. */
  theme?: string;
  /** Hard word constraints, e.g. ["BIG", "CODE"]. */
  words?: string[];
  /** Max candidates returned. */
  limit?: number;
}

export interface ResolvedQuery {
  areaCode: string;
  theme?: string;
  words: string[];
  /** How the area code was chosen. */
  areaSource: "areaCode" | "prompt" | "default";
}

function wordSlot(length: number, words: readonly string[]): Slot {
  return { kind: "words", length, words };
}

function dedupeAndRank(candidates: ComboResult[], limit: number): ComboResult[] {
  const seen = new Set<string>();
  const unique: ComboResult[] = [];
  for (const candidate of candidates) {
    if (!candidate.dialable || seen.has(candidate.dialable)) continue;
    seen.add(candidate.dialable);
    unique.push(candidate);
  }
  unique.sort((a, b) => b.score - a.score || a.local.localeCompare(b.local));
  return unique.slice(0, limit);
}

/**
 * Pure candidate generation for the agent API: resolve the brief, then build
 * ranked vanity numbers. No network calls — availability is added by the route.
 */
export function findCandidates(input: FindInput): {
  resolved: ResolvedQuery;
  candidates: ComboResult[];
} {
  const prompt = input.prompt ?? "";
  const explicitArea = normalize(input.areaCode ?? "");
  const detectedArea = explicitArea ? undefined : detectArea(prompt);
  const areaCode = (explicitArea || detectedArea?.code || "702").slice(0, 3);

  // Strip the location text so "Las Vegas" isn't read as the Vegas theme.
  const themePrompt = detectedArea
    ? prompt.replace(new RegExp(detectedArea.matched.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig"), " ")
    : prompt;

  const explicitWords = (input.words ?? [])
    .map((word) => normalize(word))
    .filter((word) => word.length >= 2 && word.length <= 7);

  const theme =
    input.theme || detectTheme(themePrompt) || (explicitWords.length > 0 ? undefined : "tech");

  const themeWords =
    BUILT_IN_LISTS.find((list) => list.id === theme)?.words ?? BUILT_IN_LISTS[0].words;

  const candidates: ComboResult[] = [];

  if (explicitWords.length > 0) {
    const total = explicitWords.reduce((sum, word) => sum + word.length, 0);
    if (total === 7) {
      const slots = explicitWords.map((word) => wordSlot(word.length, [word]));
      candidates.push(...generateCombos({ areaCode, slots, limit: 200 }));
    } else if (total < 7) {
      // Fit the phrase and pad the rest with wildcard digits.
      candidates.push(
        ...generateCombos({
          areaCode,
          slots: [wordSlot(total, [explicitWords.join("")]), { kind: "digits", length: 7 - total }],
          limit: 200,
        }),
      );
    }
  } else {
    candidates.push(
      ...generateCombos({ areaCode, slots: [wordSlot(3, themeWords), wordSlot(4, themeWords)], limit: 800 }),
    );
    candidates.push(
      ...generateCombos({ areaCode, slots: [wordSlot(4, themeWords), wordSlot(3, themeWords)], limit: 800 }),
    );
    candidates.push(
      ...generateCombos({ areaCode, slots: [wordSlot(7, themeWords)], limit: 300 }),
    );
  }

  return {
    resolved: {
      areaCode,
      theme,
      words: explicitWords,
      areaSource: explicitArea ? "areaCode" : detectedArea ? "prompt" : "default",
    },
    candidates: dedupeAndRank(candidates, Math.max(1, Math.min(input.limit ?? 40, 200))),
  };
}
