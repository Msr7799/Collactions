'use client';

import Link from 'next/link';
import { ShootingStars } from '@/components/ui/shooting-stars';
import { StarsBackground } from '@/components/ui/stars-background';
import { useLanguage } from '@/contexts/LanguageContext';
import AppIcon from './app-icon';


export default function NotFound() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen  text-white flex items-center justify-center relative overflow-hidden">
      {/*app icon*/}
      <div className="absolute inset-0 flex items-center justify-center bottom-150">
      <AppIcon />
      </div>
        {/* Stars Background */}

      <StarsBackground className="absolute inset-0" />
      {/* Shooting Stars */}
      <ShootingStars className="absolute inset-0" />
      
      {/* Main Content */}
      <div className="text-center space-y-6 z-10 relative">
        <h1 
          className="relative z-10 mt-14 text-lg md:text-7xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center"
          style={{
            fontFamily: 'BitingMyNails, Orbitron, monospace, Arial, sans-serif'
          }}
        >
          404
        </h1>
              <h1 className="relative z-10 text-lg md:text-9xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
      
        
          {language === 'ar' ? 'الصفحة غير موجودة' : 'Page not found'}
        
        </h1>
        <br />

        <p className="relative bottom-10 z-10 text-2xl md:text-2xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-400  text-center font-sans font-bold">
          {language === 'ar' 
            ? 'عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها.'
            : "Sorry, we couldn't find the page you're looking for."
          }
        </p>
        
        <Link 
          href="/"
          className="inline-flex font-sans font-bold items-center text-white hover:text-gray-300 transition-colors duration-200 mt-8 font-normal"
        >
           <button className="px-4 py-2 backdrop-blur-sm border bg-emerald-300/10 border-emerald-500/20 text-white mx-auto text-center rounded-full relative mt-4">
          <span>{language === 'ar' ? '← العودة للرئيسية' : '← Back to home'}</span>
          <div className="absolute inset-x-0  h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent via-emerald-500 to-transparent" />
        </button>
        </Link>
      </div>
    </div>
  );
}