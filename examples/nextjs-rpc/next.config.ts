import type { NextConfig } from 'next';
import { join } from 'path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: join(__dirname),
  transpilePackages: ['@runwayml/avatars-react'],
  serverExternalPackages: ['@runwayml/avatars-node-rpc', '@livekit/rtc-node'],
};

export default nextConfig;
