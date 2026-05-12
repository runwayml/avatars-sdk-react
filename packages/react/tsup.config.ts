import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    external: ['react', 'react-dom'],
    treeshake: true,
    minify: false,
    splitting: false,
    banner: {
      js: '"use client";',
    },
    esbuildOptions(options) {
      options.jsx = 'automatic';
    },
  },
  {
    entry: { api: 'src/api/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    treeshake: true,
    minify: false,
  },
  {
    entry: ['src/styles.css'],
    outDir: 'dist',
  },
]);
