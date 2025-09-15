'use client';

import React, { useState } from 'react';
import { Send, Plus, Zap, MessageSquare, Settings, Globe, Database, Bot } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';

interface PromptItem {
  id: string;
  text: string;
  icon: React.ReactNode;
  color: string;
}

const StarterPrompts: React.FC = () => {
  const { language, isRTL } = useLanguage();
  const [command, setCommand] = useState('');

  const starterPrompts = [
    {
      title: language === 'ar' ? 'تلخيص صفحة ويب' : 'Summarize a webpage',
      command: language === 'ar' ? 'لخص النقاط الرئيسية من https://example.com' : 'Summarize the main points from https://example.com',
      icon: <Globe className="w-5 h-5" />
    },
    {
      title: language === 'ar' ? 'استعلام قاعدة البيانات' : 'Database query',
      command: 'SELECT * FROM users WHERE status = "active"',
      icon: <Database className="w-5 h-5" />
    },
    {
      title: language === 'ar' ? 'إنشاء كود' : 'Generate code',
      command: language === 'ar' ? 'أنشئ مكون React لبطاقة ملف شخصي للمستخدم' : 'Create a React component for a user profile card',
      icon: <Bot className="w-5 h-5" />
    },
    {
      title: language === 'ar' ? 'البحث والتحليل' : 'Search and analyze',
      command: language === 'ar' ? 'ابحث عن أخبار الذكاء الاصطناعي الحديثة وقدم ملخصاً' : 'Search for recent AI news and provide a summary',
      icon: <Zap className="w-5 h-5" />
    }
  ];

  const handlePromptClick = (promptText: string) => {
    setCommand(promptText);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle command submission
    console.log('Command submitted:', command);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      {/* Main Content */}
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">{getTranslation('starter_prompts_title', language)}</h2>
        </div>

        {/* Starter Prompts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt.title}
              onClick={() => handlePromptClick(prompt.command)}
              className="group p-4 bg-secondary hover:bg-border border rounded-lg transition-all duration-200 hover:scale-[1.02] text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="text-foreground group-hover:scale-110 transition-transform">
                  {prompt.icon}
                </div>
                <span className="text-foreground text-sm font-medium">
                  {prompt.title}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Command Input */}
        <div className="space-y-4">
          <div className="text-center text-sm text-muted">
            or enter <kbd className="px-2 py-1 bg-secondary border rounded text-xs">⌘</kbd> to view command menu
          </div>
          
          <form onSubmit={handleSubmit} className="relative">
            <div className="glass-effect rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-muted" />
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder={getTranslation('command_placeholder', language)}
                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder-muted"
                />
                <button
                  type="submit"
                  disabled={!command.trim()}
                  className="px-6 py-2 bg-primary hover:bg-primary/80 text-black font-medium rounded-md transition-colors flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{getTranslation('send', language)}</span>
                </button>
              </div>
              
              {/* Model Selection */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="flex items-center space-x-2 text-sm text-muted">
                  <span>gpt-4.1</span>
                  <button className="text-primary hover:text-primary/80">auto</button>
                  <button className="text-muted hover:text-foreground">yolo</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Section - Add Servers */}
      <div className="relative bottom-6 left-6">
        <div className="glass-effect rounded-lg p-3">
          <button className="flex items-center space-x-2 text-muted hover:text-foreground transition-colors">
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add servers</span>
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="relative top-1/2 right-6 transform -translate-y-1/2">
        <div className="text-center text-sm text-muted space-y-2">
          <div>No servers connected</div>
          <div className="w-8 h-8 mx-auto bg-border rounded border-2 border-dashed border-muted flex items-center justify-center">
            <Plus className="w-4 h-4 text-muted" />
          </div>
          <div>Connect servers to view traces</div>
        </div>
      </div>
    </div>
  );
};

export default StarterPrompts;
