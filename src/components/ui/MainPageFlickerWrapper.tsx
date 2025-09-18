'use client';

import React from 'react';

interface MainPageFlickerWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const MainPageFlickerWrapper: React.FC<MainPageFlickerWrapperProps> = ({
  children,
  className = '',
}) => {
  // إزالة كل المراقبة والتحسينات - سبب الـ infinite loop
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
};

export default MainPageFlickerWrapper;