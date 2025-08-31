import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    '/',
    '/services(.*)',
    '/service(.*)',
    '/prompts',
    '/api/mcp(.*)',
    '/api/chat(.*)'
  ],
  // Skip authentication for API routes and static files
  ignoredRoutes: [
    '/api/mcp(.*)',
    '/api/chat(.*)',
    '/_next(.*)',
    '/favicon.ico'
  ]
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)"
  ],
};
