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

const TEST_DIR = 'cypress/tests'

const MOCK_CONTENT = 'content'

const SORT_ORDER_NUMBERED = ['utensils', 'garnish'] satisfies SortOrder

const SORT_ORDER_NESTED = [
  'booking',
  'entree-dinner',
  'entree-lunch',
  'appetizer',
  'utensils',
  'dessert',
  'user',
  /^(?!.*history)/i, // does not contain (place these last)
  /^(?!.*stats)/i, // does not contain (place these last)
  /new(?!-?special)/i, // "new" before "new-special"
  'new',
  'edit',
  'clone',
  'view',
  'print',
] satisfies SortOrder

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
const NUMBERED_TREE = {
  [TEST_DIR]: {
    __common__: {
      'common-fns.ts': MOCK_CONTENT,
    },
    misc1: {
      'misc.ts': MOCK_CONTENT,
      'component.spec.ts': MOCK_CONTENT,
    },
    '1-setup': {
      'test-users.spec.ts': MOCK_CONTENT,
    },
    '2-empty-case': {},
    '3-entree-dinner': {
      'entree-dinner.spec.ts': MOCK_CONTENT,
    },
    '5-entree-data': {
      'entree-data-garnish.ts': MOCK_CONTENT,
      'entree-data-utensils.spec.ts': MOCK_CONTENT,
    },
    '6-entree-data': {
      'entree-data-garnish.spec.ts': MOCK_CONTENT,
      'entree-data-utensils.spec.ts': MOCK_CONTENT,
    },
    '10-cleanup': {
      'delete-test-users.spec.ts': MOCK_CONTENT,
    },
    '11-cleanup-2': {
      'delete-test-users.spec.ts': MOCK_CONTENT,
    },
    misc2: {
      'misc.spec.ts': MOCK_CONTENT,
    },
    aMisc: {
      'misc.spec.ts': MOCK_CONTENT,
    },
  },
} satisfies NestedDirectoryJSON

/** Numbered folders within numbered folders, so ordering applies at each level. */
const NESTED_TREE = {
  [TEST_DIR]: {
    '01-widget-cards': {
      'booking-calendar.spec.ts': MOCK_CONTENT,
      'booking-heatmap.spec.ts': MOCK_CONTENT,
      'booking-schedule.spec.ts': MOCK_CONTENT,
      'entree-dinner-card.spec.ts': MOCK_CONTENT,
      'entree-lunchs-card.spec.ts': MOCK_CONTENT,
      'upcoming-bookings.spec.tsx': MOCK_CONTENT,
    },
    '02-tables': {
      '01-entree-dinner': {
        'entree-dinner-stats-page.spec.tsx': MOCK_CONTENT,
        'entree-dinner-table-page.spec.ts': MOCK_CONTENT,
      },
      '02-booking': {
        'bookings-history-page.spec.ts': MOCK_CONTENT,
        'bookings-table-page.spec.tsx': MOCK_CONTENT,
      },
      'bookings-history-page.spec.ts': MOCK_CONTENT,
      'bookings-table-page.spec.ts': MOCK_CONTENT,
      'customers-page.spec.ts': MOCK_CONTENT,
      'dessert-table-page.spec.tsx': MOCK_CONTENT,
      'appetizer-count-table-page.spec.ts': MOCK_CONTENT,
      'appetizer-supplier-card.spec.ts': MOCK_CONTENT,
      'entree-dinner-stats-page.spec.ts': MOCK_CONTENT,
      'entree-dinner-table-page.spec.ts': MOCK_CONTENT,
      'entree-lunch-table-page.spec.ts': MOCK_CONTENT,
      'utensils-brand-table-page.spec.ts': MOCK_CONTENT,
      'utensils-material-card.spec.ts': MOCK_CONTENT,
      'excused-employees.spec.ts': MOCK_CONTENT,
      'notifications-table.spec.ts': MOCK_CONTENT,
      'users-page.spec.ts': MOCK_CONTENT,
    },
    '03-view-pages': {
      'print-booking-page.spec.ts': MOCK_CONTENT,
      'print-entree-dinner-page.spec.ts': MOCK_CONTENT,
      'view-appetizer-count-page.spec.ts': MOCK_CONTENT,
      'view-appetizer-supplier-page.spec.ts': MOCK_CONTENT,
      'view-booking-page.spec.ts': MOCK_CONTENT,
      'view-dessert-page.spec.ts': MOCK_CONTENT,
      'view-entree-dinner-page.spec.ts': MOCK_CONTENT,
      'view-entree-lunch-page.spec.ts': MOCK_CONTENT,
      'view-user-page.spec.ts': MOCK_CONTENT,
      'view-utensils-brand-page.spec.ts': MOCK_CONTENT,
      'view-utensils-material-page.spec.ts': MOCK_CONTENT,
    },
    '04-forms': {
      'booking-form': {
        'clone-booking-page.spec.ts': MOCK_CONTENT,
        'edit-booking-page.spec.ts': MOCK_CONTENT,
        'new-booking-page.spec.ts': MOCK_CONTENT,
        'new-special-booking-page.spec.ts': MOCK_CONTENT,
        folder: {
          'booking-new-page.spec.ts': MOCK_CONTENT,
          'booking-new-special-page.spec.ts': MOCK_CONTENT,
        },
      },
      dessert: {
        'edit-dessert-page.spec.ts': MOCK_CONTENT,
        'new-dessert-page.spec.ts': MOCK_CONTENT,
      },
      'entree-dinner': {
        'clone-entree-dinner-page.spec.ts': MOCK_CONTENT,
        'new-entree-dinner-page.spec.ts': MOCK_CONTENT,
      },
      'entree-lunch': {
        'edit-entree-lunch-page.spec.ts': MOCK_CONTENT,
        'new-entree-lunch-page.spec.ts': MOCK_CONTENT,
      },
      user: {
        'edit-user-page.spec.ts': MOCK_CONTENT,
      },
      'cake-frosting-input.spec.ts': MOCK_CONTENT,
      'cake-order-input.spec.ts': MOCK_CONTENT,
    },
    'misc-components': {
      'booking-status.spec.ts': MOCK_CONTENT,
      'layout.spec.ts': MOCK_CONTENT,
      'site-info-button.spec.ts': MOCK_CONTENT,
      'user-info-button.spec.ts': MOCK_CONTENT,
    },
  },
} satisfies NestedDirectoryJSON

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

const NUMBERED_EXPECTED = [
  `${TEST_DIR}/1-setup/test-users.spec.ts`,
  `${TEST_DIR}/3-entree-dinner/entree-dinner.spec.ts`,
  `${TEST_DIR}/5-entree-data/entree-data-utensils.spec.ts`,
  `${TEST_DIR}/5-entree-data/entree-data-garnish.ts`,
  `${TEST_DIR}/6-entree-data/entree-data-utensils.spec.ts`,
  `${TEST_DIR}/6-entree-data/entree-data-garnish.spec.ts`,
  `${TEST_DIR}/10-cleanup/delete-test-users.spec.ts`,
  `${TEST_DIR}/11-cleanup-2/delete-test-users.spec.ts`,
  `${TEST_DIR}/aMisc/misc.spec.ts`,
  `${TEST_DIR}/misc1/component.spec.ts`,
  `${TEST_DIR}/misc1/misc.ts`,
  `${TEST_DIR}/misc2/misc.spec.ts`,
].map((p) => path.normalize(p))

const NESTED_EXPECTED = [
  `${TEST_DIR}/01-widget-cards/booking-calendar.spec.ts`,
  `${TEST_DIR}/01-widget-cards/booking-heatmap.spec.ts`,
  `${TEST_DIR}/01-widget-cards/booking-schedule.spec.ts`,
  `${TEST_DIR}/01-widget-cards/upcoming-bookings.spec.tsx`,
  `${TEST_DIR}/01-widget-cards/entree-dinner-card.spec.ts`,
  `${TEST_DIR}/01-widget-cards/entree-lunchs-card.spec.ts`,
  `${TEST_DIR}/02-tables/01-entree-dinner/entree-dinner-table-page.spec.ts`,
  `${TEST_DIR}/02-tables/01-entree-dinner/entree-dinner-stats-page.spec.tsx`,
  `${TEST_DIR}/02-tables/02-booking/bookings-table-page.spec.tsx`,
  `${TEST_DIR}/02-tables/02-booking/bookings-history-page.spec.ts`,
  `${TEST_DIR}/02-tables/bookings-table-page.spec.ts`,
  `${TEST_DIR}/02-tables/bookings-history-page.spec.ts`,
  `${TEST_DIR}/02-tables/entree-dinner-table-page.spec.ts`,
  `${TEST_DIR}/02-tables/entree-dinner-stats-page.spec.ts`,
  `${TEST_DIR}/02-tables/entree-lunch-table-page.spec.ts`,
  `${TEST_DIR}/02-tables/appetizer-count-table-page.spec.ts`,
  `${TEST_DIR}/02-tables/appetizer-supplier-card.spec.ts`,
  `${TEST_DIR}/02-tables/utensils-brand-table-page.spec.ts`,
  `${TEST_DIR}/02-tables/utensils-material-card.spec.ts`,
  `${TEST_DIR}/02-tables/dessert-table-page.spec.tsx`,
  `${TEST_DIR}/02-tables/users-page.spec.ts`,
  `${TEST_DIR}/02-tables/customers-page.spec.ts`,
  `${TEST_DIR}/02-tables/excused-employees.spec.ts`,
  `${TEST_DIR}/02-tables/notifications-table.spec.ts`,
  `${TEST_DIR}/03-view-pages/view-booking-page.spec.ts`,
  `${TEST_DIR}/03-view-pages/print-booking-page.spec.ts`,
  `${TEST_DIR}/03-view-pages/view-entree-dinner-page.spec.ts`,
  `${TEST_DIR}/03-view-pages/print-entree-dinner-page.spec.ts`,
  `${TEST_DIR}/03-view-pages/view-entree-lunch-page.spec.ts`,
  `${TEST_DIR}/03-view-pages/view-appetizer-count-page.spec.ts`,
  `${TEST_DIR}/03-view-pages/view-appetizer-supplier-page.spec.ts`,
  `${TEST_DIR}/03-view-pages/view-utensils-brand-page.spec.ts`,
  `${TEST_DIR}/03-view-pages/view-utensils-material-page.spec.ts`,
  `${TEST_DIR}/03-view-pages/view-dessert-page.spec.ts`,
  `${TEST_DIR}/03-view-pages/view-user-page.spec.ts`,
  `${TEST_DIR}/04-forms/booking-form/new-booking-page.spec.ts`,
  `${TEST_DIR}/04-forms/booking-form/new-special-booking-page.spec.ts`,
  `${TEST_DIR}/04-forms/booking-form/edit-booking-page.spec.ts`,
  `${TEST_DIR}/04-forms/booking-form/clone-booking-page.spec.ts`,
  `${TEST_DIR}/04-forms/booking-form/folder/booking-new-page.spec.ts`,
  `${TEST_DIR}/04-forms/booking-form/folder/booking-new-special-page.spec.ts`,
  `${TEST_DIR}/04-forms/entree-dinner/new-entree-dinner-page.spec.ts`,
  `${TEST_DIR}/04-forms/entree-dinner/clone-entree-dinner-page.spec.ts`,
  `${TEST_DIR}/04-forms/entree-lunch/new-entree-lunch-page.spec.ts`,
  `${TEST_DIR}/04-forms/entree-lunch/edit-entree-lunch-page.spec.ts`,
  `${TEST_DIR}/04-forms/dessert/new-dessert-page.spec.ts`,
  `${TEST_DIR}/04-forms/dessert/edit-dessert-page.spec.ts`,
  `${TEST_DIR}/04-forms/user/edit-user-page.spec.ts`,
  `${TEST_DIR}/04-forms/cake-frosting-input.spec.ts`,
  `${TEST_DIR}/04-forms/cake-order-input.spec.ts`,
  `${TEST_DIR}/misc-components/booking-status.spec.ts`,
  `${TEST_DIR}/misc-components/user-info-button.spec.ts`,
  `${TEST_DIR}/misc-components/layout.spec.ts`,
  `${TEST_DIR}/misc-components/site-info-button.spec.ts`,
].map((p) => path.normalize(p))

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

  it('orders numbered folders numerically, then by sortOrder within each', async () => {
    setMockFiles(NUMBERED_TREE)

    const output = await sortedGlob(`${TEST_DIR}/**/*.*`, {
      sortOrder: SORT_ORDER_NUMBERED,
      exclude: ['**/__common__'],
    })

    expect(output).toEqual(NUMBERED_EXPECTED)
  })

  it('applies the ordering at every level of a nested tree', async () => {
    setMockFiles(NESTED_TREE)

    const output = await sortedGlob(`${TEST_DIR}/**/*.spec*`, {
      sortOrder: SORT_ORDER_NESTED,
    })

    expect(output).toEqual(NESTED_EXPECTED)
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
