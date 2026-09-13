import { AREA_CODES, lookupAreaCode, type AreaCodeInfo } from "@/data/area-codes";
import { AREA_CODE_SUGGESTIONS } from "@/data/presets";

/** Curated labels (e.g. 702 -> "Las Vegas, NV") that beat the raw dataset city. */
const PREFERRED_LABELS = new Map(AREA_CODE_SUGGESTIONS.map((item) => [item.code, item.label]));

export function areaCodeLabel(info: AreaCodeInfo): string {
  const preferred = PREFERRED_LABELS.get(info.code);
  if (preferred) return preferred;
  const city = info.city?.trim();
  const state = info.state?.trim();
  if (city && state) return `${city}, ${state}`;
  if (state) return state;
  if (city) return city;
  return `Area code ${info.code}`;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Great-circle distance in miles. */
export function haversineMiles(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const earthRadius = 3958.8;
  const dLat = toRadians(bLat - aLat);
  const dLng = toRadians(bLng - aLng);
  const lat1 = toRadians(aLat);
  const lat2 = toRadians(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(h));
}

/** Search by area code prefix, city, or state (including curated labels). */
export function searchAreaCodes(query: string, limit = 40): AreaCodeInfo[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const primary: AreaCodeInfo[] = [];
  const secondary: AreaCodeInfo[] = [];

  for (const info of AREA_CODES) {
    const city = info.city.toLowerCase();
    const state = info.state.toLowerCase();
    const preferred = (PREFERRED_LABELS.get(info.code) ?? "").toLowerCase();

    if (info.code.startsWith(q)) {
      primary.push(info);
    } else if (city.startsWith(q) || state === q || preferred.startsWith(q)) {
      secondary.push(info);
    } else if (city.includes(q) || state.startsWith(q) || preferred.includes(q)) {
      secondary.push(info);
    }
  }

  return [...primary, ...secondary].slice(0, limit);
}

/** Nearest area code to a coordinate, using the representative city location. */
export function nearestAreaCode(lat: number, lng: number): AreaCodeInfo | undefined {
  let best: AreaCodeInfo | undefined;
  let bestDistance = Infinity;
  for (const info of AREA_CODES) {
    if (typeof info.lat !== "number" || typeof info.lng !== "number") continue;
    const distance = haversineMiles(lat, lng, info.lat, info.lng);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = info;
    }
  }
  return best;
}

/** Convenience wrapper used by the picker. */
export function describeAreaCode(code: string): string {
  const info = lookupAreaCode(code);
  return info ? areaCodeLabel(info) : "Custom area code";
}
