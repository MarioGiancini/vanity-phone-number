import { buildVanity } from "./build";
import { normalize, slotsFromText } from "./encode";
import type { SavedNumber } from "./types";

export interface MakeSavedInput {
  areaCode: string;
  /** Concatenated local characters, e.g. "BIGCODE". */
  local: string;
  /** Optional word boundaries used for the vanity display. */
  words?: readonly string[];
  label?: string;
}

/** Build a persistable record from a candidate. */
export function makeSavedNumber(input: MakeSavedInput): SavedNumber {
  const local = normalize(input.local);
  const grouping = input.words?.map((word) => word.length);
  const built = buildVanity(input.areaCode, slotsFromText(local, 7), grouping);

  return {
    id: built.dialable || `${built.areaCode}-${local}`,
    areaCode: built.areaCode,
    local,
    vanity: built.formattedVanity,
    numeric: built.formattedNumeric,
    dialable: built.dialable,
    words: input.words ? [...input.words] : undefined,
    label: input.label,
    createdAt: Date.now(),
  };
}
