import type { NextConfig } from 'next';
import { withNx } from '@nx/next/plugins/with-nx';
import path from 'path';

const nextConfig: NextConfig = {
  nx: {
    svgr: false,
  },
  /* config options here */
  webpack(config) {
    config.module?.rules?.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  sassOptions: {
    includePaths: [path.join(__dirname, './styles')],
  },
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [new URL('https://lh3.googleusercontent.com/**')],
  },
};

export default withNx(nextConfig);
