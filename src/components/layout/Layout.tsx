'use client';

import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showSearch?: boolean;
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title, showSearch, hideFooter }) => {
  return (
    <div className="relative min-h-screen z-50 text-foreground m-0 p-0 bg-background flex flex-col" title={title}>
      <main className="flex-1 z-50 relative ">
              <div className="z-50 relative">
        <Header title={title} showSearch={showSearch} />
      </div>
      {children}
    </main>
    {!hideFooter && (
      <div className="relative z-50">
        <Footer />
        </div>
      )}
    </div>
  );
};

export default Layout;
