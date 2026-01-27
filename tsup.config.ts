import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react'],
  treeshake: true,
  minify: false,
  splitting: false,
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
