'use client';

import React, { useState } from 'react';
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

  const providers = ['all', 'OpenRouter', 'OpenAI', 'Z.AI', 'Qwen', 'MoonshotAI', 'Venice', 'Google', 'Tencent', 'TNG', 'Mistral', 'GPTGOD', 'Hugging Face'];

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
    className="w-full h-12 flex items-center justify-between p-3 bg-[#212121] border  hover:bg-background transition-colors"
    >
    <div className="flex items-center space-x-3">
    {selectedModel ? (
      <>
      <div className="w-8 h-8 bg-bg-dark rounded-lg flex items-center justify-center">
      <span className="text-foreground font-bold text-sm">
      {selectedModel.provider.charAt(4)}
      {selectedModel.provider.charAt(5)}
      </span>
      </div>
      <div className="text-left">
      <p className="font-medium text-foreground">{selectedModel.name}</p>
      <p className="text-xs text-muted">{selectedModel.provider}</p>
      </div>
      </>
    ) : (
      <span className="text-muted">
      {getTranslation('select_ai_model', language)}
      </span>
    )}
    </div>
    <ChevronDown className={`w-4 h-4 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>

    {/* Dropdown */}
    {isOpen && (
      <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-2xl max-h-96 overflow-hidden z-50 backdrop-blur-sm">
      {/* Provider Filter */}
      <div className="p-3 border">
      <select
      value={selectedProvider}
      onChange={(e) => setSelectedProvider(e.target.value)}
      className="w-full bg-bg-dark border border-[--border] rounded px-3 py-2 text-[--foreground]"
      >
      <option value="all">{getTranslation('all_providers', language)}</option>
      {providers.slice(1).map(provider => (
        <option key={provider} value={provider}>{provider}</option>
      ))}
      </select>
      </div>

      {/* Models List */}
      <div className="max-h-80 overflow-y-auto">
      {filteredModels.map((model) => (
        <button
        key={model.id}
        onClick={() => {
          onModelSelect(model);
          setIsOpen(false);
        }}
        className="w-full p-3 hover:bg-[--background] transition-colors text-left border-b border-[--border] last:border-b-0"
        >
        <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-[--primary] rounded-lg flex items-center justify-center flex-shrink-0">
        <span className="text-black font-bold text-xs">
        {model.provider.charAt(0)}
        </span>
        </div>
        <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
        <h3 className="font-medium text-[--foreground] truncate">{model.name}</h3>
        {model.type === 'free' && (
          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
          {getTranslation('free_model', language)}
          </span>
        )}
        </div>
        <p className="text-xs text-[--muted] mb-1">{model.provider}</p>
        <p className="text-xs text-[--muted] line-clamp-2 mb-2">{model.description}</p>

        {/* Capabilities */}
        <div className="flex flex-wrap gap-1">
        {model.capabilities.slice(0, 4).map((capability, index) => (
          <div key={index} className="flex items-center space-x-1 px-2 py-1 bg-[--background] rounded text-xs">
          {getCapabilityIcon(capability)}
          <span className="text-[--muted] truncate">
          {capability.replace(/_/g, ' ')}
          </span>
          </div>
        ))}
        {model.capabilities.length > 4 && (
          <span className="text-xs text-muted">
          +{model.capabilities.length - 4} {getTranslation('more_capabilities', language)}
          </span>
        )}
        </div>
        </div>
        </div>
        </button>
      ))}
      </div>
      </div>
    )}
    </div>
  );
};

export default ModelSelector;
