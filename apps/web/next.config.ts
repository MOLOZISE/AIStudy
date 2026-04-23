import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: ['@repo/api', '@repo/db', '@repo/types'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  webpack: (config) => {
    // Resolve .js imports to .ts source files in workspace packages
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.js'],
      '.jsx': ['.tsx', '.jsx'],
    };
    return config;
  },
};

export default config;
