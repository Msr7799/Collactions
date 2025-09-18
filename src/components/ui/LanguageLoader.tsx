'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * Component to prevent language-dependent content from flickering during hydration.
 * Shows a fallback while the language context is loading from localStorage.
 */
export const LanguageLoader: React.FC<LanguageLoaderProps> = ({ 
  children, 
  fallback = null,
  className 
}) => {
  const { isLoading } = useLanguage();

  if (isLoading) {
    return fallback ? (
      <div className={className} suppressHydrationWarning>
        {fallback}
      </div>
    ) : (
      <div className={className} suppressHydrationWarning style={{ opacity: 0 }}>
        {children}
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};

export default LanguageLoader;