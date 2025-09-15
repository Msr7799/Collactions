'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, X, Globe, Bell, User, Terminal, MessageSquare, Activity, Settings } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import CollactionsLogo from '@/components/logo/CollactionsLogo';
import { useRouter } from 'next/navigation';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';
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
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const isDark = theme === 'dark';

  useEffect(() => {
    console.log('🔐 Auth Status:', {
      isLoaded,
      isSignedIn,
      userExists: !!user,
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Found' : 'Missing'
    });
  }, [isLoaded, isSignedIn, user]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header 
      className="relative top-0 left-0 right-0  w-full border-b shadow-lg"
      style={{
        backgroundColor: 'var(--user-bg)',
        backdropFilter: 'none'
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className={`w-full flex h-16 md:h-20 items-center px-4 md:px-6 ${isRTL ? 'flex-row' : 'flex-row'}`}>
        
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className={`md:hidden p-2 border-2 !border-[#212121]/40 rounded-lg bg-muted/30  transition-colors ${isRTL ? 'ml-3' : 'mr-3'}`}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        {/* Logo and Brand */}
        <Link 
          href="/" 
          className={`flex items-center hover:opacity-80 transition-opacity flex-shrink-0 ${isRTL ? 'ml-4 space-x-reverse' : 'mr-4'} space-x-2 ${isMobileMenuOpen ? 'hidden' : 'flex'} md:flex`}
        >
          <img 
            src="/app-icon.svg" 
            alt="Collactions Logo" 
            className="w-11 h-11 md:w-10 md:h-10 pointer-events-none drop-shadow-sm"
          />
          <div className="hidden sm:block">
            <CollactionsLogo size="sm" />
          </div>
        </Link>
      
        {/* Search Bar - Desktop */}
        {showSearch && (
          <div className={`hidden md:flex  flex-1 max-w-md ${isRTL ? 'ml-8 mr-4' : 'mx-8'}`}>
            <form onSubmit={handleSearch} className="w-full relative">
              <Search className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                placeholder={getTranslation('search_placeholder', language)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full py-2 bg-background border border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </form>
          </div>
        )}

        {/* Desktop Navigation & Actions */}
        <div className={`hidden md:flex items-center ${isRTL ? 'mr-auto ml-0' : 'ml-auto mr-0'} ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
          {/* Theme Toggle */}
          <div className={`px-2 ${isRTL ? 'ml-5' : 'mr-5'}`}>
            <ThemeToggle />
          </div>
          
          {/* Navigation Buttons */}
          <button
            title={getTranslation('terminal', language)}
            onClick={() => router.push('/terminal')}
            className="p-3 group relative transition-all duration-300 ease-in-out"
          >
            <span
              className="absolute inset-0 rounded-lg bg-gradient-to-tr from-[#00f3ff]/40 to-muted/30 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 blur-sm pointer-events-none"
              aria-hidden="true"
            />
            <Terminal className="relative  text-foreground/60 group-hover:text-foreground/70 transition-colors duration-500 scale-100 group-hover:scale-110" />
            <span className="sr-only">{getTranslation('terminal', language)}</span>
          </button>
          
          <button 
            title={getTranslation('prompts', language)}
            onClick={() => router.push('/prompts')}
            className="p-3 group relative transition-all duration-300 ease-in-out"
          >
            <span
              className="absolute inset-0 rounded-lg bg-gradient-to-tr from-[#00f3ff]/40 to-muted/30 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 blur-sm pointer-events-none"
              aria-hidden="true"
            />
            <MessageSquare className="relative  text-foreground/60 group-hover:text-foreground/70 transition-colors duration-500 scale-100 group-hover:scale-110" />
            <span className="sr-only">{getTranslation('prompts', language)}</span>
          </button>
          
          <button
            title={getTranslation('dashboard', language)}
            onClick={() => router.push('/dashboard')}
            className="p-3 group relative transition-all duration-300 ease-in-out"
          >
            <span
              className="absolute inset-0 rounded-lg bg-gradient-to-tr from-[#00f3ff]/40 to-muted/30 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 blur-sm pointer-events-none"
              aria-hidden="true"
            />
            <Activity className="relative  text-foreground/60 group-hover:text-foreground/70 transition-colors duration-500 scale-100 group-hover:scale-110" />
            <span className="sr-only">{getTranslation('dashboard', language)}</span>
          </button>
          
          <button
            title={getTranslation('settings', language)}
            onClick={() => router.push('/settings')}
            className="p-3 group relative transition-all duration-300 ease-in-out"
          >
            <span
              className="absolute inset-0 rounded-lg bg-gradient-to-tr from-[#00f3ff]/40 to-muted/30 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 blur-sm pointer-events-none"
              aria-hidden="true"
            />
            <Settings className="relative  text-foreground/60 group-hover:text-foreground/70 transition-colors duration-500 scale-100 group-hover:scale-110" />
            <span className="sr-only">{getTranslation('settings', language)}</span>
          </button>
          
          <button
            title={getTranslation('profile', language)}
            onClick={() => router.push('/profile')}
            className="p-3 group relative transition-all duration-300 ease-in-out"
          >
            <span
              className="absolute inset-0 rounded-lg bg-gradient-to-tr from-[#00f3ff]/40 to-muted/30 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 blur-sm pointer-events-none"
              aria-hidden="true"
            />
            <User className="relative  text-foreground/60 group-hover:text-foreground/70 transition-colors duration-500 scale-100 group-hover:scale-110" />
            <span className="sr-only">{getTranslation('profile', language)}</span>
          </button>
          
          {/* Language Toggle */}
          <button 
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="p-3 group relative transition-all duration-300 ease-in-out"
            title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            <span
              className="absolute inset-0 rounded-lg bg-gradient-to-tr from-[#00f3ff]/40 to-muted/30 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 blur-sm pointer-events-none"
              aria-hidden="true"
            />
            <Globe className="relative  text-foreground/60 group-hover:text-foreground/70 transition-colors duration-500 scale-100 group-hover:scale-110" />
            <span className="sr-only">{language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}</span>
          </button>
          
          {/* Spacer between Language and Profile */}
          <div className={`${isRTL ? 'ml-4' : 'mr-4'}`}></div>
          
          {/* Authentication */}
          {isLoaded && (
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-1`}>
              {isSignedIn ? (
                <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-1`}>
                  {/* Welcome Animation with fixed width to prevent movement */}
                  <div className={`hidden lg:block w-48 overflow-hidden ${isRTL ? 'text-right order-2' : 'text-left order-1'}`}>
                    <TypingAnimation 
                      text={`${language === 'ar' ? 'مرحباً' : 'Welcome'}, ${user?.firstName || user?.fullName || 'User'} 👋🏼`} 
                      className="text-xl text-foreground whitespace-nowrap"
                      isRTL={isRTL}
                    />
                  </div>
                  <div className="order-2">
                    <UserButton 
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8 theme-gradient-text hover:theme-glow"
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <SignInButton mode="modal">
                  <button className={`flex items-center px-4 py-2 bg-primary text-[#f8f8f8] rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                    <User className="w-4 h-4" />
                    <span>{language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
                  </button>
                </SignInButton>
              )}
            </div>
          )}
        </div>

        {/* Mobile Actions */}
        <div className={`md:hidden  flex items-center ${isRTL ? 'mr-auto ml-0' : 'ml-auto mr-0'} ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
          
          {/* Search Button - Mobile */}
          {showSearch && (
            <button 
              className="p-2 rounded-lg hover:bg-[var(--user-bg)] transition-colors"
              onClick={() => router.push('/search')}
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          {/* Language Toggle - Mobile */}
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            title={language === 'ar' ? 'English' : 'العربية'}
          >
            <Globe className="w-5 h-5" />
          </button>

          {/* Theme Toggle - Mobile */}
          <div className="scale-75">
            <ThemeToggle />
          </div>

          {/* Auth Section - Mobile */}
          {isLoaded && (
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
              {isSignedIn ? (
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              ) : (
                <SignInButton mode="modal">
                  <button className="p-2 rounded-lg hover:bg-accent transition-colors">
                    <User className="w-5 h-5" />
                  </button>
                </SignInButton>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop overlay to close menu when clicking outside */}
          <div 
            className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu content */}
          <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-sm border shadow-lg z-[9999]">
            <div className="px-4 py-6 space-y-4">
            
            {/* Mobile Search */}
            {showSearch && (
              <form onSubmit={handleSearch} className="relative">
                <Search className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  placeholder={getTranslation('search_placeholder', language)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full py-3 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </form>
            )}

            {/* Mobile Navigation */}
            <nav className="space-y-3 ">
              <button 
                onClick={() => {
                  router.push('/dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-3 rounded-lg hover:bg-accent transition-colors font-medium ${isRTL ? 'flex-row-reverse space-x-reverse' : 'flex-row'} space-x-3`}
              >
                <Activity className="w-5 h-5 text-primary-hover" />
                <span>{getTranslation('dashboard', language)}</span>
              </button>
              
              <button 
                onClick={() => {
                  router.push('/prompts');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-3 rounded-lg hover:bg-accent transition-colors font-medium ${isRTL ? 'flex-row-reverse space-x-reverse' : 'flex-row'} space-x-3`}
              >
                <MessageSquare className="w-5 h-5 text-primary" />
                <span>{getTranslation('prompts', language)}</span>
              </button>
              
              <button 
                onClick={() => {
                  router.push('/terminal');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-3 rounded-lg hover:bg-accent transition-colors font-medium ${isRTL ? 'flex-row-reverse space-x-reverse' : 'flex-row'} space-x-3`}
              >
                <Terminal className="w-5 h-5 text-primary" />
                <span>{getTranslation('terminal', language)}</span>
              </button>
              
              {isSignedIn && (
                <>
                  <button 
                    onClick={() => {
                      router.push('/profile');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-3 rounded-lg hover:bg-accent transition-colors font-medium ${isRTL ? 'flex-row-reverse space-x-reverse' : 'flex-row'} space-x-3`}
                  >
                    <User className="w-5 h-5 text-primary" />
                    <span>{getTranslation('profile', language)}</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      router.push('/settings');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-3 rounded-lg hover:bg-accent transition-colors font-medium ${isRTL ? 'flex-row-reverse space-x-reverse' : 'flex-row'} space-x-3`}
                  >
                    <Settings className="w-5 h-5 text-primary" />
                    <span>{getTranslation('settings', language)}</span>
                  </button>
                </>
              )}
            </nav>

            {/* Mobile User Info */}
            {isSignedIn && user && (
              <div className="pt-4 border-t border-border">
                <div className={`flex items-center px-3 py-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : 'flex-row'} space-x-3`}>
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
                    {(user.firstName?.[0] || user.fullName?.[0] || 'U').toUpperCase()}
                  </div>
                  <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className="font-medium w-40 overflow-hidden">
                      <TypingAnimation 
                        text={`${language === 'ar' ? 'أهلاً' : 'Hello'}, ${user.firstName || user.fullName || 'User'}!`}
                        className="text-md text-foreground  whitespace-nowrap"
                        isRTL={isRTL}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </>
      )}
    </header>
  );
};

export default Header;

