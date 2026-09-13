# Contributing

Thanks for taking a look. This is a small, local-first tool, so contributions are easy to run and
easy to review.

## Setup

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm verify         # typecheck + lint + test + build — run before opening a PR
pnpm exec playwright install chromium
pnpm e2e            # serves the production build; run pnpm build first
```

## Where things live

- `lib/vanity/` — pure domain logic. **No React, no DOM, no `data/` imports.** If a feature needs a
  dataset, pass it in as an argument. Everything here is unit-tested.
- `components/studio/` — client UI. All state lives in `studio-context.tsx`; panels are presentational.
- `lib/storage/` — persistence behind the `VanityRepository` interface. Never call `localStorage`
  from a component.
- `lib/agent/` — the authenticated agent API internals (Twilio verification, intent parsing, search).
- `data/` — `dictionary.ts` and `area-codes.ts` are **generated**; edit `scripts/generate-data.mjs`
  and run `node scripts/generate-data.mjs` instead.
- `lib/agent/intent.ts` + `data/word-lists.ts` — theme word packs.

## Most-wanted contributions

1. **Word packs.** Add or improve a themed list in `data/word-lists.ts` (`BUILT_IN_LISTS`). Each pack
   needs words of several lengths (3 and 4 letters are what the combo engine uses most). Keep them
   real, memorable, and safe for work.
2. **Area-code labels.** Curated labels live in `data/presets.ts` (`AREA_CODE_SUGGESTIONS`) and win
   over the generated dataset city.
3. **Bug reports / edge cases** in the encode/decode/combos logic. Add a failing unit test when you
   can.

## Pull requests

- Keep the diff focused; one concern per PR.
- Run `pnpm verify` (typecheck + lint + test + build) and make sure it's green.
- New domain behavior needs a unit test in `lib/vanity/*.test.ts`.
- Match the existing style: TypeScript strict, double quotes, semicolons, 100 columns, dark-first
  Tailwind tokens (no hardcoded hex).

## Security

Do not open a public issue for a vulnerability — see [SECURITY.md](SECURITY.md).
