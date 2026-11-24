# TypeScript testing conventions (all suites)

Builds on `./typescript.md`; follow it too. Holds for every TypeScript test suite, Vitest and Playwright alike.

- **Frontend testing**
  - **Unit vs end-to-end**: Where a repo has both, a pure function's edge cases go in its unit test, especially ones that would need a large setup through the UI. End-to-end keeps the wiring: that the UI calls the function and renders what it returns. A case whose result changes what the user sees, in a way worth pinning down, still earns an end-to-end test.
  - **Test ID registry**: Every `data-testid` is defined in one registry before it is used, and every suite imports that one: `shared/test-support/selectors.ts` in a repo with unit and end-to-end tests, `playwright/support/constants/selectors.ts` where end-to-end is the only suite.
    - Nest by component.
    - Name a container's own testid `SELF`.
    - A selector only one test would reach for, being odd or complicated, can stay in that test. One another test could want goes in the registry the first time it is written.
  - **Layout choices**: Don't test plain layout, like where an element sits or what it's inside. Test user actions, edge cases, and state changes instead.
  - **Locators**: `data-testid` first. Text, role, and class locators only where a testid isn't an option: third-party markup, or an assertion whose point is the visible text or accessible role.
- **Destructuring from the Selectors registry**: Pull the top namespace out almost always (`const { SAVE_DIALOG } = SELECTORS`). Go on down to a leaf where either holds:
  - **The name alone says it's a selector** in any suite (`CONFIRM_DELETE_DIALOG`).
  - **The scope is narrow enough** to show the cluster is selectors: a file about one component, or the one `describe` about it. In a `ConfirmDeleteDialog` suite, `const { CONFIRM_BTN, CANCEL_BTN } = CONFIRM_DELETE_DIALOG` reads fine.
  - Leave the last step dotted where the name is generic (`SELF`, `DIALOG`), or the destructure would gather unrelated groups at module scope. It's a judgment call: stop where a name would read as any other test constant.
- **Naming a test's values**: `UPPER_CASE` for a constant fixture: data a builder produced, or a literal pinned as reference data. `camelCase` for everything else: what the module under test returned, what constructs the subject, and locals inside a fixture helper. Being returned from a function doesn't earn caps.
- **Naming a test's helpers**: A helper declared in a test file is named verb first for what it does, with the prefix for its kind, so it reads apart from the source functions the file imports.
  - `render*`: renders the subject. Vitest only.
  - `build*`: returns a constant fixture (object, array, or primitive) used as input or reference data, with no UI query or side effect.
  - `create*`: makes something with side effects on the subject or a fixture.
  - `mock*`: a stand-in (`vi.fn()`, a Playwright route mock).
  - `get*`, `query*`, `find*`: wraps the matching Testing Library query or Playwright locator. `get*` also covers pulling or transforming something out of the input, or a fixture in scope.
  - An action takes its own verb (`clickRow`, `typeName`, `submitForm`).
  - A helper that wraps one function and returns its result takes that function's name (`parse` for `parseConfig`), most of all where it's the function under test.
  - Exceptions happen, but never a bare noun (`list`, `row`), or a name a type or domain function already owns.
- **Asserting on an object**: Consecutive `expect`s on one object's properties become one `expect(obj).toMatchObject({ ... })`, with `expect.any(Date)` and friends for values the test can't name. What a per-assertion message would have said goes in a line comment beside the property.
- **Asserting over a list of values**: Loop rather than repeat the assertion, passing the value as the assertion message. A comment beside each input says why it's in the list.
- **Fixture TS types**: Build fixtures with the source's own types, never a looser local shape or an `as` cast; `satisfies` checks a literal without widening it. A value the types deliberately refuse gets `// @ts-expect-error` and a line on what it tests.
