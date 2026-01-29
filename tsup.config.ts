import { defineConfig } from 'tsup';

export default defineConfig([
  // Main SDK build (unchanged)
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
    esbuildOptions(options) {
      options.jsx = 'automatic';
    },
  },
  // Widget IIFE build
  {
    entry: ['src/widget/index.ts'],
    outDir: 'dist/widget',
    format: ['iife'],
    globalName: 'RunwayCharacters',
    noExternal: [/.*/], // Bundle everything including React
    minify: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    esbuildOptions(options) {
      options.jsx = 'automatic';
      options.define = {
        'process.env.NODE_ENV': '"production"',
      };
    },
  },
]);
