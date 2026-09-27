# TypeScript unit testing conventions

Builds on the language-level rules in `./typescript.md`, and the suite-agnostic rules in `./ts-testing-all.md` — follow those too.

- **Layout**: A unit test sits in a `__tests__` folder beside the module it covers, named for it (`date-utils.ts` → `__tests__/date-utils.test.ts`). One `describe` per exported thing being tested.
- **Where a case belongs**: A case covers the module its file names, not the modules that one uses. Where it would move to a dependency's own test file and still read the same, it belongs there — restated at a consumer it has to be written again at the next one, and leaves the dependency uncovered the moment anything else reaches for it. What stays with the consumer is what the consumer adds: that it calls the dependency at all, and whatever it binds, defaults, or derives on the way.
- **Test imports**: A `__tests__` file reaches the module under test relatively (`../date-utils`) — it sits right there, and the pairing should read that way. Everything else it imports goes through the repo's TS path aliases, never a relative climb out of the folder.
