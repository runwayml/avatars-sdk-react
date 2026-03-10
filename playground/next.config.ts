import type { NextConfig } from 'next';
import { resolve } from 'path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: resolve(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'runway-static-assets.s3.us-east-1.amazonaws.com',
        pathname: '/calliope-demo/**',
      },
    ],
  },
};

export default nextConfig;
