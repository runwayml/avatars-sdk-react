import type { NextConfig } from 'next';
import { config as loadEnv } from 'dotenv';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

// Next.js won't override shell exports (e.g. RUNWAYML_API_SECRET in ~/.zshrc).
// For this example, .env.local should win so per-project keys work without unset.
for (const file of ['.env', '.env.local']) {
  const path = resolve(__dirname, file);
  if (existsSync(path)) {
    loadEnv({ path, override: true });
  }
}

const nextConfig: NextConfig = {
  outputFileTracingRoot: join(__dirname),
  transpilePackages: ['@runwayml/avatars-react'],
};

export default nextConfig;
