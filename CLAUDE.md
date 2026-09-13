# CLAUDE.md — Vanity Phone Number Studio

Local-first Next.js app that turns words, word combos, and dev terms into vanity phone numbers.

## Stack

| Category   | Technology                                      |
| ---------- | ----------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack)              |
| Runtime    | React 19                                        |
| Language   | TypeScript 5 (strict)                           |
| Styling    | Tailwind CSS 4 (`@theme inline` tokens)          |
| Icons      | lucide-react                                    |
| Validation | Zod 4                                           |
| Testing    | Vitest (unit), Playwright (e2e)                 |
| Package mgr| pnpm                                            |

## Commands

```bash
pnpm dev        # dev server
pnpm verify     # typecheck + lint + test + build — run before considering work done
pnpm test       # unit tests
pnpm e2e        # Playwright (needs: pnpm exec playwright install chromium)
```

## Layout

```
app/                 App Router entry + API routes (agent, availability) + readiness routes
components/studio/   Client UI. studio-context.tsx owns all state.
  panels/            One file per workspace tab
components/ui/       Shared primitives (themed Select)
lib/vanity/          PURE domain logic — no React, no DOM, fully unit-tested
lib/agent/           Agent API internals: auth, intent parsing, find, Twilio verification
lib/area-code-search.ts  City/state/code search + nearest area code
lib/word-quality.ts  Filters noisy alternate readings (frequency + curated lists)
lib/rate-limit.ts    In-process token-bucket limiter for public routes
lib/storage/         Repository interface + localStorage impl (DB-ready seam)
data/                GENERATED datasets + hand-curated word lists/presets
scripts/generate-data.mjs
```

## Invariants

- **Domain logic stays pure.** `lib/vanity/` must not import React, the DOM, or `data/`. If a new
  behavior needs a dataset, pass it in as an argument.
- **All UI state lives in `StudioProvider`.** Panels are presentational; they read/write through
  `useStudio()`. The single source of truth for the dialer is `entry` (raw text); slots, grouping,
  and the built number are derived.
- **Persistence goes through `VanityRepository`.** Never call `localStorage` from a component —
  including preferences (the analytics opt-out lives there).
- **`data/dictionary.ts` and `data/area-codes.ts` are generated** — edit
  `scripts/generate-data.mjs`, not those files.
- **Secrets stay server-side.** Twilio credentials are read only in `lib/agent/twilio.ts`; never
  return them to the client or commit them. `.env.local` and `.mcp.json` are gitignored.
- **Availability is provider-scoped.** Twilio's inventory only — label results honestly.
- Area-code label overrides for major metros live in `data/presets.ts` (`AREA_CODE_SUGGESTIONS`),
  which wins over the generated city data.

## Conventions

- Dark-first. Colors come from CSS variables mapped in `app/globals.css` (`bg-surface`, `text-ink`,
  `text-accent`, `border-border`, …). Don't hardcode hex in components.
- Prettier: no semicolons? No — semicolons on, double quotes, 100 cols, trailing commas.
- Keep components small and colocated with the studio feature.
- Numbers are always formatted by the domain (`formatNumeric`), never by ad-hoc string slicing.

## Notes for agents

- `next.config.ts` uses the default Turbopack build. Read the bundled Next.js docs in
  `node_modules/next/dist/docs/` before reaching for an unfamiliar API — this major version has
  breaking changes from training data (async `params`/`searchParams`, Turbopack by default, etc.).
