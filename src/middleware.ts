// src/middleware.ts
// Next.js middleware with Clerk authentication and caching headers

import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    '/',
    '/api/health',

    '/favicon.ico',
    '/robots.txt',
    '/_next',
    '/public',
    '/generated'
  ],
  
  beforeAuth: (req) => {
    const { pathname } = req.nextUrl;
    
    // Add caching headers for generated images
    if (pathname.startsWith('/generated/')) {
      const response = NextResponse.next();
      
      // 🚀 Cache generated images for 24 hours
      response.headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400, immutable');
      response.headers.set('Vary', 'Accept-Encoding');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      
      console.log(`📁 Serving generated image: ${pathname}`);
      return response;
    }
  },
  
  afterAuth: (auth, req) => {
    const { pathname } = req.nextUrl;
    
    // If it's a protected API route and no user, return 401
    if (pathname.startsWith('/api/user') && !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // If it's a protected page and no user, redirect to sign-in
    if (pathname.startsWith('/dashboard') && !auth.userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(signInUrl);
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
