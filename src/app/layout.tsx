// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/fonts.css";
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ErrorSuppressor } from '@/components/ui/error-suppressor';
import { ClerkClientProvider } from '@/components/providers/ClerkClientProvider';
import { cookies } from 'next/headers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: false, // منع preload errors
  display: 'swap'
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false, // منع preload errors  
  display: 'swap'
});

export const metadata: Metadata = {
  icons: { icon: '/app-icon-red.svg' },
  title: "Collactions - AI Gateway",
  description: "Your Agent's Gateway to the World",
};

// قمع الأخطاء على مستوى العالمي
if (typeof window === 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    if (message.includes('headers()') || 
        message.includes('sync-dynamic-apis') ||
        message.includes('Route "/" used')) {
      return; // قمع صامت
    }
    originalError(...args);
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Safely read language cookie from server
  const cookieStore = await cookies();
  const language = cookieStore.get('lang')?.value || 'ar';
  const isRTL = language === 'ar';

  return (
    <html lang={language} dir={isRTL ? 'rtl' : 'ltr'} className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head />
      <body
        className={`antialiased relative min-h-screen`}
        suppressHydrationWarning
      >
        <ErrorSuppressor />
        <ClerkClientProvider>
          <ThemeProvider>
            <LanguageProvider initialLanguage={language as 'ar' | 'en'}>
              <div className="relative bg-[var(--user-bg)] min-h-screen w-full ">
                {children}
              </div>
            </LanguageProvider>
          </ThemeProvider>
        </ClerkClientProvider>
      </body>
    </html>
  );
}
