'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');
  const [isClient, setIsClient] = useState(false);

  const isRTL = language === 'ar';

  useEffect(() => {
    setIsClient(true);
    // Load saved language from localStorage
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      // Save language to localStorage and update document direction with smooth transition
      localStorage.setItem('language', language);
      
      // Add CSS transition class to prevent flicker during language switch
      const html = document.documentElement;
      const body = document.body;
      
      // Pre-apply transition to all elements that will change
      const elementsToTransition = document.querySelectorAll('*');
      elementsToTransition.forEach(el => {
        if (el instanceof HTMLElement) {
          el.classList.add('language-transition');
        }
      });
      
      // Use requestAnimationFrame to batch DOM updates and prevent layout shifts
      requestAnimationFrame(() => {
        // Batch all DOM changes together
        html.dir = isRTL ? 'rtl' : 'ltr';
        html.lang = language;
        
        // Add a smaller delay for DOM to settle, then remove transition classes
        setTimeout(() => {
          elementsToTransition.forEach(el => {
            if (el instanceof HTMLElement) {
              el.classList.remove('language-transition');
            }
          });
        }, 100); // Much faster removal (was 350ms)
      });
    }
  }, [language, isRTL, isClient]);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage: handleSetLanguage, 
      isRTL 
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
        isRTL: true
      };
    }
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
