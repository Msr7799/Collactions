'use client';

import React, { useState, useEffect, useRef } from 'react';

interface TypingAnimationProps {
  text: string;
  speed?: number;
  className?: string;
  startDelay?: number;
  pauseDuration?: number;
  isRTL?: boolean;
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({ 
  text, 
  speed = 80, 
  className = '',
  startDelay = 0,
  pauseDuration = 2000,
  isRTL = false
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let index = 0;
    let isDeleting = false;
    
    const animate = () => {
      if (!isDeleting) {
        // Typing phase
        if (index < text.length) {
          setDisplayedText(text.substring(0, index + 1));
          setIsTyping(true);
          index++;
          timeoutRef.current = setTimeout(animate, speed);
        } else {
          // Pause before deleting
          setIsTyping(false);
          timeoutRef.current = setTimeout(() => {
            isDeleting = true;
            animate();
          }, pauseDuration);
        }
      } else {
        // Deleting phase
        if (index > 0) {
          setDisplayedText(text.substring(0, index - 1));
          setIsTyping(true);
          index--;
          timeoutRef.current = setTimeout(animate, speed / 2);
        } else {
          // Pause before typing again
          setIsTyping(false);
          isDeleting = false;
          timeoutRef.current = setTimeout(animate, startDelay);
        }
      }
    };

    // Start animation after initial delay
    timeoutRef.current = setTimeout(animate, startDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed, startDelay, pauseDuration]);

  return (
    <span 
      className={className} 
      style={{ 
        display: 'inline-block', 
        minWidth: '120px', // Fixed width to prevent layout shift
        textAlign: isRTL ? 'right' : 'left'
      }}
    >
      {displayedText}
      <span className="animate-pulse text-primary ml-1">|</span>
    </span>
  );
};

export default TypingAnimation;
