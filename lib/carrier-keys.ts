/**
 * Bring-your-own-keys, stored only in this browser (localStorage). They are
 * sent to the app's own routes per request so the server can use them
 * transiently; the server never stores them. Prefer scoped carrier keys.
 */
export interface CarrierKeys {
  twilioAccountSid: string;
  twilioApiKey: string;
  twilioApiSecret: string;
  telnyxApiKey: string;
}

export const EMPTY_CARRIER_KEYS: CarrierKeys = {
  twilioAccountSid: "",
  twilioApiKey: "",
  twilioApiSecret: "",
  telnyxApiKey: "",
};

const STORAGE_KEY = "vanity-studio:carrier-keys";

export function loadCarrierKeys(): CarrierKeys {
  if (typeof window === "undefined") return EMPTY_CARRIER_KEYS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_CARRIER_KEYS;
    const parsed = JSON.parse(raw) as Partial<CarrierKeys>;
    return { ...EMPTY_CARRIER_KEYS, ...parsed };
  } catch {
    return EMPTY_CARRIER_KEYS;
  }
}

export function saveCarrierKeys(keys: CarrierKeys): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch {
    // private mode / quota
  }
}

export function clearCarrierKeys(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function hasTwilioKeys(keys: CarrierKeys): boolean {
  return Boolean(keys.twilioAccountSid && keys.twilioApiKey && keys.twilioApiSecret);
}

export function hasTelnyxKey(keys: CarrierKeys): boolean {
  return Boolean(keys.telnyxApiKey);
}

export function hasAnyCarrierKeys(keys: CarrierKeys): boolean {
  return hasTwilioKeys(keys) || hasTelnyxKey(keys);
}

/** Headers for the app's own availability/discover routes. */
export function carrierHeaders(): Record<string, string> {
  const keys = loadCarrierKeys();
  const headers: Record<string, string> = {};
  if (hasTwilioKeys(keys)) {
    headers["x-carrier-twilio-account-sid"] = keys.twilioAccountSid;
    headers["x-carrier-twilio-api-key"] = keys.twilioApiKey;
    headers["x-carrier-twilio-api-secret"] = keys.twilioApiSecret;
  }
  if (hasTelnyxKey(keys)) headers["x-carrier-telnyx-api-key"] = keys.telnyxApiKey;
  return headers;
}
