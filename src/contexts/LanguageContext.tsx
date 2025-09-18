'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ 
  children: React.ReactNode;
  initialLanguage?: Language;
}> = ({ children, initialLanguage = 'ar' }) => {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isRTL = language === 'ar';

  useEffect(() => {
    setIsClient(true);
    setIsLoading(false);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    // Set cookie and refresh page to re-render server with new language
    document.cookie = `lang=${lang}; path=/; max-age=${365 * 24 * 60 * 60}; samesite=lax`;
    setLanguage(lang);
    router.refresh(); // Trigger server re-render with new cookie
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage: handleSetLanguage, 
      isRTL,
      isLoading 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Return default values during SSR
    if (typeof window === 'undefined') {
      return {
        language: 'ar' as Language,
        setLanguage: () => {},
        isRTL: true,
        isLoading: false
      };
    }
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
