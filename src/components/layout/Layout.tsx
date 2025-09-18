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
    <div className="relative min-h-screen bg-very-dark-bg h-full text-foreground z-50 m-0 p-0 flex flex-col w-full" title={title}>
      <main className="flex-1 relative w-full">
        <div className="relative z-50 w-full">
          <Header title={title} showSearch={false} />
        </div>
        {children}
      </main>
   
      {!hideFooter && (
        <div className="relative ">
          <Footer />
        </div>
      )}
    </div>
  );
};

export default Layout;
