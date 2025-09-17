"use client";
import { useEffect, useRef, useState } from 'react';

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
  enableLogging = true
}) => {
  const [flickerCount, setFlickerCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = Math.abs(currentScrollY - lastScrollY.current);
      
      // Detect flicker with more intelligent threshold
      if (scrollDiff > threshold) {
        // Only count as flicker if it's not natural fast scrolling
        // Allow up to 800px jump for legitimate fast scrolling
        const isLegitimateScroll = scrollDiff <= 800 && Math.abs(currentScrollY - lastScrollY.current) > 0;
        
        if (!isLegitimateScroll) {
          setFlickerCount(prev => {
            const newCount = prev + 1;
            if (enableLogging) {
              console.warn('🚨 Scroll flicker detected:', {
                reason: 'Large scroll jump detected',
                scrollDifference: scrollDiff,
                currentScrollY,
                lastScrollY: lastScrollY.current,
                flickerCount: newCount,
                threshold,
                timestamp: new Date().toISOString(),
                possibleCause: scrollDiff > 800 ? 'Sudden layout shift' : 'Fast scrolling'
              });
            }
            return newCount;
          });
        } else if (enableLogging && scrollDiff > 400) {
          console.log('✅ Legitimate fast scroll detected:', {
            scrollDifference: scrollDiff,
            currentScrollY,
            lastScrollY: lastScrollY.current,
            status: 'Normal behavior'
          });
        }
      }
      
      // تأخير التحديث لمنع الوميض
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
      
      scrollTimer.current = setTimeout(() => {
        lastScrollY.current = currentScrollY;
        
        if (enableLogging && scrollDiff > 50) {
          console.log('📜 Smooth scroll handled:', {
            scrollY: currentScrollY,
            smoothed: true,
            delay: `${delay}ms`,
            component: 'FlickerPreventor'
          });
        }
      }, delay);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    if (enableLogging) {
      console.log('🛡️ FlickerPreventor initialized:', {
        threshold,
        delay: `${delay}ms`,
        logging: enableLogging
      });
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
    };
  }, [threshold, delay, enableLogging]);

  // Monitor DOM changes to detect real flicker causes
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && enableLogging) {
          const target = mutation.target as HTMLElement;
          
          // Filter out legitimate SVG animations and styles
          if (target.tagName === 'path' && 
              ['pathLength', 'stroke-dashoffset', 'stroke-dasharray'].includes(mutation.attributeName || '')) {
            return; // Skip SVG animation attributes
          }
          
          // Filter out Framer Motion and other animation libraries
          if (mutation.attributeName === 'style' && target.style.transform) {
            return; // Skip transform animations
          }
          
          // Filter out Clerk authentication loading states
          if (target.className && target.className.toString().includes('cl-')) {
            return; // Skip Clerk component updates
          }
          
          // Filter out Google Gemini effect animations
          if (target.tagName === 'svg' || target.closest('.google-gemini-effect')) {
            return; // Skip SVG and gemini effect updates
          }
          
          // Focus on critical layout-affecting attributes only
          const criticalAttributes = ['class', 'dir', 'placeholder', 'title'];
          if (criticalAttributes.includes(mutation.attributeName || '')) {
            // Additional filter: Skip small CSS class changes that don't affect layout
            if (mutation.attributeName === 'class') {
              const oldClasses = (mutation.oldValue || '').split(' ');
              const newClasses = target.className.toString().split(' ');
              
              // Skip if only language-transition class was added/removed
              const oldFiltered = oldClasses.filter(cls => cls !== 'language-transition');
              const newFiltered = newClasses.filter(cls => cls !== 'language-transition');
              
              if (oldFiltered.join(' ') === newFiltered.join(' ')) {
                return; // Skip language-transition only changes
              }
              
              // Check if only margin/padding classes changed (this is language switching)
              const layoutClasses = ['ml-', 'mr-', 'pl-', 'pr-', 'space-x', 'text-'];
              const hasLayoutChange = [...oldClasses, ...newClasses].some(cls => 
                layoutClasses.some(prefix => cls.startsWith(prefix))
              );
              
              if (!hasLayoutChange) {
                return; // Skip non-layout class changes
              }
            }
            
            const className = target.className && typeof target.className === 'string' 
              ? target.className.split(' ').join('.') 
              : target.className?.toString() || '';
              
            console.warn('⚠️ Critical DOM change (real flicker cause):', {
              element: target.tagName + (className ? '.' + className : ''),
              attributeName: mutation.attributeName,
              oldValue: mutation.oldValue,
              newValue: target.getAttribute(mutation.attributeName || ''),
              component: 'FlickerPreventor',
              reason: mutation.attributeName === 'dir' ? 'Language switch' : 
                     mutation.attributeName === 'class' ? 'CSS class change' :
                     'Attribute update'
            });
          }
        }
      });
    });

    observer.observe(containerRef.current, {
      attributes: true,
      attributeOldValue: true,
      subtree: true,
      attributeFilter: ['class', 'dir', 'placeholder', 'title', 'style'] // Only monitor critical attributes
    });

    return () => observer.disconnect();
  }, [enableLogging]);

  return (
    <div 
      ref={containerRef}
      className={`flicker-prevented ${className}`}
      style={{
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)', // GPU acceleration without will-change
        transition: 'transform 0.1s ease-out'
      }}
    >
      {children}
      
      {/* عداد الوميض - معطل مؤقتاً */}
      {false && process.env.NODE_ENV === 'development' && flickerCount > 0 && (
        <div 
          className="fixed bottom-4 left-4 bg-gray-800 text-white px-2 py-1 rounded text-xs z-50 opacity-50"
          style={{ fontSize: '10px' }}
        >
          Debug: {flickerCount} flickers
        </div>
      )}
    </div>
  );
};

export default FlickerPreventor;