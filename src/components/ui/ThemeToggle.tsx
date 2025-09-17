'use client';

import React from 'react';
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
        relative flex items-center justify-center w-12 h-12 rounded-full
        transition-all duration-500 ease-in-out
        focus:outline-none
        ${isDark 
          ? `shadow-[0_8px_32px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.05)]` 
          : `shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.6)]`
        }
      `}
      style={{
        background: isDark ? '#1a1a1a' : '#e0e0e0'
      }}
    >
      {/* الهالة الضوئية المتدرجة */}
      <div 
        className={`absolute inset-[-2px] rounded-full transition-opacity duration-500 ${
          isDark ? 'opacity-100' : 'opacity-60'
        }`}
        style={{
          background: `conic-gradient(
            from 315deg,
            #ff0022ff 0deg,
            #ff380bff 90deg,
            #FF847C 120deg,
            #e5a938ff 160deg,
            #f57283ff 360deg
          )`,
          filter: 'blur(4px)'
        }}
      />
      
      {/* الخلفية الداخلية */}
      <div 
        className="absolute inset-[2px] rounded-full"
        style={{
          background: isDark ? '#1a1a1a' : '#e0e0e0'
        }}
      />
      
      {/* رمز الطاقة */}
      <div className="relative z-10 flex items-center justify-center">
        <svg 
          width="28" 
          height="28" 
          viewBox="0 0 24 24" 
          className={`transition-all duration-500 ${
            isDark 
              ? 'text-[#cccccc] drop-shadow-[0_0_8px_rgba(204,204,204,0.6)]' 
              : 'text-[#333333]'
          }`}
        >
          {/* Power Symbol (⏻) */}
          <circle
            cx="12"
            cy="12"
            r="5.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="13.2 2.9"
            strokeDashoffset="1.45"
          />
          <line
            x1="12"
            y1="4"
            x2="12"
            y2="12"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      
      {/* إضاءة داخلية خفيفة */}
      <div 
        className={`absolute inset-0 rounded-full pointer-events-none transition-opacity duration-500 ${
          isDark ? 'opacity-20' : 'opacity-40'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)'
        }}
      />
    </button>
  );
};

export default ThemeToggle;
