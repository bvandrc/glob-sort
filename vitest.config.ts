import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // A spy declared once for a `describe` starts each case empty, so a
    // `toHaveBeenCalledWith` cannot pass on a call from the case before it.
    clearMocks: true,
    environment: 'node',
    globals: true,
    watch: false,
    root: '.',
    // setupFiles: ['./src/__setup__/setup-tests.ts'],
    include: ['./src/**/*.{test,spec}.*'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      exclude: [
        '**/__*__/**',
        '**/types/**',
        '**/dist/**',
        '**/*.d.ts',
        '*.config.ts',
      ],
      reporter: ['text', 'html', 'json', 'lcov'],
    },
  },
})
