# Vanity Phone Number Studio

Spell, test, and generate memorable vanity phone numbers. Type a word or a combo of words
(`PROGRAM`, `BIG CODE`, `mkdir`), watch the dial pad translate letters to digits in real time, and
browse every candidate for an area code.

Built with Next.js (App Router, Turbopack), React, TypeScript, and Tailwind CSS 4. Local-first:
favorites, recents, and custom word lists live in `localStorage`. No backend required. Open source
under MIT, and agent-native — a REST API plus an MCP server so agents can find, decode, and verify
numbers.

## Features

- **Dial pad** — a real T9 interface. Tap a key for a digit, tap a letter to spell.
- **Spell** — turns any word or phrase into its vanity number, and shows other *meaningful* words
  that share the same digits (e.g. `DEVCODE` → `DEV CODE`).
- **Combos** — builds every candidate from a 3-letter word × 4-letter word, or fits a single word
  next to wildcard digits (`702-XX-MKDIR`). Theme-pack chips set both lists in one tap.
- **Decode** — reverse lookup: give it `7764726`, get `PROGRAM` and every other dictionary reading.
- **Presets** — a curated Las Vegas tech list, re-rendered for whichever area code you pick.
- **Lists** — 20+ built-in word lists (picks, Dev & tech, and theme packs: Trendy, Luxury, Money,
  Health, Real Estate, Startup, Food, Fitness, Auto, Music, Travel, Crypto, Outdoors, AI, Pets,
  Las Vegas, plus common-word dictionaries). Duplicate a pack to make it your own.
- **Area codes** — search by city, state, or code, or tap **Use my location** to snap to the nearest
  area code. Curated labels (e.g. 702 → Las Vegas) override the raw dataset city.
- **Favorites / recents** — saved locally, ready to swap for an account-backed store.

## Getting started

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Scripts

| Command          | What it does                                       |
| ---------------- | -------------------------------------------------- |
| `pnpm dev`       | Start the dev server (Turbopack)                    |
| `pnpm build`     | Production build                                    |
| `pnpm start`     | Serve the production build                          |
| `pnpm test`      | Unit tests (Vitest)                                 |
| `pnpm e2e`       | End-to-end tests (Playwright)                       |
| `pnpm typecheck` | `tsc --noEmit`                                      |
| `pnpm lint`      | ESLint                                              |
| `pnpm verify`    | typecheck + lint + test + build (run before pushing) |

First e2e run needs a browser: `pnpm exec playwright install chromium`. `pnpm e2e` serves
the production build, so run `pnpm build` (or `pnpm verify`) once first.

## Architecture

```
app/                     Next.js App Router (layout, page, global styles)
components/studio/       UI: dial pad, phone screen, workspace, panels
components/ui/           Shared primitives (themed Select, …)
lib/vanity/              Pure domain logic — no React, no DOM
  keypad.ts              T9 digit/letter mapping
  encode.ts              text -> slots -> digits
  format.ts              NPA-NXX-XXXX and vanity grouping
  build.ts               derived, render-ready vanity view
  combos.ts              candidate generation from word slots
  decode.ts              digit -> word readings
  score.ts               memorability heuristic
data/                    Generated datasets (area codes, dictionary) + curated lists
lib/area-code-search.ts  City/state/code search + nearest-area-code by coordinate
lib/word-quality.ts      Filters noisy alternate readings using frequency rank
lib/storage/             Repository interface + localStorage implementation
scripts/generate-data.mjs  Regenerates data/dictionary.ts and data/area-codes.ts
```

The domain layer in `lib/vanity/` is framework-agnostic and unit-tested. The UI never computes phone
numbers directly; it calls the domain and renders the result.

## Agent API

An authenticated REST API under `/api/agent` so another agent (Claude Code, a script, a workflow) can
be told *"find me a cool available vanity number in Las Vegas for a tech business"* and do it.

```bash
# 1. Generate a key and add it to .env.local
openssl rand -hex 32          # -> VANITY_AGENT_API_KEY=…

# 2. Restart the server, then:
curl -s http://localhost:3000/api/agent                       # capability document
curl -s -X POST http://localhost:3000/api/agent/find \
  -H "Authorization: Bearer $VANITY_AGENT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"cool vanity number in Las Vegas for a tech business that is available","onlyAvailable":true,"limit":5}'
```

| Endpoint | Purpose |
| --- | --- |
| `GET /api/agent` | Capability document (endpoints, themes, examples) |
| `POST /api/agent/find` | Ranked vanity numbers from a `prompt` or explicit `words`; optional availability |
| `POST /api/agent/decode` | Number → dictionary readings |
| `POST /api/availability` | Single-number availability check |

Auth: `Authorization: Bearer $VANITY_AGENT_API_KEY` or `x-api-key`. If the key isn't set on the
server, the agent routes return `503` rather than allowing open access.

`/api/agent/find` resolves the brief itself: it detects the city → area code, maps keywords to a word
pack, generates candidates, and — when the prompt asks for "available" numbers (or
`onlyAvailable: true`) — checks the top candidates against Twilio's inventory.

### MCP

Two ways to connect an agent; both expose `find_vanity_numbers`, `find_available_numbers`,
`decode_number`, and `check_availability`.

**Remote (no install):** `POST /api/mcp` over Streamable HTTP, bearer-authenticated.

```json
{
  "mcpServers": {
    "vanity": {
      "type": "http",
      "url": "https://vanity-phone-number.vercel.app/api/mcp",
      "headers": { "Authorization": "Bearer YOUR_AGENT_KEY" }
    }
  }
}
```

**Local (stdio, self-hosted):** `scripts/mcp-server.mjs`. Copy `.mcp.json.example` to `.mcp.json`,
drop in your key, and restart your agent:

```json
{
  "mcpServers": {
    "vanity": {
      "command": "node",
      "args": ["scripts/mcp-server.mjs"],
      "env": { "VANITY_AGENT_API_KEY": "…" }
    }
  }
}
```

The stdio server talks to the running studio over HTTP (`VANITY_API_URL`, default
`http://localhost:3000`), so start `pnpm dev` first. `.mcp.json` is gitignored.

## Environment variables

Copy `.env.example` to `.env.local`. Everything is optional:

| Variable | Enables |
| --- | --- |
| `TWILIO_ACCOUNT_SID` + `TWILIO_API_KEY` + `TWILIO_API_SECRET` | Availability + discovery via Twilio (preferred: scoped, rotatable API key) |
| `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` | Availability via Twilio (alternative: full-account auth token) |
| `TELNYX_API_KEY` | Availability + discovery via Telnyx (second provider) |
| `VANITY_AGENT_API_KEY` | The `/api/agent/*` routes + MCP server |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL used by robots/sitemap/OpenAPI/catalog |
| `TWILIO_MOCK=true` / `TELNYX_MOCK=true` | Deterministic fake availability for local demos/tests |

### Bring your own Twilio keys

Self-hosters supply their own credentials via env — nothing is stored or shared. The hosted instance
reads the operator's keys server-side only. If you deploy publicly with your own Twilio account,
put a distributed rate limiter or WAF in front of `/api/availability`; the in-process limiter
(`lib/rate-limit.ts`) is per-instance and only blunts casual abuse.

### Availability checking

Availability is checked against **carrier inventory** — Twilio and/or Telnyx — not the whole market.
Set credentials for either: a scoped Twilio API Key (`TWILIO_ACCOUNT_SID`, `TWILIO_API_KEY`,
`TWILIO_API_SECRET`) or the account Auth Token, and/or `TELNYX_API_KEY`. Without any, every
availability path returns `configured: false` and makes zero network calls. Results are labeled
"available in <provider>'s inventory at query time," never a guarantee.

Two methods: an **exact** check per number (the UI card button) and a **`Contains`** pattern per word
(`POST /api/agent/verify`), which confirms every number that spells a word in one call.

### Bring your own carrier keys

Visitors can paste their own Twilio/Telnyx keys into **Carrier keys** (footer button). They are stored
only in the browser (localStorage) and sent to this app's own routes per request via `x-carrier-*`
headers; the server uses them transiently and never stores them. Requests using the server's own keys
are throttled aggressively (10 availability checks/min, 2 inventory scans/min per IP); BYO-key
requests get more headroom (60/min, 6/min). Availability works when either the server or the visitor
supplies keys — otherwise the UI tells you to add them.

## Agent readiness

Machine-discovery surfaces for AI agents:

| Path | What it is |
| --- | --- |
| `/llms.txt` | Curated guide for LLMs |
| `/openapi.json` | OpenAPI 3.1 description of the agent API |
| `/.well-known/api-catalog` | RFC 9727 API catalog |
| `/.well-known/mcp/server-card` | MCP server card |
| `/.well-known/agent.json` | A2A agent card |
| `/server.json` | MCP registry manifest |
| `/auth.md` | Machine-readable auth instructions |
| `/robots.txt`, `/sitemap.xml` | Crawler rules (AI bots allowed) and sitemap |
| `/docs` | Human-readable API guide |

## Adding auth + a database

The app is built so this is additive:

1. **Persistence** — everything the UI saves goes through `VanityRepository`
   (`lib/storage/types.ts`) via `createRepository()` (`lib/storage/index.ts`). Implement a
   server-backed version and return it from `createRepository`; no component changes.
2. **Auth** — drop in Better Auth, then pass the signed-in user id as the repository namespace
   (`createRepository({ namespace: userId })`) or let the server derive it.
3. **Database** — add Prisma + PostgreSQL with `SavedNumber` and `WordList` models. The Zod schemas
   in `lib/storage/schema.ts` are the validation contract on both ends.

## Analytics

Anonymous, cookieless [Vercel Web Analytics](https://vercel.com/docs/analytics), with an in-app opt-out
toggle in the footer. It honors Do Not Track on first load and is a no-op when self-hosted off Vercel.

## License

[MIT](LICENSE).

### Area codes and location

`data/area-codes.ts` bundles the NANP area-code list (MIT, from `node-areacodes`) with a primary
city/state and a representative coordinate. "Use my location" matches your browser coordinates to
the nearest area-code centroid (city-level accuracy, not neighborhood-level). Curated metro labels
live in `data/presets.ts` and win over the raw dataset. For finer local resolution you'd need a
ZIP→area-code mapping or a geocoding provider (licensing varies).

## Regenerating data

`data/dictionary.ts` (top-10k English words, 2–7 letters, plus dev/tech terms) and
`data/area-codes.ts` (NANP area codes) are generated:

```bash
node scripts/generate-data.mjs
```

Area codes merge the **NANPA-sourced in-service NPA list** (`area-codes-nanp`) with city/state labels
and coordinates from `node-areacodes` (MIT). Codes without a label are still valid, they just have no
city. The NANPA snapshot is dated 2024-03-30; regenerate periodically to pick up new area codes.
