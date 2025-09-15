'use client';

import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface TransparentLayoutProps {
  children: React.ReactNode;
  title?: string;
  showSearch?: boolean;
  hideFooter?: boolean;
}

const TransparentLayout: React.FC<TransparentLayoutProps> = ({ children, title, showSearch, hideFooter }) => {
  return (
    <div className="relative min-h-screen h-full text-foreground z-20 m-0 p-0 flex flex-col" title={title}>
      <main className="flex-1 relative">
        <div className="relative">
          <Header title={title} showSearch={showSearch || true} />
        </div>
        {children}
      </main>
      {!hideFooter && (
        <div className="relative">
          <Footer />
        </div>
      )}
    </div>
  );
};

export default TransparentLayout;