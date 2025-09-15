'use client';
import React, { useEffect } from 'react';
import { Check } from 'lucide-react';

interface SaveNotificationProps {
  show: boolean;
  message: string;
  onHide: () => void;
}

export default function SaveNotification({ show, message, onHide }: SaveNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!show) return null;

  return (
    <div className="fixed top-5 right-5 z-[1001] bg-green-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-[slideDown_0.3s_ease-out]">
      <Check size={16} />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
