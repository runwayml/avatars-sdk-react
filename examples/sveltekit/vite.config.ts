import { resolve } from 'path';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      '@runwayml/avatars': resolve(__dirname, '../../packages/core/src/index.ts'),
    },
  },
});
