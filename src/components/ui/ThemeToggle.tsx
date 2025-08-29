'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language } = useLanguage();

  const isDark = theme === 'dark';

  return (
    <div className="flex items-center space-x-2">
      {/* Toggle Switch */}
      <button
        onClick={toggleTheme}
        className={`
          relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background
          ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'}
        `}
        title={language === 'ar' ? (isDark ? 'تبديل إلى المود النهاري' : 'تبديل إلى المود الليلي') : (isDark ? 'Switch to light mode' : 'Switch to dark mode')}
        aria-label={language === 'ar' ? 'تبديل المود' : 'Toggle theme'}
      >
        {/* Switch Handle */}
        <span
          className={`
            inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out
            ${isDark ? 'translate-x-7' : 'translate-x-1'}
          `}
        >
          {/* Icon inside the handle */}
          <span className="flex h-full w-full items-center justify-center">
            {isDark ? (
              <Moon className="h-3 w-3 text-gray-700" />
            ) : (
              <Sun className="h-3 w-3 text-yellow-500" />
            )}
          </span>
        </span>
      </button>

      {/* Optional Text Label */}
      <span className="text-sm text-foreground/70 hidden sm:inline">
        {language === 'ar' ? (isDark ? 'ليلي' : 'نهاري') : (isDark ? 'Dark' : 'Light')}
      </span>
    </div>
  );
};

export default ThemeToggle;
