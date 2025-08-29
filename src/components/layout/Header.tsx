'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { 
  Search, 
  Terminal, 
  MessageSquare, 
  Activity, 
  Settings, 
  User, 
  Globe 
} from 'lucide-react';
import { useClerk, useUser, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import TypingAnimation from '@/components/ui/TypingAnimation';
import { getTranslation } from '@/lib/translations';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  onMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showSearch = true, onMenuToggle }) => {
  const { language, setLanguage, isRTL } = useLanguage();
  const { openSignIn, loaded } = useClerk();
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    console.log('🔐 Clerk Status:', {
      loaded,
      isSignedIn,
      userExists: !!user,
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Found' : 'Missing'
    });
  }, [loaded, isSignedIn, user]);

  const handleSignIn = () => {
    console.log('🔐 Login clicked, loaded:', loaded);
    if (!loaded) {
      console.error('❌ Clerk not loaded');
      return;
    }
    try {
      openSignIn();
    } catch (error) {
      console.error('❌ Login error:', error);
    }
  };

  return (
    <header className="relative top-0 left-0 right-0  z-50 w-full border-b-3 backdrop-blur supports-[backdrop-filter]:bg-[#050505]/60">
      <div className={`w-full flex h-18 items-center overflow-hidden ${isRTL ? 'pr-4 pl-4' : 'pl-4 pr-4'} mr-0`}>
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity flex-shrink-0">
          <img 
            src="/app-icon.svg" 
            alt="Collactions Logo" 
            className="w-10 h-10 pointer-events-none"
          />
          <img 
            src="/collactions.svg" 
            alt="Collactions Logo" 
            className="w-45 h-45 left-5 relative pointer-events-none"
          />
        </Link>
      
        {/* Search Bar */}
        {showSearch && (
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/60" />
              <input
                type="text"
                placeholder={getTranslation('search_placeholder', language)}
                className="w-full bg-input border border-border rounded-md px-3 py-2 pl-10 text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Right Actions */}
        <div className={`flex items-center ${isRTL ? 'mr-auto ml-0' : 'ml-auto mr-0'} ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`} style={{paddingRight: '0px'}}>
          <button
          title={getTranslation('terminal', language)}
          onClick={() => router.push('/terminal')}
          className="p-3 text-foreground/80 hover:text-primary transition-colors duration-300 ease-in-out">
            <Terminal className="h-4 w-4" />
          </button>
          <button 
          title={getTranslation('prompts', language)}
          onClick={() => router.push('/prompts')}
          className="p-3 text-foreground/80 hover:text-primary transition-colors duration-300 ease-in-out">
            <MessageSquare className="h-4 w-4" />
          </button>
          <button
          title={getTranslation('dashboard', language)}
          onClick={() => router.push('/dashboard')}
          className="p-3 text-foreground/80 hover:text-primary transition-colors duration-300 ease-in-out">
            <Activity className="h-4 w-4" />
          </button>
          <button
          title={getTranslation('settings', language)}
          onClick={() => router.push('/settings')}
          className="p-3 text-foreground/80 hover:text-primary transition-colors duration-300 ease-in-out">
            <Settings className="h-4 w-4" />
          </button>
          <button
          title={getTranslation('profile', language)}
          onClick={() => router.push('/profile')}
          className="p-3 text-foreground/80 hover:text-primary transition-colors duration-300 ease-in-out">
            <User className="h-4 w-4" />
          </button>
          
          {/* Theme Toggle */}
          <div className="px-2">
            <ThemeToggle />
          </div>
          
          {/* Language Toggle */}
          <button 
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="p-5 text-foreground/80 hover:text-primary transition-colors"
            title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            <span className=" text-xs">
            <Globe className="h-4 w-4" />
              {language === 'ar' ? 'EN' : 'ع'}

            </span>
          </button>
          
          {/* Authentication */}
          <div className={`flex items-center !mr-0 ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-2 ml-2'}`} style={{marginRight: '0px'}}>
            <SignedOut>
              <button 
                onClick={handleSignIn}
                className="px-4 py-2 bg-[#EF7E1CFF] hover:bg-muted  text-black rounded-md font-medium transition-colors disabled:opacity-50"
                disabled={!loaded}
              >
                {!loaded ? 'Loading...' : `${getTranslation('sign_in', language)} / تسجيل الدخول`}
              </button>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  <TypingAnimation 
                    text={language === 'ar' ? `مرحباً ${user?.firstName || 'User'} 👋` : `Hello ${user?.firstName || 'User'} 👋 `}
                    speed={80}
                    className="text-lg text-foreground/90 "
                    startDelay={500}
                    pauseDuration={3000}
                    isRTL={isRTL}
                  />
                </div>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
