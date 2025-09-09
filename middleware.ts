// middleware.ts
// Next.js middleware for adding caching headers to static generated images

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Add caching headers for generated images
  if (pathname.startsWith('/generated/')) {
    const response = NextResponse.next();
    
    // 🚀 Cache generated images for 24 hours
    response.headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400, immutable');
    response.headers.set('Vary', 'Accept-Encoding');
    
    // Add security headers for images
    response.headers.set('X-Content-Type-Options', 'nosniff');
    
    console.log(`📁 Serving generated image: ${pathname}`);
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all files in /generated/ directory
    '/generated/:path*'
  ]
};
