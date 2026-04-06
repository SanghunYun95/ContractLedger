import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Note: next.config.ts rewrites are evaluated at build time.
        // For dynamic runtime URLs in standalone mode, relative paths or middleware proxy is recommended.
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
          : 'http://127.0.0.1:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;
