import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/fonts.css";
import { ClerkProvider } from '@clerk/nextjs';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AnimatedBackground from '@/components/ui/AnimatedBackground';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  icons: {
    icon: '/app-icon.svg',
  },
  title: "Collactions - AI Gateway",
  description: "Your Agent's Gateway to the World",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="ar" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-screen`}
          suppressHydrationWarning
        >
          <ThemeProvider>
            <LanguageProvider>
              <AnimatedBackground />
              <div className="relative z-10 min-h-screen">
                {children}
              </div>
            </LanguageProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
