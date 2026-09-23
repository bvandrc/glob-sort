## Project

`glob-sort` — globs files and sorts them in a custom order, by numeric folder prefixes and caller-supplied string/regex rules. Useful for controlling test execution order in Cypress, Playwright, or Vitest. Published to npm, bundled by tsdown.

- **Layout**: `src/sorted-glob.ts` is the whole package; unit tests live in `src/__tests__/`.
- **Zero runtime dependencies** — keep `dependencies` empty.

## Code conventions

Conventions live outside this file, synced from https://github.com/bvandrc/bvandrc-conventions — follow all of them:

@conventions/typescript.md — language-level TypeScript/JavaScript rules
@conventions/ts-unit-testing.md — unit test layout, naming, fixtures, and assertions
@conventions/all.md — practice for every repo: branches, formatting, markdown, PR reviews

## Commands

- `pnpm build` — tsdown bundle. `pnpm start` — tsdown in watch mode.
- `pnpm format` — Biome check/fix. `pnpm check` — the full gate: Biome plus `pnpm ts:check` (`tsc --noEmit`); it's what CI runs.
- `pnpm test` — Vitest. `pnpm test:watch`, `pnpm test:coverage`.

## Repo conventions

- **Package manager**: pnpm. `npm install` writes a competing `package-lock.json` that CI ignores.
- **Convention files**: `conventions/` is synced from https://github.com/bvandrc/bvandrc-conventions by `.github/workflows/sync-conventions.yml` and overwritten on every sync. Edit a rule upstream, never in that directory.
