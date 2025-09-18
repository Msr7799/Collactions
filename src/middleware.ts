// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const res = NextResponse.next();

  // 🌐 Language Cookie Logic
  const currentLang = request.cookies.get('lang')?.value;
  
  if (!currentLang) {
    // Extract preferred language from Accept-Language header
    const acceptLanguage = request.headers.get('accept-language') || '';
    const preferredLang = acceptLanguage.toLowerCase().includes('ar') ? 'ar' : 'en';
    
    // Set language cookie that expires in 1 year
    res.cookies.set('lang', preferredLang, {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  }

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
}

export const config = {
  matcher: [
    // يمرر كل الطلبات
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ]
};
