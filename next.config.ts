import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Handle browser extension attributes that cause hydration mismatches
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Disable strict mode to reduce hydration warnings
  reactStrictMode: false,
};

export default nextConfig;
