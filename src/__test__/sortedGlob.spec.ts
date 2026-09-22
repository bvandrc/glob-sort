import path from 'node:path'
import { type NestedDirectoryJSON, vol } from 'memfs'
import { expect, vi } from 'vitest'

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

const testDir = 'cypress/tests'

const sortOrderTest1 = ['utensils', 'garnish']
const sortOrderTest2 = [
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
]
const sortOrderReadme = [
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
]

const mockContent = 'content'

describe('sortedGlob', () => {
  afterEach(() => {
    vol.reset()
  })

  it('returns sorted file paths by numbered folder and sortOrder', async () => {
    setMockFiles({
      [testDir]: {
        __common__: {
          'common-fns.ts': mockContent,
        },
        misc1: {
          'misc.ts': mockContent,
          'component.spec.ts': mockContent,
        },
        '1-setup': {
          'test-users.spec.ts': mockContent,
        },
        '2-empty-case': {},
        '3-entree-dinner': {
          'entree-dinner.spec.ts': mockContent,
        },
        '5-entree-data': {
          'entree-data-garnish.ts': mockContent,
          'entree-data-utensils.spec.ts': mockContent,
        },
        '6-entree-data': {
          'entree-data-garnish.spec.ts': mockContent,
          'entree-data-utensils.spec.ts': mockContent,
        },
        '10-cleanup': {
          'delete-test-users.spec.ts': mockContent,
        },
        '11-cleanup-2': {
          'delete-test-users.spec.ts': mockContent,
        },
        misc2: {
          'misc.spec.ts': mockContent,
        },
        aMisc: {
          'misc.spec.ts': mockContent,
        },
      },
    })

    const output1 = await sortedGlob(`${testDir}/**/*.*`, {
      sortOrder: sortOrderTest1,
      exclude: ['**/__common__'],
    })

    expect(output1).toEqual(
      [
        `${testDir}/1-setup/test-users.spec.ts`,
        `${testDir}/3-entree-dinner/entree-dinner.spec.ts`,
        `${testDir}/5-entree-data/entree-data-utensils.spec.ts`,
        `${testDir}/5-entree-data/entree-data-garnish.ts`,
        `${testDir}/6-entree-data/entree-data-utensils.spec.ts`,
        `${testDir}/6-entree-data/entree-data-garnish.spec.ts`,
        `${testDir}/10-cleanup/delete-test-users.spec.ts`,
        `${testDir}/11-cleanup-2/delete-test-users.spec.ts`,
        `${testDir}/aMisc/misc.spec.ts`,
        `${testDir}/misc1/component.spec.ts`,
        `${testDir}/misc1/misc.ts`,
        `${testDir}/misc2/misc.spec.ts`,
      ].map((p) => path.normalize(p))
    )

    setMockFiles({
      [testDir]: {
        '01-widget-cards': {
          'booking-calendar.spec.ts': mockContent,
          'booking-heatmap.spec.ts': mockContent,
          'booking-schedule.spec.ts': mockContent,
          'entree-dinner-card.spec.ts': mockContent,
          'entree-lunchs-card.spec.ts': mockContent,
          'upcoming-bookings.spec.tsx': mockContent,
        },
        '02-tables': {
          '01-entree-dinner': {
            'entree-dinner-stats-page.spec.tsx': mockContent,
            'entree-dinner-table-page.spec.ts': mockContent,
          },
          '02-booking': {
            'bookings-history-page.spec.ts': mockContent,
            'bookings-table-page.spec.tsx': mockContent,
          },
          'bookings-history-page.spec.ts': mockContent,
          'bookings-table-page.spec.ts': mockContent,
          'customers-page.spec.ts': mockContent,
          'dessert-table-page.spec.tsx': mockContent,
          'appetizer-count-table-page.spec.ts': mockContent,
          'appetizer-supplier-card.spec.ts': mockContent,
          'entree-dinner-stats-page.spec.ts': mockContent,
          'entree-dinner-table-page.spec.ts': mockContent,
          'entree-lunch-table-page.spec.ts': mockContent,
          'utensils-brand-table-page.spec.ts': mockContent,
          'utensils-material-card.spec.ts': mockContent,
          'excused-employees.spec.ts': mockContent,
          'notifications-table.spec.ts': mockContent,
          'users-page.spec.ts': mockContent,
        },
        '03-view-pages': {
          'print-booking-page.spec.ts': mockContent,
          'print-entree-dinner-page.spec.ts': mockContent,
          'view-appetizer-count-page.spec.ts': mockContent,
          'view-appetizer-supplier-page.spec.ts': mockContent,
          'view-booking-page.spec.ts': mockContent,
          'view-dessert-page.spec.ts': mockContent,
          'view-entree-dinner-page.spec.ts': mockContent,
          'view-entree-lunch-page.spec.ts': mockContent,
          'view-user-page.spec.ts': mockContent,
          'view-utensils-brand-page.spec.ts': mockContent,
          'view-utensils-material-page.spec.ts': mockContent,
        },
        '04-forms': {
          'booking-form': {
            'clone-booking-page.spec.ts': mockContent,
            'edit-booking-page.spec.ts': mockContent,
            'new-booking-page.spec.ts': mockContent,
            'new-special-booking-page.spec.ts': mockContent,
            folder: {
              'booking-new-page.spec.ts': mockContent,
              'booking-new-special-page.spec.ts': mockContent,
            },
          },
          dessert: {
            'edit-dessert-page.spec.ts': mockContent,
            'new-dessert-page.spec.ts': mockContent,
          },
          'entree-dinner': {
            'clone-entree-dinner-page.spec.ts': mockContent,
            'new-entree-dinner-page.spec.ts': mockContent,
          },
          'entree-lunch': {
            'edit-entree-lunch-page.spec.ts': mockContent,
            'new-entree-lunch-page.spec.ts': mockContent,
          },
          user: {
            'edit-user-page.spec.ts': mockContent,
          },
          'cake-frosting-input.spec.ts': mockContent,
          'cake-order-input.spec.ts': mockContent,
        },
        'misc-components': {
          'booking-status.spec.ts': mockContent,
          'layout.spec.ts': mockContent,
          'site-info-button.spec.ts': mockContent,
          'user-info-button.spec.ts': mockContent,
        },
      },
    })

    const output2 = await sortedGlob(`${testDir}/**/*.spec*`, {
      sortOrder: sortOrderTest2,
    })

    expect(output2).toEqual(
      [
        `${testDir}/01-widget-cards/booking-calendar.spec.ts`,
        `${testDir}/01-widget-cards/booking-heatmap.spec.ts`,
        `${testDir}/01-widget-cards/booking-schedule.spec.ts`,
        `${testDir}/01-widget-cards/upcoming-bookings.spec.tsx`,
        `${testDir}/01-widget-cards/entree-dinner-card.spec.ts`,
        `${testDir}/01-widget-cards/entree-lunchs-card.spec.ts`,
        `${testDir}/02-tables/01-entree-dinner/entree-dinner-table-page.spec.ts`,
        `${testDir}/02-tables/01-entree-dinner/entree-dinner-stats-page.spec.tsx`,
        `${testDir}/02-tables/02-booking/bookings-table-page.spec.tsx`,
        `${testDir}/02-tables/02-booking/bookings-history-page.spec.ts`,
        `${testDir}/02-tables/bookings-table-page.spec.ts`,
        `${testDir}/02-tables/bookings-history-page.spec.ts`,
        `${testDir}/02-tables/entree-dinner-table-page.spec.ts`,
        `${testDir}/02-tables/entree-dinner-stats-page.spec.ts`,
        `${testDir}/02-tables/entree-lunch-table-page.spec.ts`,
        `${testDir}/02-tables/appetizer-count-table-page.spec.ts`,
        `${testDir}/02-tables/appetizer-supplier-card.spec.ts`,
        `${testDir}/02-tables/utensils-brand-table-page.spec.ts`,
        `${testDir}/02-tables/utensils-material-card.spec.ts`,
        `${testDir}/02-tables/dessert-table-page.spec.tsx`,
        `${testDir}/02-tables/users-page.spec.ts`,
        `${testDir}/02-tables/customers-page.spec.ts`,
        `${testDir}/02-tables/excused-employees.spec.ts`,
        `${testDir}/02-tables/notifications-table.spec.ts`,
        `${testDir}/03-view-pages/view-booking-page.spec.ts`,
        `${testDir}/03-view-pages/print-booking-page.spec.ts`,
        `${testDir}/03-view-pages/view-entree-dinner-page.spec.ts`,
        `${testDir}/03-view-pages/print-entree-dinner-page.spec.ts`,
        `${testDir}/03-view-pages/view-entree-lunch-page.spec.ts`,
        `${testDir}/03-view-pages/view-appetizer-count-page.spec.ts`,
        `${testDir}/03-view-pages/view-appetizer-supplier-page.spec.ts`,
        `${testDir}/03-view-pages/view-utensils-brand-page.spec.ts`,
        `${testDir}/03-view-pages/view-utensils-material-page.spec.ts`,
        `${testDir}/03-view-pages/view-dessert-page.spec.ts`,
        `${testDir}/03-view-pages/view-user-page.spec.ts`,
        `${testDir}/04-forms/booking-form/new-booking-page.spec.ts`,
        `${testDir}/04-forms/booking-form/new-special-booking-page.spec.ts`,
        `${testDir}/04-forms/booking-form/edit-booking-page.spec.ts`,
        `${testDir}/04-forms/booking-form/clone-booking-page.spec.ts`,
        `${testDir}/04-forms/booking-form/folder/booking-new-page.spec.ts`,
        `${testDir}/04-forms/booking-form/folder/booking-new-special-page.spec.ts`,
        `${testDir}/04-forms/entree-dinner/new-entree-dinner-page.spec.ts`,
        `${testDir}/04-forms/entree-dinner/clone-entree-dinner-page.spec.ts`,
        `${testDir}/04-forms/entree-lunch/new-entree-lunch-page.spec.ts`,
        `${testDir}/04-forms/entree-lunch/edit-entree-lunch-page.spec.ts`,
        `${testDir}/04-forms/dessert/new-dessert-page.spec.ts`,
        `${testDir}/04-forms/dessert/edit-dessert-page.spec.ts`,
        `${testDir}/04-forms/user/edit-user-page.spec.ts`,
        `${testDir}/04-forms/cake-frosting-input.spec.ts`,
        `${testDir}/04-forms/cake-order-input.spec.ts`,
        `${testDir}/misc-components/booking-status.spec.ts`,
        `${testDir}/misc-components/user-info-button.spec.ts`,
        `${testDir}/misc-components/layout.spec.ts`,
        `${testDir}/misc-components/site-info-button.spec.ts`,
      ].map((p) => path.normalize(p))
    )

    // README example
    setMockFiles({
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
    })

    const output3 = await sortedGlob('./**/*.spec*', {
      sortOrder: sortOrderReadme,
    })

    const expectedOutput3 = [
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

    expect(output3).toEqual(expectedOutput3)

    const output3Sync = sortedGlobSync('./**/*.spec*', {
      sortOrder: sortOrderReadme,
    })

    expect(output3Sync).toEqual(expectedOutput3)
  })
})
