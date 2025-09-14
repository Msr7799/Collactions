// TypeScript interfaces for the AI Gateway application

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'beta' | 'coming_soon';
  icon?: React.ReactNode;
  isVerified?: boolean;
  deployedFrom?: string;
  monthlyToolCalls?: string;
  successRate?: string;
  license?: string;
  published?: string;
  sourceCode?: string;
  homepage?: string;
  onClick?: () => void;
}

// Unified Tool interface for all components
export interface Tool {
  name: string;
  description: string;
  parameters?: any;
  isExpanded?: boolean; // For ServiceDetail component
}

// Unified ChatMessage interface for API communication
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{
    type: 'text';
    text: string;
  } | {
    type: 'image_url';
    image_url: {
      url: string;
    };
  }>;
}

// Chat request interface for API routes
export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  provider?: string;
}

export interface StarterpPrompt {
  id: string;
  text: string;
  icon: string;
  color: string;
}

export interface ConnectionConfig {
  servers: Server[];
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface Server {
  name: string;
  url: string;
}

// Error handling types
export interface ApiError {
  name: string;
  message: string;
  code: string;
  status: number;
  timestamp: Date;
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}
