import path from 'node:path'
import { type NestedDirectoryJSON, vol } from 'memfs'

import type { SortedGlobOptions } from '../sortedGlob'
import { sortedGlob, sortedGlobSync } from '../sortedGlob'

// The module under test globs through both faces of `node:fs`, so both are
// pointed at the in-memory volume. memfs implements the fs API rather than
// patching Node's internals the way mock-fs does, which is what broke on Node 26.
vi.mock('node:fs', async () => {
  const { fs } = await import('memfs')
  return { ...fs, default: fs }
})

vi.mock('node:fs/promises', async () => {
  const { fs } = await import('memfs')
  return { ...fs.promises, default: fs.promises }
})

/** Replaces the mock file tree the patterns under test are globbed against. */
const setMockFiles = (tree: NestedDirectoryJSON) => {
  vol.reset()
  // memfs roots the volume at `/` but resolves a relative pattern against the
  // process, so a tree left at that default matches `cypress/tests/**` not at all.
  vol.fromNestedJSON(tree, process.cwd())
}

/** A tree given as plain paths, for the cases that isolate one ordering rule. */
const setMockPaths = (...paths: string[]) => {
  vol.reset()
  vol.fromJSON(
    Object.fromEntries(paths.map((p) => [p, MOCK_CONTENT])),
    process.cwd()
  )
}

/** The paths as the sorter returns them, so a case can compare against literals. */
const normalized = (paths: string[]) => paths.map((p) => path.normalize(p))

type SortOrder = NonNullable<SortedGlobOptions['sortOrder']>

const MOCK_CONTENT = 'content'

const SORT_ORDER_README = [
  'setup',
  'booking',
  'entree',
  'appetizer',
  'user',
  /^(?!.*history)/i, // does not contain (place these last, in each folder)
  /new(?!-?special)/i, // "new" before "new-special"
  'new',
  'edit',
  'view',
  'print',
] satisfies SortOrder

/** Numbered folders alongside unnumbered ones, which sort after them. */
/** Numbered folders within numbered folders, so ordering applies at each level. */
/** The tree the README's worked example is written against. */
const README_TREE = {
  '01-widget-cards': {
    'booking-calendar.spec.ts': '',
    'entrees.spec.ts': '',
    'setup.spec.ts': '',
    'upcoming-bookings.spec.tsx': '',
  },
  '02-table-pages': {
    '01-entree-dinner': {
      'entree-dinner-table.spec.ts': '',
      'entree-flavors-table.spec.tsx': '',
    },
    '02-booking': {
      'bookings-history-table.spec.ts': '',
      'bookings-table.spec.tsx': '',
    },
    'customers-table.spec.ts': '',
    'entree-lunch-table.spec.ts': '',
    'users-table.spec.ts': '',
  },
  '03-view-pages': {
    'print-booking.spec.ts': '',
    'print-entree-dinner.spec.ts': '',
    'setup.spec.ts': '',
    'view-appetizer-count.spec.ts': '',
    'view-appetizer-supplier.spec.ts': '',
    'view-booking.spec.ts': '',
    'view-entree-dinner.spec.ts': '',
    'view-entree-lunch.spec.ts': '',
    'view-user.spec.ts': '',
  },
  '04-forms': {
    'booking-form': {
      'clone-booking.spec.ts': '',
      'edit-booking.spec.ts': '',
      'new-booking.spec.ts': '',
      'new-special-booking.spec.ts': '',
      'setup.spec.ts': '',
    },
    'entree-dinner': {
      'edit-entree-dinner.spec.ts': '',
      'new-entree-dinner.spec.ts': '',
    },
    'entree-lunch': {
      'edit-entree-lunch.spec.ts': '',
      'new-entree-lunch.spec.ts': '',
    },
    user: {
      'edit-user.spec.ts': '',
    },
    'cake-frosting-input.spec.ts': '',
    'cake-order-input.spec.ts': '',
  },
  'misc-components': {
    'booking-status.spec.ts': '',
    'layout.spec.ts': '',
    'site-info-button.spec.ts': '',
    'user-info-button.spec.ts': '',
  },
} satisfies NestedDirectoryJSON

const README_EXPECTED = [
  '01-widget-cards/setup.spec.ts',
  '01-widget-cards/booking-calendar.spec.ts',
  '01-widget-cards/upcoming-bookings.spec.tsx',
  '01-widget-cards/entrees.spec.ts',
  '02-table-pages/01-entree-dinner/entree-dinner-table.spec.ts',
  '02-table-pages/01-entree-dinner/entree-flavors-table.spec.tsx',
  '02-table-pages/02-booking/bookings-table.spec.tsx',
  '02-table-pages/02-booking/bookings-history-table.spec.ts',
  '02-table-pages/entree-lunch-table.spec.ts',
  '02-table-pages/users-table.spec.ts',
  '02-table-pages/customers-table.spec.ts',
  '03-view-pages/setup.spec.ts',
  '03-view-pages/view-booking.spec.ts',
  '03-view-pages/print-booking.spec.ts',
  '03-view-pages/view-entree-dinner.spec.ts',
  '03-view-pages/view-entree-lunch.spec.ts',
  '03-view-pages/print-entree-dinner.spec.ts',
  '03-view-pages/view-appetizer-count.spec.ts',
  '03-view-pages/view-appetizer-supplier.spec.ts',
  '03-view-pages/view-user.spec.ts',
  '04-forms/booking-form/setup.spec.ts',
  '04-forms/booking-form/new-booking.spec.ts',
  '04-forms/booking-form/new-special-booking.spec.ts',
  '04-forms/booking-form/edit-booking.spec.ts',
  '04-forms/booking-form/clone-booking.spec.ts',
  '04-forms/entree-dinner/new-entree-dinner.spec.ts',
  '04-forms/entree-dinner/edit-entree-dinner.spec.ts',
  '04-forms/entree-lunch/new-entree-lunch.spec.ts',
  '04-forms/entree-lunch/edit-entree-lunch.spec.ts',
  '04-forms/user/edit-user.spec.ts',
  '04-forms/cake-frosting-input.spec.ts',
  '04-forms/cake-order-input.spec.ts',
  'misc-components/booking-status.spec.ts',
  'misc-components/user-info-button.spec.ts',
  'misc-components/layout.spec.ts',
  'misc-components/site-info-button.spec.ts',
].map((p) => path.normalize(p))

describe('sortedGlob', () => {
  afterEach(() => {
    vol.reset()
  })

  it("returns the order the README's example documents", async () => {
    setMockFiles(README_TREE)

    const output = await sortedGlob('./**/*.spec*', {
      sortOrder: SORT_ORDER_README,
    })

    expect(output).toEqual(README_EXPECTED)
  })

  it('orders numeric prefixes by value, not by their digits', async () => {
    setMockPaths('2-b/a.spec.ts', '10-c/a.spec.ts', '1-a/a.spec.ts')

    // Alphabetically `10-c` would come second; the whole point of the prefix
    // is that it does not.
    expect(await sortedGlob('**/*.spec.ts')).toEqual(
      normalized(['1-a/a.spec.ts', '2-b/a.spec.ts', '10-c/a.spec.ts'])
    )
  })

  it('reads the prefix off a file as readily as off a folder', async () => {
    setMockPaths('2-b.spec.ts', '10-c.spec.ts', '1-a.spec.ts')

    expect(await sortedGlob('*.spec.ts')).toEqual(
      normalized(['1-a.spec.ts', '2-b.spec.ts', '10-c.spec.ts'])
    )
  })

  it('puts everything unnumbered after everything numbered', async () => {
    setMockPaths('zz/a.spec.ts', '9-later/a.spec.ts', 'aa/a.spec.ts')

    expect(await sortedGlob('**/*.spec.ts')).toEqual(
      normalized(['9-later/a.spec.ts', 'aa/a.spec.ts', 'zz/a.spec.ts'])
    )
  })

  it('falls back to alphabetical when no rules are given', async () => {
    setMockPaths('b.spec.ts', 'a.spec.ts', 'c.spec.ts')

    expect(await sortedGlob('*.spec.ts')).toEqual(
      normalized(['a.spec.ts', 'b.spec.ts', 'c.spec.ts'])
    )
  })

  it('matches a string rule anywhere in the segment, ignoring case', async () => {
    setMockPaths('alpha.spec.ts', 'zebra-NEW.spec.ts')

    expect(await sortedGlob('*.spec.ts', { sortOrder: ['new'] })).toEqual(
      normalized(['zebra-NEW.spec.ts', 'alpha.spec.ts'])
    )
  })

  it('matches a regular expression rule by testing it', async () => {
    setMockPaths('alpha.spec.ts', 'zebra-new.spec.ts')

    // A regex is not lowercased first, so its own flags decide the casing.
    expect(await sortedGlob('*.spec.ts', { sortOrder: [/^zebra/] })).toEqual(
      normalized(['zebra-new.spec.ts', 'alpha.spec.ts'])
    )
  })

  it('lets the earlier rule win over a later one', async () => {
    setMockPaths('new.spec.ts', 'edit.spec.ts')

    expect(
      await sortedGlob('*.spec.ts', { sortOrder: ['edit', 'new'] })
    ).toEqual(normalized(['edit.spec.ts', 'new.spec.ts']))
  })

  it('sorts what no rule matched alphabetically, after what did', async () => {
    setMockPaths('b.spec.ts', 'new.spec.ts', 'a.spec.ts')

    expect(await sortedGlob('*.spec.ts', { sortOrder: ['new'] })).toEqual(
      normalized(['new.spec.ts', 'a.spec.ts', 'b.spec.ts'])
    )
  })

  it('applies a rule to the segment it matches, not the whole path', async () => {
    setMockPaths('alpha/z.spec.ts', 'beta/a.spec.ts')

    // `beta` wins on the folder segment, so its file comes first even though
    // the paths compare the other way alphabetically.
    expect(await sortedGlob('**/*.spec.ts', { sortOrder: ['beta'] })).toEqual(
      normalized(['beta/a.spec.ts', 'alpha/z.spec.ts'])
    )
  })

  it('sorts the union of several patterns as one list', async () => {
    setMockPaths('2-b/a.spec.ts', '1-a/a.test.ts')

    expect(await sortedGlob(['**/*.spec.ts', '**/*.test.ts'])).toEqual(
      normalized(['1-a/a.test.ts', '2-b/a.spec.ts'])
    )
  })

  it('returns nothing when the pattern matches nothing', async () => {
    setMockPaths('a.spec.ts')

    expect(await sortedGlob('**/*.nope')).toEqual([])
  })
})

describe('sortedGlobSync', () => {
  afterEach(() => {
    vol.reset()
  })

  it('returns what the async form returns', () => {
    setMockFiles(README_TREE)

    const output = sortedGlobSync('./**/*.spec*', {
      sortOrder: SORT_ORDER_README,
    })

    expect(output).toEqual(README_EXPECTED)
  })
})
