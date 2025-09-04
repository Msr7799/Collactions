'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, X, Globe, Bell, User, Terminal, MessageSquare, Activity, Settings } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import CollactionsLogo from '@/components/logo/CollactionsLogo';
import { useRouter } from 'next/navigation';
// Temporarily disabled to fix Next.js 15 headers() iteration warnings
// import { useClerk, useUser, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import TypingAnimation from '@/components/ui/TypingAnimation';
import { getTranslation } from '@/lib/translations';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  onMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showSearch = true, onMenuToggle }) => {
  const { language, setLanguage, isRTL } = useLanguage();
  const { theme } = useTheme();
  // Temporarily disabled to fix ClerkInstanceContext error
  // const { openSignIn, loaded } = useClerk();
  // const { isSignedIn, user } = useUser();
  const loaded = true;
  const isSignedIn = false;
  const user = null;
  const router = useRouter();
  
  const isDark = theme === 'dark';

  useEffect(() => {
    console.log('🔐 Auth Status (disabled):', {
      loaded,
      isSignedIn,
      userExists: !!user,
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Found' : 'Missing'
    });
  }, [loaded, isSignedIn, user]);

  const handleSignIn = () => {
    console.log('🔐 Login clicked (disabled)');
    // Authentication temporarily disabled
    alert(language === 'ar' ? 'المصادقة معطلة مؤقتاً' : 'Authentication temporarily disabled');
  };

  return (
    <header className="relative top-0 left-0 right-0  z-50 w-full border-b-3 backdrop-blur supports-[backdrop-filter]:bg-background/85 shadow-sm">
      <div className={`w-full flex h-18 items-center overflow-hidden ${isRTL ? 'pr-4 pl-4' : 'pl-4 pr-4'} mr-0`}>
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity flex-shrink-0">
          <img 
            src="/app-icon.svg" 
            alt="Collactions Logo" 
            className="w-10 h-10 pointer-events-none drop-shadow-sm"
          />
          <CollactionsLogo className="left-5" size="md" />
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
          {/* Theme Toggle */}
          <div className="px-2">
            <ThemeToggle />
          </div>
          
          <button
          title={getTranslation('terminal', language)}
          onClick={() => router.push('/terminal')}
          className="p-3 theme-gradient-text hover:theme-glow transition-all duration-300 ease-in-out">
            <Terminal className="h-4 w-4" />
          </button>
          <button 
          title={getTranslation('prompts', language)}
          onClick={() => router.push('/prompts')}
          className="p-3 theme-gradient-text hover:theme-glow transition-all duration-300 ease-in-out">
            <MessageSquare className="h-4 w-4" />
          </button>
          <button
          title={getTranslation('dashboard', language)}
          onClick={() => router.push('/dashboard')}
          className="p-3 theme-gradient-text hover:theme-glow transition-all duration-300 ease-in-out">
            <Activity className="h-4 w-4" />
          </button>
          <button
          title={getTranslation('settings', language)}
          onClick={() => router.push('/settings')}
          className="p-3 theme-gradient-text hover:theme-glow transition-all duration-300 ease-in-out">
            <Settings className="h-4 w-4" />
          </button>
          <button
          title={getTranslation('profile', language)}
          onClick={() => router.push('/profile')}
          className="p-3 theme-gradient-text hover:theme-glow transition-all duration-300 ease-in-out">
            <User className="h-4 w-4" />
          </button>
          
          
          {/* Language Toggle */}
          <button 
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="p-5 theme-gradient-text hover:theme-glow transition-all duration-300 ease-in-out"
            title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            <span className=" text-xs">
            <Globe className="h-4 w-4" />
            </span>
          </button>
          
          {/* Authentication */}
          <div className={`flex items-center !mr-0 ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-2 ml-2'}`} style={{marginRight: '0px'}}>
            {!isSignedIn ? (
              <button
                onClick={handleSignIn}
                className="text-text-primary hover:text-accent transition-colors flex items-center space-x-2"
              >
                <User className="w-5 h-5" />
                <span className="hidden lg:inline">{language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2 text-text-primary">
                <span className="text-sm">
                  {language === 'ar' ? 'مستخدم' : 'User'}
                </span>
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
            
            {/* Navigation Menu */}
            {isSignedIn && (
              <button
                title={language === 'ar' ? 'القائمة' : 'Menu'}
                onClick={onMenuToggle}
                className="p-3 text-white/80 hover:text-primary transition-colors"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
