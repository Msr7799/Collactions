'use client';

import React from 'react';
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
  return (
    <div className="relative min-h-screen text-foreground">
      <AnimatedDotsBackground />
      <Header title={title} showSearch={showSearch} />
      <main className="flex-1 relative z-10">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout;
