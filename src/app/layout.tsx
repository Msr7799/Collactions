// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "@/styles/fonts.css";
import { ClerkProvider } from '@clerk/nextjs';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const biting = localFont({
  src: [
    { path: "/fonts/biting-my-nails.regular.woff2", weight: "400", style: "normal" },
    { path: "/fonts/biting-my-nails.outline-regular.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-biting",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  icons: { icon: '/app-icon.svg' },
  title: "Collactions - AI Gateway",
  description: "Your Agent's Gateway to the World",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="ar" className={`${biting.variable} ${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <body
          className={`${biting.className} antialiased relative min-h-screen`}
          suppressHydrationWarning
        >
          <ThemeProvider>
            <LanguageProvider>
              <div className="relative bg-[var(--user-bg)] min-h-screen w-full ">
                {children}
              </div>
            </LanguageProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
