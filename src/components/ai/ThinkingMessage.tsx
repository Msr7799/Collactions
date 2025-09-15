'use client';

import { useState } from 'react';
import TypewriterEffect from './TypewriterEffect';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';

interface ThinkingMessageProps {
  thinking: string;
  response: string;
  modelName: string;
  onThinkingComplete: () => void;
  onResponseComplete?: () => void;
}

export default function ThinkingMessage({ 
  thinking, 
  response, 
  modelName,
  onThinkingComplete,
  onResponseComplete 
}: ThinkingMessageProps) {
  const [showThinking, setShowThinking] = useState(true);
  const [thinkingComplete, setThinkingComplete] = useState(false);
  const [startResponse, setStartResponse] = useState(false);

  const handleThinkingComplete = () => {
    setThinkingComplete(true);
    onThinkingComplete();
    // بدء الإجابة بعد تأخير قصير
    setTimeout(() => {
      setStartResponse(true);
    }, 500);
  };

  return (
    <div className="space-y-4">
      {/* قسم التفكير */}
      <div className="bg-bg-dark/30 border border-muted/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-muted" />
            <span className="text-sm text-muted font-medium">
              {modelName} يفكر...
            </span>
            {thinkingComplete && (
              <span className="text-xs text-green-400">✓ اكتمل التفكير</span>
            )}
          </div>
          <button
            onClick={() => setShowThinking(!showThinking)}
            className="text-muted hover:text-white transition-colors"
          >
            {showThinking ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        
        {showThinking && (
          <div className="border-t border-muted/10 pt-3">
            <TypewriterEffect
              text={thinking}
              speed={25}
              onComplete={handleThinkingComplete}
              className="text-muted/80 text-sm leading-relaxed whitespace-pre-wrap"
              isThinking={true}
            />
          </div>
        )}
      </div>

      {/* قسم الإجابة */}
      {startResponse && (
        <div className="bg-transparent">
          <div className="flex items-center space-x-2 mb-3">
            <img src="/small_icon_lime.svg" alt="AI" className="w-4 h-4" />
            <span className="text-sm font-medium">{modelName}</span>
          </div>
          
          <TypewriterEffect
            text={response}
            speed={35}
            onComplete={onResponseComplete}
            className="text-white leading-relaxed whitespace-pre-wrap"
          />
        </div>
      )}
    </div>
  );
}
