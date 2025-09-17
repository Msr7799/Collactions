'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface CollactionsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CollactionsLogo: React.FC<CollactionsLogoProps> = ({ 
  className = '',
  size = 'md'
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const sizeClasses = {
    sm: 'text-lg tracking-wider',
    md: 'text-2xl tracking-wide',
    lg: 'text-4xl tracking-wider'
  };
  
  return (
    <div className={`${className}`}>
      <h1 
        className={`
          font-bold ${sizeClasses[size]}
          transition-all duration-300 hover:opacity-90
          ${isDark 
            ? 'text-white' 
            : 'text-gray-900'
          }
        `}
        style={{
          fontFamily: 'var(--font-biting), BitingMyNails, Orbitron, monospace, Arial, sans-serif',
          textShadow: isDark 
            ? '0 0 8px rgba(255, 255, 255, 0.3), 0 0 16px rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.8)' 
            : '0 0 6px rgba(0, 0, 0, 0.2), 0 0 12px rgba(0, 0, 0, 0.1), 1px 1px 2px rgba(255, 255, 255, 0.8)',
          filter: 'brightness(1.05)'
        }}
      >
        COLLACTIONS
      </h1>
    </div>
  );
};

export default CollactionsLogo;
