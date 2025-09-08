import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    '/',
    '/services(.*)',
    '/service(.*)',
    '/prompts',
    '/api/mcp(.*)',
    '/api/chat(.*)',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/font(.*)',
    '/fonts(.*)',
    '/favicon.ico'
  ],
  // Skip authentication for API routes and static files
  ignoredRoutes: [
    '/api/mcp(.*)',
    '/api/chat(.*)',
    '/_next(.*)',
    '/favicon.ico',
    '/font(.*)',
    '/fonts(.*)',
    '/(.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf|otf)$)'
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
