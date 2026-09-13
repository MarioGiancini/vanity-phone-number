/** Curated starting points. Numbers are derived from the words at render time. */
export interface CuratedPreset {
  id: string;
  areaCode: string;
  /** Concatenated local letters, e.g. "BIGCODE". */
  local: string;
  /** Word boundaries for display, e.g. ["BIG", "CODE"]. */
  words: string[];
  tag: string;
  blurb: string;
}

export interface AreaCodeSuggestion {
  code: string;
  label: string;
}

export const AREA_CODE_SUGGESTIONS: readonly AreaCodeSuggestion[] = [
  { code: "702", label: "Las Vegas, NV" },
  { code: "725", label: "Las Vegas, NV" },
  { code: "212", label: "New York, NY" },
  { code: "646", label: "New York, NY" },
  { code: "415", label: "San Francisco, CA" },
  { code: "628", label: "San Francisco, CA" },
  { code: "310", label: "Los Angeles, CA" },
  { code: "424", label: "Los Angeles, CA" },
  { code: "512", label: "Austin, TX" },
  { code: "737", label: "Austin, TX" },
  { code: "305", label: "Miami, FL" },
  { code: "786", label: "Miami, FL" },
  { code: "206", label: "Seattle, WA" },
  { code: "312", label: "Chicago, IL" },
  { code: "617", label: "Boston, MA" },
  { code: "303", label: "Denver, CO" },
  { code: "720", label: "Denver, CO" },
  { code: "602", label: "Phoenix, AZ" },
  { code: "404", label: "Atlanta, GA" },
  { code: "214", label: "Dallas, TX" },
  { code: "615", label: "Nashville, TN" },
  { code: "416", label: "Toronto, ON" },
];

/** The Las Vegas tech list that seeded this project. */
export const LAS_VEGAS_PRESETS: readonly CuratedPreset[] = [
  {
    id: "program",
    areaCode: "702",
    local: "PROGRAM",
    words: ["PROGRAM"],
    tag: "Software",
    blurb: "Classic software development.",
  },
  {
    id: "systems",
    areaCode: "702",
    local: "SYSTEMS",
    words: ["SYSTEMS"],
    tag: "Infra",
    blurb: "Backend engineering or IT infrastructure.",
  },
  {
    id: "designs",
    areaCode: "702",
    local: "DESIGNS",
    words: ["DESIGNS"],
    tag: "Design",
    blurb: "UI/UX, creative software, or web design.",
  },
  {
    id: "creator",
    areaCode: "702",
    local: "CREATOR",
    words: ["CREATOR"],
    tag: "Creative tech",
    blurb: "A creative technologist or app builder.",
  },
  {
    id: "webdevs",
    areaCode: "702",
    local: "WEBDEVS",
    words: ["WEB", "DEVS"],
    tag: "Web",
    blurb: "Direct and clear for web development.",
  },
  {
    id: "devpros",
    areaCode: "702",
    local: "DEVPROS",
    words: ["DEV", "PROS"],
    tag: "Services",
    blurb: "Professional development services.",
  },
  {
    id: "rebuild",
    areaCode: "702",
    local: "REBUILD",
    words: ["REBUILD"],
    tag: "Consulting",
    blurb: "Rebuild, rescue, and modernization work.",
  },
  {
    id: "bigcode",
    areaCode: "702",
    local: "BIGCODE",
    words: ["BIG", "CODE"],
    tag: "Combo",
    blurb: "3-letter plus 4-letter combo.",
  },
  {
    id: "iceluck",
    areaCode: "702",
    local: "ICELUCK",
    words: ["ICE", "LUCK"],
    tag: "Combo",
    blurb: "Ice-cold luck for a Vegas dev shop.",
  },
  {
    id: "hotwire",
    areaCode: "702",
    local: "HOTWIRE",
    words: ["HOT", "WIRE"],
    tag: "Combo",
    blurb: "Fast, hot leads and connectivity.",
  },
];
