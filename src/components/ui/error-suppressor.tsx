'use client';

import { useEffect } from 'react';

export function ErrorSuppressor() {
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      const message = args[0]?.toString() || '';
      
      // قمع أخطاء NextJS المعروفة
      if (message.includes('Route "/" used `...headers()`') ||
          message.includes('headers() should be awaited') ||
          message.includes('sync-dynamic-apis') ||
          message.includes('Failed to get subsystem status') ||
          message.includes('Source map error') ||
          message.includes('Attempt to postMessage on disconnected port')) {
        return;
      }
      
      originalError(...args);
    };
    
    console.warn = (...args) => {
      const message = args[0]?.toString() || '';
      
      // قمع تحذيرات الأداء المعروفة
      if (message.includes('preloaded with link preload was not used') || 
          message.includes('non-static position') ||
          message.includes('LCP')) {
        return;
      }
      
      originalWarn(...args);
    };
    
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);
  
  return null;
}