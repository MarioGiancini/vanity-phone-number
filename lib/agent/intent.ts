import { AREA_CODES } from "@/data/area-codes";
import { AREA_CODE_SUGGESTIONS } from "@/data/presets";

/** Prompt keyword -> built-in word list id. Longest match wins. */
const THEME_KEYWORDS: Record<string, string[]> = {
  tech: ["software", "developer", "programmer", "engineering", "tech", "dev", "coding", "code", "saas", "it services"],
  ai: ["artificial intelligence", "machine learning", "ai", "automation", "robotics"],
  crypto: ["cryptocurrency", "blockchain", "crypto", "web3", "bitcoin", "nft", "defi"],
  realestate: ["real estate", "realtor", "property", "properties", "homes", "housing", "broker"],
  startup: ["startup", "venture", "founder", "entrepreneur", "launch"],
  luxury: ["luxury", "high-end", "upscale", "boutique", "premium", "elegant", "luxe"],
  money: ["financial", "finance", "banking", "wealth", "invest", "capital", "money", "bank", "fund"],
  health: ["wellness", "medical", "health", "clinic", "doctor", "therapy", "care"],
  fitness: ["fitness", "gym", "training", "workout", "crossfit", "yoga", "pilates"],
  food: ["restaurant", "catering", "eatery", "coffee", "bakery", "pizza", "taco", "food", "cafe", "bar"],
  auto: ["detailing", "mechanic", "towing", "automotive", "auto", "cars", "car", "truck", "repair"],
  music: ["records", "studio", "music", "audio", "band", "sound", "dj"],
  travel: ["vacation", "tourism", "travel", "tours", "agency", "flights", "cruise"],
  outdoors: ["adventure", "outdoors", "outdoor", "hiking", "camping", "nature", "park"],
  pets: ["veterinary", "grooming", "pets", "pet", "vet", "dog", "cat", "animal"],
  trendy: ["trendy", "modern", "vibe", "hip", "cool", "young"],
  vegas: ["las vegas", "vegas", "casino", "poker", "slots", "neon"],
};

/** Pick the theme whose keyword is the longest match in the prompt. */
export function detectTheme(prompt: string): string | undefined {
  const text = prompt.toLowerCase();
  let best: { id: string; score: number } | undefined;

  for (const [id, keywords] of Object.entries(THEME_KEYWORDS)) {
    for (const keyword of keywords) {
      if (!text.includes(keyword)) continue;
      if (!best || keyword.length > best.score) best = { id, score: keyword.length };
    }
  }

  return best?.id;
}

/** An area code detected from the prompt, with the text that matched it. */
export interface DetectedArea {
  code: string;
  matched: string;
}

/**
 * Find an area code from an explicit 3-digit number or a mentioned city, and
 * report the matched text so callers can strip the location before theme
 * detection (e.g. so "Las Vegas" doesn't read as the Vegas theme).
 */
export function detectArea(prompt: string): DetectedArea | undefined {
  const text = prompt.toLowerCase();

  const codeMatch = text.match(/\b(\d{3})\b/);
  if (codeMatch && AREA_CODES.some((info) => info.code === codeMatch[1])) {
    return { code: codeMatch[1], matched: codeMatch[1] };
  }

  for (const suggestion of AREA_CODE_SUGGESTIONS) {
    const city = suggestion.label.split(",")[0]?.trim().toLowerCase() ?? "";
    if (city.length >= 4 && text.includes(city)) return { code: suggestion.code, matched: city };
  }

  for (const info of AREA_CODES) {
    const city = info.city.toLowerCase();
    if (city.length >= 5 && text.includes(city)) return { code: info.code, matched: city };
  }

  return undefined;
}

/** Area code only, when the matched text isn't needed. */
export function detectAreaCode(prompt: string): string | undefined {
  return detectArea(prompt)?.code;
}

/** Explicitly quoted words, e.g. find me "BIG" "CODE". */
export function detectWords(prompt: string): string[] {
  const words: string[] = [];
  for (const match of prompt.matchAll(/["'`]([A-Za-z]{2,7})["'`]/g)) {
    words.push(match[1].toUpperCase());
  }
  return [...new Set(words)];
}
