import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Load environment variables from .env files
import { config } from 'dotenv';
config({ path: '.env.local' });


const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
