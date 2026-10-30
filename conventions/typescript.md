# TypeScript / JavaScript conventions

Language-level rules, independent of framework or project. Framework-specific conventions live in their own files alongside this one and build on it.

- **File naming**: kebab-case for utils and plain modules (`auth-utils.ts`).
- **Modules**
  - **Exports**: Named exports. No default exports, unless something requires one.
  - **Type-only imports**: Use `import type` for imports only used as types.
- **Constant objects**:
  - UPPER_CASE for the constant's name.
  - UPPER_CASE for keys that name entries (namespace/enum-style, e.g. `ROUTES.HOME`, `SELECTORS.TASK_FORM.SUBMIT_BTN`).
  - camelCase for keys that are typed properties of an entry, where the casing is required to satisfy a type declared elsewhere.
  - camelCase for function-valued keys (e.g. `SELECTORS.TASK_CARD.rankFieldBadge(field)`).
- **Exhaustive records**: Any record keyed by a union — constant or built at runtime — should be declared with `satisfies Record<UnionKeys, ValuesType>` so a missing key is a type error.
- **Comments/JSDoc**: Describe _what_ and _why_ from the caller's perspective. Don't restate implementation or repeat what the type signature conveys. Keep to 1–2 lines. No hedge prefixes.
- **Tooling**
  - **Linting and formatting**: Biome is the linter _and_ formatter — no eslint/prettier here. Shared rules live in `./biome.base.json`, which the repo's own `biome.json` extends; keep repo-specific settings in that `biome.json` rather than editing the synced base.
- **Available packages**: Every TS repo should have these installed — check them before writing your own.
  - **[es-toolkit](https://es-toolkit.dev)**: Utility functions, like a modern lodash (e.g. `omit`, `pick`, `groupBy`, `debounce`, and more). Often far more readable than the builtin equivalents, so reach for them.
  - **[type-fest](https://github.com/sindresorhus/type-fest)**: Utility types (e.g. `SetOptional`, `SetRequired`, `Simplify`, `ValueOf`, `PartialDeep`, `MergeExclusive`, and more). Reach for these before hand-rolling a mapped or conditional type.
