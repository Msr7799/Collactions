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
    <button
      onClick={toggleTheme}
      className={`
        relative flex items-center justify-center w-10 h-10 rounded-full
        focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-transparent
        ${isDark 
          ? `bg-gradient-to-br from-white via-cyan-50 to-blue-50 
             border-2 border-cyan-300/40 
             shadow-[0_0_8px_rgba(34,211,238,0.3),inset_0_1px_2px_rgba(255,255,255,0.5)]
             focus:ring-cyan-300/50` 
          : `bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 
             border-2 border-gray-600/60 backdrop-blur-md
             shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.4)]
             focus:ring-gray-400/30`
        }
      `}
    >
      {/* Main icon */}
      <div className="relative z-10">
        {isDark ? (
          <Moon className="h-5 w-5 text-gray-800/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" />
        ) : (
          <Sun className="h-5 w-5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
        )}
      </div>
      
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-40 pointer-events-none" />
    </button>
  );
};

export default ThemeToggle;
