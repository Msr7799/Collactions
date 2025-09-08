'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { allModels, AIModel, getModelsByProvider } from '@/lib/models';
import { ChevronDown, Zap, Brain, Code, Eye, Mic } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel?: AIModel;
  onModelSelect: (model: AIModel) => void;
  className?: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  selectedModel, 
  onModelSelect, 
  className = '' 
}) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const providers = ['all', 'OpenAI', 'Z.AI', 'Qwen', 'MoonshotAI', 'Venice', 'Google', 'Tencent', 'TNG', 'Mistral', 'GPTGOD0', 'Hugging Face'];

  const filteredModels = selectedProvider === 'all' 
    ? allModels 
    : getModelsByProvider(selectedProvider);

  const getCapabilityIcon = (capability: string) => {
    switch (capability) {
      case 'coding':
      case 'code_generation':
        return <Code className="w-3 h-3" />;
      case 'reasoning':
      case 'advanced_reasoning':
        return <Brain className="w-3 h-3" />;
      case 'vision':
      case 'multimodal':
        return <Eye className="w-3 h-3" />;
      case 'text_to_image':
      case 'creative':
      case 'artistic':
        return <Eye className="w-3 h-3" />;
      case 'audio':
        return <Mic className="w-3 h-3" />;
      case 'fast':
      case 'real_time':
        return <Zap className="w-3 h-3" />;
      case 'high_quality':
        return <Zap className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selected Model Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 md:h-14 flex items-center justify-between p-2 md:p-3 bg-[#212121] border hover:bg-background transition-colors text-left"
      >
        <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
          {selectedModel ? (
            <>
              <div className="w-7 h-7 md:w-8 md:h-8 bg-bg-dark rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-foreground font-bold text-xs md:text-sm">
                  {selectedModel.provider.charAt(0)}
                </span>
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm md:text-base truncate">
                  {selectedModel.name.length > 20 && isMobile 
                    ? selectedModel.name.substring(0, 20) + '...' 
                    : selectedModel.name
                  }
                </p>
                <p className="text-xs text-muted truncate">{selectedModel.provider}</p>
              </div>
            </>
          ) : (
            <span className="text-muted text-sm md:text-base">
              {getTranslation('select_ai_model', language)}
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-muted transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-2xl max-h-[80vh] md:max-h-96 overflow-hidden z-50 backdrop-blur-sm">
          {/* Provider Filter */}
          <div className="p-2 md:p-3 border-b">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full bg-bg-dark border border-[--border] rounded px-2 md:px-3 py-1.5 md:py-2 text-[--foreground] text-sm"
            >
              <option value="all">{getTranslation('all_providers', language)}</option>
              {providers.slice(1).map(provider => (
                <option key={provider} value={provider}>{provider}</option>
              ))}
            </select>
          </div>

          {/* Models List */}
          <div className="max-h-64 md:max-h-80 overflow-y-auto">
            {filteredModels.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onModelSelect(model);
                  setIsOpen(false);
                }}
                className="w-full p-2 md:p-3 hover:bg-[--background] transition-colors text-left border-b border-[--border] last:border-b-0"
              >
                <div className="flex items-start space-x-2 md:space-x-3">
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-[--primary] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-black font-bold text-xs">
                      {model.provider.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-[--foreground] text-sm md:text-base leading-tight mb-1">
                          {model.name}
                        </h3>
                        <p className="text-xs text-[--muted] mb-1">{model.provider}</p>
                      </div>
                      {model.type === 'free' && (
                        <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded flex-shrink-0">
                          {language === 'ar' ? 'مجاني' : 'FREE'}
                        </span>
                      )}
                    </div>
                    
                    {/* Description - Hide on mobile to save space */}
                    <p className="hidden md:block text-xs text-[--muted] line-clamp-2 mb-2">
                      {model.description}
                    </p>
                    
                    {/* Capabilities - More compact on mobile */}
                    <div className="flex flex-wrap gap-1">
                      {model.capabilities.slice(0, isMobile ? 2 : 4).map((capability, index) => (
                        <div key={index} className="flex items-center space-x-1 px-1.5 md:px-2 py-0.5 md:py-1 bg-[--background] rounded text-xs">
                          {getCapabilityIcon(capability)}
                          <span className="text-[--muted] truncate text-xs">
                            {capability.replace(/_/g, ' ').substring(0, isMobile ? 8 : 15)}
                            {capability.length > (isMobile ? 8 : 15) ? '...' : ''}
                          </span>
                        </div>
                      ))}
                      {model.capabilities.length > (isMobile ? 2 : 4) && (
                        <span className="text-xs text-muted">
                          +{model.capabilities.length - (isMobile ? 2 : 4)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
            
            {/* Empty state */}
            {filteredModels.length === 0 && (
              <div className="p-4 text-center text-muted text-sm">
                {language === 'ar' ? 'لا توجد نماذج متاحة' : 'No models available'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
