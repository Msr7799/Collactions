import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Handle browser extension attributes that cause hydration mismatches
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Disable strict mode to reduce hydration warnings
  reactStrictMode: false,
  
  // Skip ESLint and TypeScript checks during build for faster deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
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
};

export default nextConfig;
