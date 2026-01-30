import type { NextConfig } from 'next';
import { join } from 'path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: join(__dirname),
  transpilePackages: ['@runwayml/avatar-react'],
};

export default nextConfig;
