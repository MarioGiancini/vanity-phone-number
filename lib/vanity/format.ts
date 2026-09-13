import { normalize } from "./encode";
import type { SlotChar } from "./types";

/**
 * Group a local number for display. When `grouping` is provided it describes
 * the word lengths (e.g. [3, 4] -> "BIG-CODE"). Otherwise a complete 7-digit
 * local defaults to the standard 3+4 split.
 */
export function formatLocal(local: SlotChar[] | string, grouping?: number[]): string {
  const chars = Array.isArray(local) ? local.join("") : local;
  if (!chars) return "";
  const boundaries =
    grouping && grouping.length > 0 ? grouping : chars.length === 7 ? [3, 4] : [chars.length];

  const parts: string[] = [];
  let cursor = 0;
  for (const length of boundaries) {
    if (cursor >= chars.length) break;
    parts.push(chars.slice(cursor, cursor + length));
    cursor += length;
  }
  if (cursor < chars.length) parts.push(chars.slice(cursor));
  return parts.filter(Boolean).join("-");
}

/** "702" + "BIGCODE" + [3,4] -> "702-BIG-CODE" */
export function formatVanity(
  areaCode: string,
  local: SlotChar[] | string,
  grouping?: number[],
): string {
  const area = normalize(areaCode);
  const body = formatLocal(local, grouping);
  if (!body) return area;
  if (!area) return body;
  return `${area}-${body}`;
}

/** "7027764726" -> "702-776-4726" */
export function formatNumeric(digits: string): string {
  const d = normalize(digits);
  if (d.length !== 10) return d;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6, 10)}`;
}

/** Split the 7-digit local into exchange (NXX) and line (XXXX). */
export function splitLocal(digits: string): { exchange: string; line: string } {
  return { exchange: digits.slice(0, 3), line: digits.slice(3, 7) };
}

const BLANK = "\u2022";

/**
 * Split a local number into display groups, filling unfilled slots with a dot
 * so the phone screen shows the shape of the number as it is typed.
 */
export function localGroups(local: SlotChar[] | string, grouping?: number[]): string[] {
  const chars = (Array.isArray(local) ? [...local] : local.split("")).slice(0, 7);
  while (chars.length < 7) chars.push("");
  const bounds = grouping && grouping.length > 0 ? grouping : [3, 4];

  const groups: string[] = [];
  let cursor = 0;
  for (const length of bounds) {
    if (cursor >= 7) break;
    const end = Math.min(cursor + length, 7);
    groups.push(chars.slice(cursor, end).map((char) => char || BLANK).join(""));
    cursor = end;
  }
  if (cursor < 7) {
    groups.push(chars.slice(cursor).map((char) => char || BLANK).join(""));
  }
  return groups;
}
