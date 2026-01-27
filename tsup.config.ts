import { defineConfig } from 'tsup';

export default defineConfig([
  // Client bundle (React components and hooks)
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
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
  // API utilities (no React, no "use client")
  {
    entry: { api: 'src/api/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    treeshake: true,
    minify: false,
  },
  // CSS styles
  {
    entry: ['src/styles.css'],
    outDir: 'dist',
  },
]);
