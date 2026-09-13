/**
 * Domain types for the vanity phone number studio.
 *
 * Everything here is plain data with no DOM or React dependency so it can be
 * reused from a server route, a background worker, or (later) a mobile client.
 */

/** A single slot in the 7-digit local number: "" | "0".."9" | "A".."Z". */
export type SlotChar = string;

/** A user-curated list of words that can fill combos. */
export interface WordList {
  id: string;
  name: string;
  description?: string;
  words: string[];
  /** Grouping label for pickers, e.g. "Themes". */
  group?: string;
  /** Built-in lists ship with the app and are read-only. */
  builtIn?: boolean;
}

/** A vanity number the user has starred or recently viewed. */
export interface SavedNumber {
  id: string;
  areaCode: string;
  /** Raw local characters, e.g. "BIGCODE". */
  local: string;
  /** Human display, e.g. "702-BIG-CODE". */
  vanity: string;
  /** Numeric display, e.g. "702-244-2633". */
  numeric: string;
  /** Digit string without formatting, e.g. "7022442633". */
  dialable: string;
  /** Words used, if the number was built from a phrase. */
  words?: string[];
  /** Optional note or source label. */
  label?: string;
  createdAt: number;
}

/** Fully derived, render-ready view of a vanity number. */
export interface BuiltVanity {
  areaCode: string;
  local: SlotChar[];
  /** Local digits with blanks removed, e.g. "7764726". May be shorter than 7. */
  localDigits: string;
  complete: boolean;
  /** "702-BIG-CODE" */
  formattedVanity: string;
  /** "702-244-2633" brand style numeric string. */
  formattedNumeric: string;
  /** Digits only, e.g. "7022442633". Empty when not complete. */
  dialable: string;
  /** NANP-style notes, e.g. an exchange that starts with 0/1. */
  warnings: string[];
}

/** A generated candidate from the combo engine. */
export interface ComboResult {
  areaCode: string;
  /** Concatenated local characters, e.g. "BIGCODE". */
  local: string;
  /** Words used, in slot order. */
  words: string[];
  vanity: string;
  numeric: string;
  dialable: string;
  /** Fraction of the 7 local slots covered by letters (0..1). */
  coverage: number;
  /** Composite 0..100 memorability score. */
  score: number;
}

/** One reading recovered from a numeric local number. */
export interface DecodeMatch {
  areaCode: string;
  /** Words used, in order. */
  words: string[];
  local: string;
  vanity: string;
  numeric: string;
  dialable: string;
  coverage: number;
  score: number;
}
