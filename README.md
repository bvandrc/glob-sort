# glob-sort

**Glob files and sort them in a custom order.** A zero-dependency glob utility that sorts matched file paths by numeric folder prefixes (`01-`, `02-`) and your own string or regex ordering rules, with an alphabetical fallback.

Perfect for **controlling test execution order** in Cypress, Playwright, Vitest, Jest, or any test runner that takes a glob pattern — `fs.glob`, `fast-glob`, and `globby` all return paths in filesystem/alphabetical order, with no way to say "run `setup` first, `delete` last."

## Features

- **Numeric prefix sorting**: Automatically sorts folders and files with numeric prefixes (e.g., `01-`, `02-`)
- **Custom sort order**: Define ordering rules using strings or regex patterns
- **Alphabetical fallback**: Falls back to alphabetical sorting when no rules match
- **Path-aware**: Sorts intelligently at each folder level in the path hierarchy
- **Sync and async**: `sortedGlob()` and `sortedGlobSync()` — use the sync one in config files
- **TypeScript support**: Fully typed, ESM
- **Zero dependencies**: Uses Node.js native `fs.promises.glob`

## Installation

```bash
npm install glob-sort
# or
pnpm add glob-sort
# or
yarn add glob-sort
```

**Requirements**: Node.js 22+ (uses native `fs.promises.glob`)

## Quick Start

```ts
import { sortedGlob } from 'glob-sort'

// With custom ordering rules
const sortedSpecs = await sortedGlob('cypress/tests/**/*.spec.ts', {
  sortOrder: ['setup', 'new', 'edit', 'delete', 'view'],
})
```

## Usage

### Example: Cypress

```ts
import { sortedGlob } from 'glob-sort'

const specs = await sortedGlob('cypress/tests/**/*.spec*', {
  sortOrder: [
    // run in this order (anything not matching will come after, alphabetically)
    'setup', // Exact match (case-insensitive)
    /new(?!-special)/i, // e.g. "new.spec" before "new-special.spec"
    'new',
    'edit',
    /^delete/i, // starts with "delete"
    /^(?!.*history)/i, // does not contain "history" (place last in each folder)
    'view',
  ],
})
```

#### Example Cypress Configuration

```ts
import { defineConfig } from 'cypress'
import { sortedGlobSync } from 'glob-sort'

export default defineConfig({
  e2e: {
    specPattern: sortedGlobSync('cypress/tests/**/*.spec*', {
      sortOrder: ['setup', 'new', 'edit', /^delete.*/, 'view'],
    }),
    // ...other config
  },
})
```

#### Example Playwright Configuration

```ts
import { defineConfig } from '@playwright/test'
import { sortedGlobSync } from 'glob-sort'

export default defineConfig({
  // Playwright runs files in the order listed when fullyParallel is off
  testMatch: sortedGlobSync('tests/**/*.spec.ts', {
    sortOrder: ['setup', 'new', 'edit', /^delete/i],
  }),
})
```

## How It Works

The sorting algorithm applies three levels of ordering at each folder depth:

1. **Numeric prefix priority**: Folders/files starting with numbers (e.g., `01-`, `02-`) sort numerically first
2. **Custom sort order**: Matches against your `sortOrder` array in the order specified
   - **String rules**: Match case-insensitively if the string appears anywhere in the filename
   - **Regex rules**: Test against the filename using the provided pattern
3. **Alphabetical fallback**: Items that don't match any rules sort alphabetically

### Detailed Example

Given this configuration:

```ts
const specs = sortedGlobSync('cypress/tests/**/*.spec.ts', {
  sortOrder: [
    'setup',
    'booking',
    'entree',
    'appetizer',
    'user',
    /^(?!.*history)/i, // Exclude "history" (pushes to end)
    /new(?!-?special)/i, // "new" before "new-special"
    'new',
    'edit',
    'view',
    'print',
  ],
})
```

<table>
<tr>
<th width="50%">Before (File System Order)</th>
<th width="50%">After (Custom Sort)</th>
</tr>
<tr>
<td>

```
01-widget-cards/
    booking-calendar.spec.ts
    entrees.spec.ts
    setup.spec.ts
    upcoming-bookings.spec.tsx
02-table-pages/
    01-entree-dinner/
        entree-dinner-table.spec.ts
        entree-flavors-table.spec.tsx
    02-booking/
        bookings-history-table.spec.ts
        bookings-table.spec.tsx
    customers-table.spec.ts
    entree-lunch-table.spec.ts
    users-table.spec.ts
03-view-pages/
    print-booking.spec.ts
    print-entree-dinner.spec.ts
    setup.spec.ts
    view-appetizer-count.spec.ts
    view-appetizer-supplier.spec.ts
    view-booking.spec.ts
    view-entree-dinner.spec.ts
    view-entree-lunch.spec.ts
    view-user.spec.ts
04-forms/
    booking-form/
        clone-booking.spec.ts
        edit-booking.spec.ts
        new-booking.spec.ts
        new-special-booking.spec.ts
        setup.spec.ts
    entree-dinner/
        edit-entree-dinner.spec.ts
        new-entree-dinner.spec.ts
    entree-lunch/
        edit-entree-lunch.spec.ts
        new-entree-lunch.spec.ts
    user/
        edit-user.spec.ts
    cake-frosting-input.spec.ts
    cake-order-input.spec.ts
misc-components/
    booking-status.spec.ts
    layout.spec.ts
    site-info-button.spec.ts
    user-info-button.spec.ts
```

</td>
<td>

```diff
01-widget-cards/
+-  setup.spec.tsx
+-  booking-calendar.spec.ts
+-  upcoming-bookings.spec.tsx
+-  entrees.spec.ts
02-table-pages/
    01-entree-dinner/
        entree-dinner-table.spec.ts
        entree-flavors-table.spec.tsx
    02-booking/
+-      bookings-table.spec.tsx
+-      bookings-history-table.spec.ts
+-  entree-lunch-table.spec.ts
+-  users-table.spec.ts
+-  customers-table.spec.ts
03-view-pages/
+-  setup.spec.tsx
+-  view-booking.spec.ts
+-  print-booking.spec.ts
+-  view-entree-dinner.spec.ts
+-  view-entree-lunch.spec.ts
+-  print-entree-dinner.spec.ts
+-  view-appetizer-count.spec.ts
+-  view-appetizer-supplier.spec.ts
    view-user.spec.ts
04-forms/
    booking-form/
+-      setup.spec.tsx
+-      new-booking.spec.ts
+-      new-special-booking.spec.ts
+-      edit-booking.spec.ts
+-      clone-booking.spec.ts
    entree-dinner/
+-      new-entree-dinner.spec.ts
+-      edit-entree-dinner.spec.ts
    entree-lunch/
+-      new-entree-lunch.spec.ts
+-      edit-entree-lunch.spec.ts
    user/
        edit-user.spec.ts
    cake-frosting-input.spec.ts
    cake-order-input.spec.ts
misc-components/
    booking-status.spec.ts
+-  user-info-button.spec.ts
+-  layout.spec.ts
+-  site-info-button.spec.ts
```

</td>
</tr><tr>
<th colspan="2">Actual output of the function<br/><i>Can be passed directly to Cypress specPattern config, or other test environment config</i></th>
</tr>
<tr>
<td colspan="2">

```
01-widget-cards/setup.spec.ts
01-widget-cards/booking-calendar.spec.ts
01-widget-cards/upcoming-bookings.spec.tsx
01-widget-cards/entrees.spec.ts
02-table-pages/01-entree-dinner/entree-dinner-table.spec.ts
02-table-pages/01-entree-dinner/entree-flavors-table.spec.tsx
02-table-pages/02-booking/bookings-table.spec.tsx
02-table-pages/02-booking/bookings-history-table.spec.ts
02-table-pages/entree-lunch-table.spec.ts
02-table-pages/users-table.spec.ts
02-table-pages/customers-table.spec.ts
03-view-pages/setup.spec.ts
03-view-pages/view-booking.spec.ts
03-view-pages/print-booking.spec.ts
03-view-pages/view-entree-dinner.spec.ts
03-view-pages/view-entree-lunch.spec.ts
03-view-pages/print-entree-dinner.spec.ts
03-view-pages/view-appetizer-count.spec.ts
03-view-pages/view-appetizer-supplier.spec.ts
03-view-pages/view-user.spec.ts
04-forms/booking-form/setup.spec.ts
04-forms/booking-form/new-booking.spec.ts
04-forms/booking-form/new-special-booking.spec.ts
04-forms/booking-form/edit-booking.spec.ts
04-forms/booking-form/clone-booking.spec.ts
04-forms/entree-dinner/new-entree-dinner.spec.ts
04-forms/entree-dinner/edit-entree-dinner.spec.ts
04-forms/entree-lunch/new-entree-lunch.spec.ts
04-forms/entree-lunch/edit-entree-lunch.spec.ts
04-forms/user/edit-user.spec.ts
04-forms/cake-frosting-input.spec.ts
04-forms/cake-order-input.spec.ts
misc-components/booking-status.spec.ts
misc-components/user-info-button.spec.ts
misc-components/layout.spec.ts
misc-components/site-info-button.spec.ts
```

</td>
</tr>
</table>

## API

### `sortedGlob(pattern, options?)`

Returns a Promise that resolves to an array of sorted file paths.

### `sortedGlobSync(pattern, options?)`

Returns an array of sorted file paths.

#### Parameters

- **`pattern`** (`string | string[]`): Glob pattern(s) to match files (e.g., `'cypress/tests/**/*.spec.ts*'`)
- **`options`** (`object`, optional): Extends all [Node.js glob options](https://nodejs.org/api/fs.html#fspromisesglobpattern-options) with:
  - **`sortOrder`** (`Array<string | RegExp>`, optional): Custom ordering rules. Strings match case-insensitively via inclusion; RegExp patterns test against path segments.

#### Returns

Array of sorted file paths — `Promise<string[]>` from `sortedGlob`, `string[]` from `sortedGlobSync`.

## FAQ

**How do I control the order Cypress runs spec files in?** Pass `sortedGlobSync(...)` to `specPattern` in `cypress.config.ts`. Cypress runs specs in the order the array is given (with `experimentalRunAllSpecs` / `cypress run`), so the sorted array becomes your run order.

**Does this work with Playwright / Vitest / Jest?** Yes — anywhere a glob result array can be handed to the runner (Playwright `testMatch`, Vitest `include`, Jest `testMatch`). The library just returns sorted paths.

**How is this different from `glob`, `globby`, or `fast-glob`?** Those return matches in filesystem or alphabetical order. `glob-sort` adds numeric-prefix awareness and user-defined string/regex ordering rules applied at every folder level, with no dependencies.

**Does it sort `10-` after `9-`?** Yes. Numeric prefixes are parsed as numbers, so `9-foo` comes before `10-foo` (unlike plain alphabetical sorting).

## License

MIT
