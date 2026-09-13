import { lettersToDigits, normalize, slotsToDigits } from "./encode";
import { formatNumeric, formatVanity } from "./format";
import type { BuiltVanity, SlotChar } from "./types";

const EMPTY_SLOTS: SlotChar[] = Array.from({ length: 7 }, () => "");

/** Pad or trim a local slot array to exactly 7 entries. */
export function toSlots(chars: SlotChar[]): SlotChar[] {
  return Array.from({ length: 7 }, (_, i) => chars[i] ?? "");
}

/** Compose the full derived view used throughout the UI. */
export function buildVanity(areaCode: string, local: SlotChar[], grouping?: number[]): BuiltVanity {
  const slots = toSlots(local);
  const area = normalize(areaCode);
  const localDigits = slotsToDigits(slots);
  const complete = slots.every(Boolean);
  const warnings: string[] = [];

  if (area.length !== 3) {
    warnings.push("Area code should be 3 characters.");
  }

  if (complete) {
    const first = localDigits[0];
    if (first === "0" || first === "1") {
      warnings.push("Exchange code can't start with 0 or 1.");
    }
  }

  const areaDigits = lettersToDigits(area);
  const dialable = complete ? `${areaDigits}${localDigits}` : "";

  return {
    areaCode: area,
    local: slots,
    localDigits,
    complete,
    formattedVanity: formatVanity(area, slots, grouping),
    formattedNumeric: complete ? formatNumeric(dialable) : "",
    dialable,
    warnings,
  };
}

export function emptySlots(): SlotChar[] {
  return [...EMPTY_SLOTS];
}
