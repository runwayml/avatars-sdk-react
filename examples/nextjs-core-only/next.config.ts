import type { NextConfig } from 'next';
import { resolve } from 'path';

const nextConfig: NextConfig = {
  webpack(config) {
    config.resolve.alias['@runwayml/avatars'] = resolve(
      __dirname,
      '../../packages/core/src/index.ts',
    );
    return config;
  },
};

export default nextConfig;
