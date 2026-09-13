/**
 * T9 keypad model.
 *
 * The North American dialing pad maps digits 2-9 to letters. 0 and 1 carry no
 * letters in standard NANP vanity numbers, which is why a valid local number
 * can never spell a word using them.
 */

export interface DialKey {
  digit: string;
  letters: string;
}

/** 4x3 layout: 1-2-3 / 4-5-6 / 7-8-9 / *-0-#. */
export const KEYPAD_ROWS: readonly string[][] = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "#"],
];

/** Letters printed on each dial key. `*` and `#` are decorative. */
export const KEY_LETTERS: Record<string, string> = {
  "2": "ABC",
  "3": "DEF",
  "4": "GHI",
  "5": "JKL",
  "6": "MNO",
  "7": "PQRS",
  "8": "TUV",
  "9": "WXYZ",
};

/** Flat key list, useful for iteration and tests. */
export const DIAL_KEYS: readonly DialKey[] = Object.entries(KEY_LETTERS).map(([digit, letters]) => ({
  digit,
  letters,
}));

/** "P" -> "7" */
export const LETTER_TO_DIGIT: Record<string, string> = Object.fromEntries(
  Object.entries(KEY_LETTERS).flatMap(([digit, letters]) =>
    letters.split("").map((letter) => [letter, digit]),
  ),
);
