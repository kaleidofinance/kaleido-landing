/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  experimental: {
    serverComponentsExternalPackages: ['mysql2']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kaleidofinance.xyz',
        pathname: '/**',
      }
    ],
    minimumCacheTTL: 60,
    formats: ['image/avif', 'image/webp']
  }
};

module.exports = nextConfig;
