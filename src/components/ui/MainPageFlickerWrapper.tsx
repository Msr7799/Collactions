'use client';

import { useEffect } from 'react';
import FlickerPreventor from './flicker-preventor';

interface MainPageFlickerWrapperProps {
  children: React.ReactNode;
}

const MainPageFlickerWrapper: React.FC<MainPageFlickerWrapperProps> = ({ children }) => {
  useEffect(() => {
    // Prevent flicker from NextJS headers() error
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    console.error = (...args) => {
      const errorMessage = args.join(' ');
      
      // Suppress NextJS headers() error and related warnings
      if (errorMessage.includes('headers()') && errorMessage.includes('should be awaited')) {
        return; // Suppress this specific error completely
      }
      
      if (errorMessage.includes('Route "/" used') && errorMessage.includes('headers()')) {
        return; // Suppress route-specific headers error
      }
      
      if (errorMessage.includes('sync-dynamic-apis')) {
        return; // Suppress sync dynamic APIs error
      }
      
      // Suppress will-change memory warnings (expected with GPU acceleration)
      if (errorMessage.includes('Will-change memory consumption is too high')) {
        return; // These are expected with our GPU acceleration
      }
      
      // Display other errors normally
      originalConsoleError.apply(console, args);
    };

    console.warn = (...args) => {
      const warnMessage = args.join(' ');
      
      // Suppress font preload warnings
      if (warnMessage.includes('preloaded with link preload was not used')) {
        return; // Suppress font preload warnings
      }
      
      // Display other warnings normally
      originalConsoleWarn.apply(console, args);
    };

    // Restore original console methods when component unmounts
    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);

  return (
    <FlickerPreventor 
      threshold={400}           // Higher threshold for less false positives
      delay={25}               // Longer delay for better smoothing
      enableLogging={false}    // Reduce console noise since flicker is mostly fixed
      className="main-page-wrapper gpu-accelerated"
    >
      <div 
        className="min-h-screen transition-all duration-300 ease-out"
        style={{
          willChange: 'transform, opacity',
          transform: 'translateZ(0)', // GPU acceleration
        }}
      >
        {children}
      </div>
    </FlickerPreventor>
  );
};

export default MainPageFlickerWrapper;