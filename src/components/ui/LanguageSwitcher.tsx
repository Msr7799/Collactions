'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export const LanguageSwitcher = () => {
  const { language, setLanguage, isRTL } = useLanguage();

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
      suppressHydrationWarning
      title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      {language === 'ar' ? 'English' : 'العربية'}
    </button>
  );
};

export default LanguageSwitcher;