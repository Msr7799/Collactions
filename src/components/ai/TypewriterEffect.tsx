'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import remarkGfm from 'remark-gfm';

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

interface TypewriterEffectProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
  isThinking?: boolean;
  renderMarkdown?: boolean;
}

export default function TypewriterEffect({ 
  text, 
  speed = 15, 
  onComplete, 
  className = '',
  isThinking = false,
  renderMarkdown = true
}: TypewriterEffectProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Check if text has complex markdown that should skip typing animation
  const hasComplexMarkdown = text.includes('```') || 
                             text.includes('|') || 
                             text.includes('![') || 
                             text.match(/#{2,}/) || 
                             text.includes('*') && text.split('*').length > 4 ||
                             text.includes('_') && text.split('_').length > 4 ||
                             text.includes('[') && text.includes('](');

  useEffect(() => {
    // If text has complex markdown, skip typing animation
    if (hasComplexMarkdown && renderMarkdown && !isThinking) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
      setIsComplete(true);
      if (onComplete) {
        setTimeout(onComplete, 100);
      }
      return;
    }

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (!isComplete && displayedText.length === text.length) {
      setIsComplete(true);
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentIndex, text, speed, onComplete, displayedText.length, isComplete, hasComplexMarkdown, renderMarkdown, isThinking]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  const baseClasses = isThinking 
    ? 'text-muted text-sm italic leading-relaxed' 
    : 'leading-relaxed';

  const cursorClass = currentIndex < text.length ? 'animate-pulse' : '';

  // If markdown is disabled or we're in thinking mode, show as plain text
  if (!renderMarkdown || isThinking) {
    return (
      <div className={`${baseClasses} ${className}`}>
        {displayedText}
        {currentIndex < text.length && (
          <span className={`inline-block w-2 h-5 bg-primary ml-1 ${cursorClass}`}>|</span>
        )}
        {isThinking && currentIndex < text.length && (
          <span className="ml-2 text-xs text-muted/60">🧠 يفكر...</span>
        )}
      </div>
    );
  }

  // Show typewriter effect with safe markdown rendering
  const safeDisplayedText = displayedText || '';
  
  // If we're complete, show full markdown
  if (isComplete || currentIndex >= text.length) {
    return (
      <div className={className}>
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            code: ({ className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              
              if (!className) {
                return (
                  <code className="bg-gray-800 text-gray-200 px-2 py-1 rounded text-sm font-mono">
                    {children}
                  </code>
                );
              }
              
              return (
                <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              );
            },
            img: ({src, alt, ...props}) => (
              <img 
                src={src}
                alt={alt || 'Image'}
                className="max-w-full h-auto rounded-lg shadow-lg cursor-pointer"
                style={{ maxHeight: '500px', objectFit: 'contain' }}
                {...props}
              />
            )
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    );
  }

  // During typing, show plain text to avoid markdown parsing errors
  return (
    <div className={`${baseClasses} ${className}`}>
      <span className="whitespace-pre-wrap">{safeDisplayedText}</span>
      {currentIndex < text.length && (
        <span className={`inline-block w-2 h-5 bg-primary ml-1 ${cursorClass}`}>|</span>
      )}
    </div>
  );
}
