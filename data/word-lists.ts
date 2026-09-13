import { DICTIONARY } from "./dictionary";
import type { WordList } from "@/lib/vanity";

function byLength(length: number): string[] {
  return DICTIONARY.filter((word) => word.length === length);
}

const CORE_3 = [
  "BIG", "BOY", "ACE", "ICE", "HUG", "HOT", "TOP", "SSH", "SEO", "KEY",
  "NET", "APP", "DEV", "WEB", "BOT", "LAB", "PRO", "FIT", "GYM", "CAR",
  "LAW", "TAX", "SPA", "FUN", "GEM", "ARC", "ORB", "SKY", "SUN", "SEA",
  "WIN", "BET", "FLY", "JOY", "MAX", "VIP", "RUN", "PAY", "BUY", "BID",
  "IPO", "LLC", "INC", "ADD", "NEW", "NOW", "YOU", "GURU", "ZEN",
];

const CORE_4 = [
  "CODE", "LIVE", "LIFE", "LUCK", "DICE", "WIRE", "WALK", "TECH", "TOOL",
  "GROK", "GREP", "PIPE", "DATA", "GAME", "RIDE", "PLAY", "FAST", "GOOD",
  "BEST", "LOVE", "WORK", "CASH", "BOOK", "FILM", "SHOW", "STAR", "GOLD",
  "NEON", "FIRE", "WOLF", "KING", "LION", "TREE", "GATE", "WAVE", "LINK",
  "CHIP", "CARD", "HAND", "ROLL", "ODDS", "HIGH", "COIN", "SLOT", "DEAL",
];

const TECH = [
  "MKDIR", "CHMOD", "CHOWN", "SUDO", "KILL", "ECHO", "GREP", "AWK", "SED",
  "CURL", "WGET", "SCP", "RSYNC", "GIT", "NPM", "YARN", "VITE", "NEXT",
  "REACT", "RUST", "JAVA", "LINUX", "MACOS", "DOCKER", "DEBUG", "STACK",
  "CACHE", "QUEUE", "TOKEN", "PATCH", "MERGE", "SHELL", "CRON", "VIM",
  "BASH", "NODE", "BYTES", "PIXEL", "RENDER", "SHADER", "ENGINE", "SERVER",
  "CLIENT", "DEPLOY", "BUILD", "COMMIT", "BRANCH", "REBASE", "PUSH", "PULL",
  "FORK", "REPO", "SCRIPT", "HACK", "PING", "PORT", "PROXY", "ROUTE", "HOST",
  "DOMAIN", "CERT", "HASH", "SALT", "SEED", "NULL", "BOOL", "FLOAT", "ARRAY",
  "JSON", "YAML", "HTML", "SSH", "SQL",
];

const TRENDY = [
  "VIBE", "GLOW", "FLEX", "HYPR", "NEON", "LUXE", "GOAT", "MOOD", "AURA",
  "ZEST", "SLAY", "ICON", "EPIC", "DOPE", "SWAG", "BOSS", "CHILL", "DRIP",
  "LIT", "POP", "HIT", "RAW", "ICY",
];

const LUXURY = [
  "LUX", "VIP", "GEM", "GOLD", "PLUSH", "CROWN", "REGAL", "NOBLE", "PRIME",
  "OPAL", "JEWEL", "SILK", "RUBY", "PEARL", "ROYAL", "GRAND", "ELITE",
  "POSH", "RICH", "LUXE",
];

const MONEY = [
  "PAY", "TAX", "BUY", "BID", "IPO", "LLC", "INC", "CASH", "FUND", "BOND",
  "BANK", "COIN", "GAIN", "LOAN", "RATE", "GOLD", "RICH", "PILE", "BULL",
  "BEAR", "BILL", "CARD", "VAULT", "STOCK", "WEALTH", "PROFIT",
];

const HEALTH = [
  "ZEN", "FIT", "GYM", "RUN", "EAT", "CARE", "WELL", "CALM", "VITA",
  "PULSE", "LIFT", "MIND", "BODY", "HEAL", "CURE", "MOVE", "LIVE", "GROW",
  "REST", "SOUL", "PURE",
];

const REALESTATE = [
  "LOT", "KEY", "BAY", "INN", "DEN", "PAD", "HOME", "LOFT", "VILLA",
  "KEYS", "SPACE", "PLACE", "ABODE", "MANOR", "HOUSE", "DWELL", "ROOF",
  "LAND", "YARD", "ESTATE",
];

const STARTUP = [
  "MVP", "IPO", "LLC", "INC", "LAB", "BIZ", "APP", "DEV", "RUN", "TRY",
  "SEED", "SHIP", "GROW", "IDEA", "FUND", "SCALE", "FOUND", "BUILD",
  "LAUNCH", "PIVOT", "PITCH", "HUSTLE",
];

const FOOD = [
  "EAT", "SIP", "BAR", "BBQ", "PIE", "TEA", "JAM", "KEG", "TACO", "BREW",
  "BEAN", "BITE", "EATS", "SALT", "DISH", "MEAL", "CAFE", "CHEF", "WINE",
  "GRILL", "FEAST", "SPICE",
];

const FITNESS = [
  "FIT", "GYM", "RUN", "REP", "MAX", "ABS", "LIFT", "PUMP", "BURN", "GAIN",
  "CORE", "MOVE", "FLEX", "TONE", "TRIM", "IRON", "BODY", "POWER",
];

const AUTO = [
  "CAR", "VAN", "GAS", "REV", "AUTO", "TIRE", "RIDE", "GEAR", "RACE",
  "FAST", "TRUCK", "MOTOR", "WHEEL", "TURBO", "DRIVE",
];

const MUSIC = [
  "AMP", "MIX", "JAM", "POP", "RAP", "EDM", "BEAT", "TUNE", "BASS", "SOLO",
  "DRUM", "SONG", "DROP", "WAVE", "AUDIO", "TRACK", "VINYL",
];

const TRAVEL = [
  "JET", "FLY", "SKY", "SEA", "AIR", "VAN", "TRIP", "TOUR", "ROAM", "VISA",
  "GLOBE", "WANDER", "VOYAGE", "CRUISE", "ISLAND", "ESCAPE",
];

const CRYPTO = [
  "ETH", "BTC", "DEX", "NFT", "GAS", "KEY", "COIN", "MINT", "HODL", "SATS",
  "DEFI", "BLOCK", "CHAIN", "TOKEN", "LEDGER", "WALLET",
];

const OUTDOORS = [
  "SKY", "SUN", "SEA", "ICE", "OAK", "FIR", "PEAK", "CAMP", "HIKE", "WILD",
  "LAKE", "ROCK", "TREE", "WOLF", "BEAR", "RIDGE", "GROVE", "STONE",
  "TRAIL", "SUMMIT", "VALLEY", "RIVER",
];

const AI = [
  "BOT", "GPU", "CPU", "NET", "DATA", "DEEP", "SMART", "MODEL", "AGENT",
  "PROMPT", "TRAIN", "LEARN", "NEURAL", "CLOUD",
];

const PETS = [
  "PET", "DOG", "CAT", "VET", "FUR", "WAG", "PAWS", "BONE", "TAIL", "BARK",
  "MEOW", "HOUND", "TREAT",
];

const VEGAS = [
  "VEGAS", "STRIP", "NEON", "CASINO", "POKER", "SLOTS", "JACKPOT", "BONUS",
  "GOLD", "LUCK", "ACE", "DICE", "BET", "ODDS", "HIGH", "ROLL", "CHIP",
  "CARD", "HAND", "SHOW", "WIN", "BIG", "VIP", "FUN",
];

export const BUILT_IN_LISTS: readonly WordList[] = [
  {
    id: "core-3",
    name: "3-letter picks",
    description: "Short, punchy words that read well as an exchange code.",
    words: CORE_3,
    group: "Picks",
    builtIn: true,
  },
  {
    id: "core-4",
    name: "4-letter picks",
    description: "Short words that read well as the last four digits.",
    words: CORE_4,
    group: "Picks",
    builtIn: true,
  },
  {
    id: "tech",
    name: "Dev & tech",
    description: "Commands, tools, and jargon.",
    words: TECH,
    group: "Tech",
    builtIn: true,
  },
  { id: "trendy", name: "Trendy", description: "Modern internet slang.", words: TRENDY, group: "Themes", builtIn: true },
  { id: "luxury", name: "Luxury", description: "High-end and boutique.", words: LUXURY, group: "Themes", builtIn: true },
  { id: "money", name: "Money", description: "Finance, banking, and wealth.", words: MONEY, group: "Themes", builtIn: true },
  { id: "health", name: "Health", description: "Wellness and care.", words: HEALTH, group: "Themes", builtIn: true },
  { id: "realestate", name: "Real estate", description: "Homes, land, and property.", words: REALESTATE, group: "Themes", builtIn: true },
  { id: "startup", name: "Startup", description: "Founders and builders.", words: STARTUP, group: "Themes", builtIn: true },
  { id: "food", name: "Food & drink", description: "Restaurants, bars, and cafes.", words: FOOD, group: "Themes", builtIn: true },
  { id: "fitness", name: "Fitness", description: "Gyms and training.", words: FITNESS, group: "Themes", builtIn: true },
  { id: "auto", name: "Auto", description: "Cars, detailing, and repair.", words: AUTO, group: "Themes", builtIn: true },
  { id: "music", name: "Music", description: "Bands, studios, and audio.", words: MUSIC, group: "Themes", builtIn: true },
  { id: "travel", name: "Travel", description: "Trips, tours, and agencies.", words: TRAVEL, group: "Themes", builtIn: true },
  { id: "crypto", name: "Crypto", description: "Web3 and digital assets.", words: CRYPTO, group: "Themes", builtIn: true },
  { id: "outdoors", name: "Outdoors", description: "Nature and adventure.", words: OUTDOORS, group: "Themes", builtIn: true },
  { id: "ai", name: "AI", description: "Machine learning and automation.", words: AI, group: "Themes", builtIn: true },
  { id: "pets", name: "Pets", description: "Vets, groomers, and shops.", words: PETS, group: "Themes", builtIn: true },
  { id: "vegas", name: "Las Vegas", description: "Casino-floor vocabulary.", words: VEGAS, group: "Themes", builtIn: true },
  {
    id: "common-3",
    name: "Common words · 3",
    description: "Every 3-letter word in the bundled dictionary.",
    words: byLength(3),
    group: "Dictionary",
    builtIn: true,
  },
  {
    id: "common-4",
    name: "Common words · 4",
    description: "Every 4-letter word in the bundled dictionary.",
    words: byLength(4),
    group: "Dictionary",
    builtIn: true,
  },
];

export function listById(id: string): WordList | undefined {
  return BUILT_IN_LISTS.find((list) => list.id === id);
}
