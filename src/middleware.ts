// Temporarily disabled to fix Next.js 15 headers() iteration warnings
// The authMiddleware from Clerk causes headers() iteration issues in Next.js 15
// Since authentication is disabled in components, middleware is also disabled

// import { authMiddleware } from '@clerk/nextjs';

// export default authMiddleware({
//   // Public routes that don't require authentication
//   publicRoutes: [
//     '/',
//     '/services(.*)',
//     '/service(.*)',
//     '/prompts',
//     '/api/mcp(.*)',
//     '/api/chat(.*)'
//   ],
//   // Skip authentication for API routes and static files
//   ignoredRoutes: [
//     '/api/mcp(.*)',
//     '/api/chat(.*)',
//     '/_next(.*)',
//     '/favicon.ico'
//   ]
// });

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple pass-through middleware to avoid headers() warnings
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)"
  ],
};
