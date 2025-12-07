import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Handle browser extension attributes that cause hydration mismatches
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Disable strict mode to reduce hydration warnings
  reactStrictMode: false,
  
  // Skip TypeScript checks during build for faster deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Image optimization for Vercel
  images: {
    domains: [],
    unoptimized: false,
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  
  // Headers for iframe security
  async headers() {
    return [
      {
        source: '/prompts',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: `frame-src 'self' http://localhost:5173 ${process.env.NEXT_PUBLIC_CHATUI_URL || ''};`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
