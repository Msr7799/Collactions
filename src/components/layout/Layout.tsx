'use client';

import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import AnimatedDotsBackground from '../ui/AnimatedDotsBackground';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showSearch?: boolean;
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title, showSearch, hideFooter }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="relative min-h-screen text-foreground overflow-x-hidden">
      <AnimatedDotsBackground />
      <Header title={title} showSearch={showSearch} />
      <main className={`flex-1 relative z-10 w-full ${
        isMobile 
          ? 'px-4 py-6' 
          : 'px-6 py-8'
      }`}>
        <div className="w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout;
