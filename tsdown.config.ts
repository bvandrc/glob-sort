import { defineConfig } from 'tsdown'

import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  entry: { index: 'src/sortedGlob.ts' },
  target: 'es2023',
  format: ['esm'],
  clean: true,
  dts: {
    // oxc generates declarations without touching TypeScript's compiler API, which
    // TS7 no longer exposes in a stable form
    oxc: true,
    // declaration maps are omitted: rolldown-plugin-dts always strips sourcesContent,
    // so they'd only resolve if src were published
    sourcemap: false,
  },
  // emit .js/.d.ts rather than tsdown's default .mjs/.d.mts — package is type: module
  fixedExtension: false,
  minify: false,
  sourcemap: true,
  treeshake: true,
  banner: { js: `\n// ${pkg.name} ${pkg.version}` },
})
