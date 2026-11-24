# TypeScript / JavaScript conventions

Language-level rules, independent of framework or project. Framework-specific files build on this one.

- **File naming**: kebab-case for utils and plain modules (`auth-utils.ts`).
- **Modules**
  - **Exports**: Named exports. No default exports unless something requires one.
  - **Type-only imports**: `import type` for imports used only as types.
- **Constant objects**: UPPER_CASE for the constant's name and for keys that name entries (`ROUTES.HOME`, `SELECTORS.TASK_FORM.SUBMIT_BTN`). camelCase for function-valued keys (`SELECTORS.TASK_CARD.rankFieldBadge(field)`), and for keys whose casing a type declared elsewhere requires.
- **Exhaustive records**: Declare any record keyed by a union, constant or built at runtime, with `satisfies Record<UnionKeys, ValuesType>`, so a missing key is a type error.
- **Comments/JSDoc**: Describe what and why from the caller's side, not the implementation or what the signature already says. 1–2 lines, no hedge prefixes.
- **Tooling**
  - **Linting and formatting**: Biome does both; no eslint or prettier. Shared rules live in `./biome.base.jsonc`, which the repo's `biome.json` extends. Put repo-specific settings in `biome.json`, never in the synced base.
  - **Format script**: `format` in `package.json`, run with the repo's package manager.
  - **Dependency ranges**: Unless told otherwise, a caret range down to the axis semver treats as breaking and no further (`^8` for 1.0+, `^0.45` for 0.x), unless a higher floor has been found to be needed. Trim the full `^8.23.1` installers write: the lockfile pins the build.
- **Available packages**: Every TS repo should have these installed. Check them before writing your own.
  - **[es-toolkit](https://es-toolkit.dev)**: Utility functions. Often far more readable than the builtin equivalents, so reach for them.
  - **[type-fest](https://github.com/sindresorhus/type-fest)**: Utility types. Reach for one before hand-rolling a mapped or conditional type.
  - **[ts-extras](https://github.com/sindresorhus/ts-extras)**: Typed builtins (`objectKeys`, `objectEntries`, `objectFromEntries`, `arrayIncludes`, `setHas`) and the guards and assertions es-toolkit lacks (`keyIn`, `assertNever`, `assertError`). Reach for one before casting a builtin's result or writing a one-off `value is X` predicate, but where es-toolkit has a match (`isNotNil`, `isString`), use es-toolkit's.
