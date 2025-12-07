'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo, memo } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports for performance  
const ReactMarkdown = dynamic(
  () => import('react-markdown'),
  { 
    ssr: false,
    loading: () => <div>Loading...</div>
  }
) as any;
const ThinkingMessage = dynamic(() => import('@/components/ai/ThinkingMessage'), { ssr: false });
const TypewriterEffect = dynamic(() => import('@/components/ai/TypewriterEffect'), { ssr: false });
import HistorySidebar from './prompts/HistorySidebar';


import remarkGfm from 'remark-gfm';
// Temporarily disabled to fix Next.js 15 headers() error
// import { useUser } from '@clerk/nextjs';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import Layout from '@/components/layout/Layout';
import ErrorBoundary from '@/components/ErrorBoundary';
import ModelSelector from '@/components/ai/ModelSelector';
import { AIModel, allModels, defaultModel } from '@/lib/models';

// Import improved custom hooks and utilities
import { useMcpServers, MCPServer, MCPServerTemplate } from '@/hooks/useMcpServers';
import { useAutoSave } from '@/utils/autoSave';

interface MCPPrompt {
  id: string;
  title: string;
  template: string;
  category: string;
  description?: string;
}

import { getAIGateway, ChatMessage as APIChatMessage } from '@/lib/api';
import { chatStorage, ChatSession } from './prompts/chatStorage';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  isThinking?: boolean;
  model?: string;
}
import { 
  FileText, 
  Send, 
  Plus,
  ClipboardList,
  Pause,
  Settings, 
  MessageSquare, 
  Server, 
  Upload, 
  Globe, 
  X, 
  Terminal,
  RefreshCw, 
  Loader,
  Search, 
  AlertCircle, 
  Zap,
  Copy,
  Download,
  Maximize2,
  Minimize2,
  Check,
  Image,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Paperclip,
  Edit3,
  Save,
  XCircle,
  Menu,
  X as CloseIcon,
  Calendar,
  Clock,
  Trash2,
  Bot,
  User,
  Maximize,
  Edit,
  Play,
  History
} from 'lucide-react';
import CodeBlock, { MessageContentRenderer } from './prompts/CodeBlock';
import MCPManager from './prompts/MCP-Manager';

// ... rest of the file
