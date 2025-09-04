'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import remarkGfm from 'remark-gfm';

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

// Enhanced CodeBlock with proper styling and features
const EnhancedCodeBlock = ({ language, children }: { language: string, children: any }) => {
  let codeContent = '';
  if (Array.isArray(children)) {
    codeContent = children.join('');
  } else {
    codeContent = String(children || '');
  }
  codeContent = codeContent.replace(/\n$/, '');

  return (
    <div className="relative group my-4">
      {/* Header with three dots and language */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-lg border-b border-gray-700">
        <div className="flex items-center space-x-2">
          {/* Three colored dots */}
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-gray-400 text-sm font-mono ml-3">{language}</span>
        </div>
        
        {/* Copy button */}
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(codeContent);
            } catch (err) {
              console.error('Failed to copy:', err);
            }
          }}
          className="text-gray-400 hover:text-gray-200 transition-colors p-1.5 rounded hover:bg-gray-700"
          title="Copy code"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
      
      {/* Code content */}
      <pre className="bg-gray-900 p-4 rounded-b-lg overflow-x-auto">
        <code className={`language-${language} text-sm leading-relaxed text-gray-100`}>
          {codeContent}
        </code>
      </pre>
    </div>
  );
};

interface TypewriterEffectProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
  isThinking?: boolean;
  renderMarkdown?: boolean;
  shouldAnimate?: boolean;
}

export default function TypewriterEffect({ 
  text, 
  speed = 15, 
  onComplete, 
  className = '',
  isThinking = false,
  renderMarkdown = true,
  shouldAnimate = true
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
    // If shouldAnimate is false, show text immediately without animation
    if (!shouldAnimate) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
      setIsComplete(true);
      if (onComplete) {
        setTimeout(onComplete, 100);
      }
      return;
    }

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
  }, [currentIndex, text, speed, onComplete, displayedText.length, isComplete, hasComplexMarkdown, renderMarkdown, isThinking, shouldAnimate]);

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
              const language = match ? match[1] : 'text';
              
              // Handle inline code (no className)
              if (!className) {
                return (
                  <code className="bg-gray-800 text-gray-200 px-2 py-1 rounded text-sm font-mono">
                    {children}
                  </code>
                );
              }
              
              // Use enhanced code block with three dots and proper styling
              return <EnhancedCodeBlock language={language} children={children} />;
            },
            img: ({src, alt, ...props}) => (
              src && typeof src === 'string' && src.trim() !== '' ? (
                <img 
                  src={src}
                  alt={alt || 'Image'}
                  className="max-w-full h-auto rounded-lg shadow-lg cursor-pointer"
                  style={{ maxHeight: '500px', objectFit: 'contain' }}
                  {...props}
                />
              ) : null
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
