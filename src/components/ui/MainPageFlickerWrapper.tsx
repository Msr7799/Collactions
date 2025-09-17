'use client';

import React, { useEffect, useRef, useCallback } from 'react';

interface MainPageFlickerWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const MainPageFlickerWrapper: React.FC<MainPageFlickerWrapperProps> = ({
  children,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastScrollY = useRef(0);
  
  // تحسين GPU مع استخدام أفضل للـ will-change
  const optimizeGPU = useCallback((el: HTMLElement) => {
    el.style.backfaceVisibility = 'hidden';
    el.style.transform = 'translateZ(0)';
    el.style.willChange = 'transform, opacity';
    
    // تحسين خاص للـ SVG elements
    const svgElements = el.querySelectorAll('svg, path');
    svgElements.forEach((svg) => {
      if (svg instanceof HTMLElement || svg instanceof SVGElement) {
        svg.style.willChange = 'pathLength, stroke-dashoffset, transform';
        svg.style.transform = 'translateZ(0)';
      }
    });
  }, []);

  // معالج السكرول المحسن
  const handleScroll = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      const scrollDiff = Math.abs(currentScrollY - lastScrollY.current);
      
      // فقط للتغييرات الكبيرة (أكثر من 1000px)
      if (scrollDiff > 1000) {
        console.warn('⚠️ Large scroll jump detected:', {
          scrollDiff,
          currentScrollY,
          lastScrollY: lastScrollY.current
        });
      }
      
      lastScrollY.current = currentScrollY;
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // تطبيق تحسينات GPU
    optimizeGPU(el);

    // إضافة معالج السكرول
    window.addEventListener('scroll', handleScroll, { passive: true });

    // مراقب DOM محسن ومصفى
    const observer = new MutationObserver((mutations) => {
      const significantMutations = mutations.filter(mutation => {
        const target = mutation.target as HTMLElement;
        
        // تجاهل تغييرات SVG المؤقتة
        if (target.tagName === 'path' || 
            target.tagName === 'svg' ||
            target.closest('svg')) {
          return false;
        }
        
        // تجاهل تغييرات Framer Motion
        if (mutation.attributeName === 'style' && 
            target.style.transform) {
          return false;
        }
        
        // تجاهل تغييرات Clerk
        if (target.className?.toString().includes('cl-')) {
          return false;
        }
        
        // فقط التغييرات المهمة للـ layout
        return ['class', 'dir'].includes(mutation.attributeName || '');
      });

      if (significantMutations.length > 0) {
        console.log('📌 Significant layout mutations:', significantMutations.length);
        
        // إعادة تطبيق تحسينات GPU بعد التغييرات المهمة
        requestAnimationFrame(() => optimizeGPU(el));
      }
    });

    observer.observe(el, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class', 'dir', 'style'],
    });

    // قمع الأخطاء والتحذيرات غير المهمة
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('headers()') || 
          message.includes('Will-change memory') ||
          message.includes('sync-dynamic-apis')) {
        return; // قمع
      }
      originalConsoleError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      if (message.includes('preloaded with link preload')) {
        return; // قمع
      }
      originalConsoleWarn.apply(console, args);
    };

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, [optimizeGPU, handleScroll]);

  return (
    <div
      ref={containerRef}
      className={`flicker-prevented ${className}`}
      style={{
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
        willChange: 'transform, opacity',
        // CSS transitions for smooth changes
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </div>
  );
};

export default MainPageFlickerWrapper;