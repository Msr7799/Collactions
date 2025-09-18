"use client";
import React from 'react';

interface FlickerPreventorProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  delay?: number;
  enableLogging?: boolean;
}

export const FlickerPreventor: React.FC<FlickerPreventorProps> = ({
  children,
  className = '',
  threshold = 100,
  delay = 10,
  enableLogging = false
}) => {
  // إزالة كل المراقبة لحل مشكلة الـ infinite loop
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default FlickerPreventor;