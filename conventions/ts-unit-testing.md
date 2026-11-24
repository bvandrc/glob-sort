# TypeScript unit testing conventions

Builds on `./typescript.md` and `./ts-testing-all.md`; follow those too.

- **Layout**: A unit test sits in a `__tests__` folder beside the module it covers, named for it (`date-utils.ts` → `__tests__/date-utils.test.ts`). One `describe` per exported thing tested.
- **Where a case belongs**: A case covers the module its file names. One that would read the same in a dependency's own test file belongs there. The consumer's tests cover what it adds: that it calls the dependency at all, and what it binds, defaults, or derives on the way.
  - **Child components**: Likewise, a component's tests leave out what a child's own tests check (like the effect of a prop it only passes on), and cover its own state, conditions, and computed values.
- **Test imports**: The module under test is imported relatively (`../date-utils`). Everything else goes through the repo's TS path aliases, never a relative climb out of the folder.
