/** Normalize a US/NANP number to E.164 (+1XXXXXXXXXX), or null if invalid. */
export function normalizeNanp(input: string): string | null {
  const digits = (input ?? "").replace(/[^0-9]/g, "");
  const ten = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (ten.length !== 10) return null;
  return `+1${ten}`;
}

/** True when the string is a valid NANP number. */
export function isNanp(input: string): boolean {
  return normalizeNanp(input) !== null;
}
