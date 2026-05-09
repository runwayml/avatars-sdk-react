import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    treeshake: true,
    minify: false,
    splitting: false,
  },
  {
    entry: { api: 'src/api/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    treeshake: true,
    minify: false,
  },
]);
