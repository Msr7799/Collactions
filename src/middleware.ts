// src/middleware.ts
// Next.js middleware with Clerk authentication and caching headers

import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    '/',
    '/prompts',
    '/terminal',
    '/service/(.*)',
    '/api/chat/(.*)',
    '/api/generate-image',
    '/api/analyze-image', 
    '/api/tavily-search',
    '/api/mcp/(.*)',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/_next',
    '/public',
    '/generated'
  ],
  
  beforeAuth: (req) => {
    const { pathname } = req.nextUrl;
    
    // Add security headers for all responses
    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Add caching headers for static files
    if (pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|otf)$/)) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
    
    // Add caching headers for generated images
    if (pathname.startsWith('/generated/')) {
      // 🚀 Cache generated images for 24 hours
      response.headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400, immutable');
      response.headers.set('Vary', 'Accept-Encoding');
      
      console.log(`📁 Serving generated image: ${pathname}`);
    }
    
    // Rate limiting headers for API routes
    if (pathname.startsWith('/api/')) {
      response.headers.set('X-RateLimit-Limit', '100');
      response.headers.set('X-RateLimit-Window', '900'); // 15 minutes
    }
    
    return response;
  },
  
  afterAuth: (auth, req) => {
    const { pathname } = req.nextUrl;
    
    // If it's a protected API route and no user, return 401
    if (pathname.startsWith('/api/user') && !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Protected pages that require authentication
    const protectedPages = ['/dashboard', '/profile', '/settings'];
    const isProtectedPage = protectedPages.some(page => pathname.startsWith(page));
    
    if (isProtectedPage && !auth.userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Add user context headers for authenticated requests
    if (auth.userId) {
      const response = NextResponse.next();
      response.headers.set('X-User-Id', auth.userId);
      return response;
    }

    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|otf|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};
