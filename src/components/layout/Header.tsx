'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Bell, Search, Moon, Sun, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@clerk/nextjs';
import CollactionsLogo from '@/components/logo/CollactionsLogo';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  onMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showSearch = true, onMenuToggle }) => {
  const { language, setLanguage, isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { isSignedIn, user, isLoaded } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

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

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-50 w-full border-b backdrop-blur-md supports-[backdrop-filter]:bg-background/85 shadow-sm">
      <div className={`w-full flex h-16 md:h-18 items-center px-4 md:px-6 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
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
          className={`flex items-center space-x-2 hover:opacity-80 transition-opacity ${isRTL ? 'ml-4' : 'mr-4'} ${isMobileMenuOpen ? 'hidden' : 'flex'} md:flex`}
        >
          <img 
            src="/app-icon.svg" 
            alt="Collactions Logo" 
            className="w-8 h-8 md:w-10 md:h-10 pointer-events-none drop-shadow-sm"
          />
          <div className="hidden sm:block">
            <CollactionsLogo size="sm" />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 ml-8">
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
            {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
          </Link>
          <Link href="/prompts" className="text-sm font-medium hover:text-primary transition-colors">
            {language === 'ar' ? 'المحادثات' : 'Chat'}
          </Link>
          <Link href="/terminal" className="text-sm font-medium hover:text-primary transition-colors">
            {language === 'ar' ? 'الطرفية' : 'Terminal'}
          </Link>
        </nav>

        {/* Search Bar - Desktop */}
        {showSearch && (
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={language === 'ar' ? 'البحث...' : 'Search...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </form>
          </div>
        )}

        {/* Right Actions */}
        <div className={`flex items-center ${isRTL ? 'mr-auto ml-0' : 'ml-auto mr-0'} space-x-2`}>
          
          {/* Search Button - Mobile */}
          {showSearch && (
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              onClick={() => router.push('/search')}
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            title={language === 'ar' ? 'English' : 'العربية'}
          >
            <Globe className="w-5 h-5" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            title={isDark ? (language === 'ar' ? 'الوضع الفاتح' : 'Light Mode') : (language === 'ar' ? 'الوضع المظلم' : 'Dark Mode')}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications - Desktop only */}
          {isSignedIn && (
            <button className="hidden md:block p-2 rounded-lg hover:bg-accent transition-colors relative">
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </button>
          )}

          {/* Auth Section */}
          {isLoaded && (
            <div className="flex items-center space-x-2">
              {isSignedIn ? (
                <div className="flex items-center space-x-2">
                  <div className="hidden md:block text-sm">
                    <div className="font-medium">{user?.fullName || user?.firstName}</div>
                  </div>
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                    {(user?.firstName?.[0] || user?.fullName?.[0] || 'U').toUpperCase()}
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b shadow-lg">
          <div className="px-4 py-6 space-y-4">
            
            {/* Mobile Search */}
            {showSearch && (
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'البحث...' : 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </form>
            )}

            {/* Mobile Navigation */}
            <nav className="space-y-3">
              <Link 
                href="/dashboard" 
                className="block px-3 py-2 rounded-lg hover:bg-accent transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
              </Link>
              <Link 
                href="/prompts" 
                className="block px-3 py-2 rounded-lg hover:bg-accent transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {language === 'ar' ? 'المحادثات' : 'Chat'}
              </Link>
              <Link 
                href="/terminal" 
                className="block px-3 py-2 rounded-lg hover:bg-accent transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {language === 'ar' ? 'الطرفية' : 'Terminal'}
              </Link>
              {isSignedIn && (
                <>
                  <Link 
                    href="/profile" 
                    className="block px-3 py-2 rounded-lg hover:bg-accent transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
                  </Link>
                  <Link 
                    href="/settings" 
                    className="block px-3 py-2 rounded-lg hover:bg-accent transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {language === 'ar' ? 'الإعدادات' : 'Settings'}
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile User Info */}
            {isSignedIn && user && (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
                    {(user.firstName?.[0] || user.fullName?.[0] || 'U').toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{user.fullName || user.firstName}</div>
                    <div className="text-sm text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;