// src/middleware.ts
import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from 'next/server';

export default authMiddleware({
  publicRoutes: [
    '/', 
    '/prompts',
    '/terminal',
    '/service(.*)',
    '/api/chat(.*)',
    '/api/generate-image',
    '/api/analyze-image',
    '/api/tavily-search',
    '/api/mcp(.*)',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/_next(.*)', // static Next.js assets
    '/public(.*)',
    '/generated(.*)'
  ],

  beforeAuth: (req) => {
    const { pathname } = req.nextUrl;
    const res = NextResponse.next();

    // 🛡️ Security headers
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // 📦 Cache static assets (1 سنة)
    if (pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff2?|ttf|otf)$/)) {
      res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }

    // 📦 Cache generated images (24 ساعة)
    if (pathname.startsWith('/generated/')) {
      res.headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400, immutable');
      res.headers.set('Vary', 'Accept-Encoding');
    }

    // ⏱️ Rate limit metadata headers للـ APIs
    if (pathname.startsWith('/api/')) {
      res.headers.set('X-RateLimit-Limit', '100');
      res.headers.set('X-RateLimit-Window', '900'); // 15 دقيقة
    }

    return res;
  },

  afterAuth: async (auth, req) => {
    const { pathname } = req.nextUrl;

    // 🛑 لو API user وما في userId → Unauthorized
    if (pathname.startsWith('/api/user') && !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 🛡️ صفحات محمية
    const protectedPages = ['/dashboard', '/profile', '/settings'];
    if (protectedPages.some((p) => pathname.startsWith(p)) && !auth.userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // 📌 مرر كل الروتات باستثناء الملفات الستاتيكية
    '/((?!_next|.*\\.(?:html?|css|js|json|jpe?g|webp|png|gif|svg|ttf|woff2?|otf|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)'
  ]
};
