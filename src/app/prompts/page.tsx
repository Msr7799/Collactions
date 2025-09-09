'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo, memo } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports for performance
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });
const ThinkingMessage = dynamic(() => import('@/components/ai/ThinkingMessage'), { ssr: false });
const TypewriterEffect = dynamic(() => import('@/components/ai/TypewriterEffect'), { ssr: false });


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
import { chatStorage, ChatSession } from './chatStorage';

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
  FolderOpen
} from 'lucide-react';
import CodeBlock, { MessageContentRenderer } from './CodeBlock';

// Responsive Table Component
interface ResponsiveTableProps {
  data: any[];
  headers: string[];
  title?: string;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = memo(({ data, headers, title }) => {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const { language } = useLanguage();
  const itemsPerPage = 10;

  const sortedData = useMemo(() => {
    if (!sortField) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
  }, [data, sortField, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="my-6 bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
      {title && (
        <div className="px-6 py-4 bg-gradient-to-r from-gray-750 to-gray-800 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
        </div>
      )}
      
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-750">
            <tr>
              {headers.map((header) => (
                <th 
                  key={header}
                  className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => handleSort(header)}
                >
                  <div className="flex items-center justify-between">
                    <span>{header}</span>
                    {sortField === header && (
                      <span className="text-blue-400">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {paginatedData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-750 transition-colors">
                {headers.map((header) => (
                  <td key={header} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {typeof row[header] === 'object' ? 
                      JSON.stringify(row[header]) : 
                      String(row[header] || '-')
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-700">
        {paginatedData.map((row, index) => (
          <div key={index} className="p-4 space-y-3">
            {headers.map((header) => (
              <div key={header} className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-400 uppercase">{header}:</span>
                <span className="text-sm text-gray-300 text-left">
                  {typeof row[header] === 'object' ? 
                    JSON.stringify(row[header]) : 
                    String(row[header] || '-')
                  }
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-750 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {language === 'ar' 
                ? `عرض ${((currentPage - 1) * itemsPerPage) + 1} إلى ${Math.min(currentPage * itemsPerPage, sortedData.length)} من ${sortedData.length} عنصر`
                : `Showing ${((currentPage - 1) * itemsPerPage) + 1} to ${Math.min(currentPage * itemsPerPage, sortedData.length)} of ${sortedData.length} items`
              }
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded text-sm transition-colors"
              >
                {language === 'ar' ? 'السابق' : 'Previous'}
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + Math.max(1, currentPage - 2);
                if (page > totalPages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      page === currentPage 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded text-sm transition-colors"
              >
                {language === 'ar' ? 'التالي' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ResponsiveTable.displayName = 'ResponsiveTable';

// Message Content Component
interface MessageContentProps {
  message: ChatMessage;
  onPreviewHtml?: (code: string) => void;
  onImageClick?: (src: string) => void;
}

const MessageContent: React.FC<MessageContentProps> = memo(({ message, onPreviewHtml, onImageClick }) => {
  const { language } = useLanguage();
  
  const renderContent = () => {
    // Check if message contains image generation JSON structure
    const imageGenRegex = /\{\s*"prompt":\s*"[^"]*",\s*"size":\s*"[^"]*"\s*\}/;
    const imageMatch = message.content.match(imageGenRegex);
    
    if (imageMatch) {
      // Hide JSON structure and show clean content
      const cleanContent = message.content.replace(imageGenRegex, '').trim();
      
      // If there's remaining content after removing JSON, show it
      if (cleanContent) {
        return <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanContent}</ReactMarkdown>;
      }
      // Otherwise just return empty content
      return null;
    }

    // Handle images in markdown format - support both data:image and http/https URLs
    const imageRegex = /!\[([^\]]*)\]\(((?:data:image\/[^)]+|https?:\/\/[^)]+))\)/g;
    console.log('🔍 Checking for images in message:', message.content.substring(0, 200) + '...');
    let lastIndex = 0;
    const parts = [];
    let match;

    // Process images
    while ((match = imageRegex.exec(message.content)) !== null) {
      // Add text before the image
      if (match.index > lastIndex) {
        const textPart = message.content.slice(lastIndex, match.index);
        parts.push(
          <ReactMarkdown 
            key={`text-${lastIndex}`} 
            remarkPlugins={[remarkGfm]}
          >
            {textPart}
          </ReactMarkdown>
        );
      }

      // Add the image
      const altText = match[1];
      const imageSrc = match[2];
      parts.push(
        <div key={`image-${match.index}`} className="my-4">
          <img 
            src={imageSrc}
            alt={altText || 'Generated Image'}
            className="max-w-full h-auto rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
            style={{ maxHeight: '500px', objectFit: 'contain' }}
            onClick={() => onImageClick && onImageClick(imageSrc)}
            onError={(e) => {
              console.error('Image failed to load:', imageSrc.substring(0, 100));
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => {
              console.log('✅ Image loaded successfully');
            }}
          />
        </div>
      );

      lastIndex = match.index + match[0].length;
    }


    // Add remaining text
    if (lastIndex < message.content.length) {
      const textPart = message.content.slice(lastIndex);
      parts.push(
        <ReactMarkdown 
          key={`text-${lastIndex}`} 
          remarkPlugins={[remarkGfm]}
          components={{
            code: ({ className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : 'text';
              
              // Handle children properly to preserve line breaks
              let codeContent = '';
              if (Array.isArray(children)) {
                codeContent = children.join('');
              } else {
                codeContent = String(children || '');
              }
              
              // Check if this is inline code (no className) vs code block
              if (!className) {
                // Inline code - render as simple span
                return (
                  <code className="bg-gray-800 text-gray-200 px-2 py-1 rounded text-sm font-mono">
                    {codeContent}
                  </code>
                );
              }
              
              // Code block - use CodeBlock component
              // Remove trailing newline only
              codeContent = codeContent.replace(/\n$/, '');
              
              // Debug: Log to console to check if this is reached
              console.log('Creating CodeBlock:', { language, codeContent: codeContent.substring(0, 50) + '...', hasClass: !!className });
              
              return (
                <CodeBlock 
                  language={language} 
                  code={codeContent} 
                  onPreviewHtml={onPreviewHtml}
                />
              );
            },
            pre: ({ children, ...props }) => {
              // Handle pre elements that contain code blocks
              return <div>{children}</div>;
            },
            img: ({src, alt, ...props}) => {
              if (!src) return null;
              
              const imageSrc = typeof src === 'string' ? src : String(src);
              if (!imageSrc.trim()) return null;
              
              return (
                <div className="my-4">
                  <img 
                    src={imageSrc}
                    alt={alt || 'Generated Image'}
                    className="max-w-full h-auto rounded-lg shadow-lg border border-gray-600 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => onImageClick && onImageClick(imageSrc)}
                    style={{ maxHeight: '500px', objectFit: 'contain' }}
                    onError={(e) => {
                      console.error('Image failed to load:', imageSrc.substring(0, 100));
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('✅ Image loaded successfully');
                    }}
                  />
                </div>
              );
            }
          }}
        >
          {textPart}
        </ReactMarkdown>
      );
    }

    return parts.length > 0 ? parts : (
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[]}
        components={{
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'text';
            
            // Handle children properly to preserve line breaks
            let codeContent = '';
            if (Array.isArray(children)) {
              codeContent = children.join('');
            } else {
              codeContent = String(children || '');
            }
            
            // Check if this is inline code (no className) vs code block
            if (!className) {
              // Inline code - render as simple span
              return (
                <code className="bg-gray-800 text-gray-200 px-2 py-1 rounded text-sm font-mono">
                  {codeContent}
                </code>
              );
            }
            
            // Code block - use CodeBlock component
            // Remove trailing newline only
            codeContent = codeContent.replace(/\n$/, '');
            
            return (
              <CodeBlock 
                language={language} 
                code={codeContent} 
                onPreviewHtml={onPreviewHtml}
              />
            );
          },
          pre: ({ children, ...props }) => {
            // Handle pre elements that contain code blocks
            return <div>{children}</div>;
          },
          img: ({src, alt, ...props}) => {
            if (!src) return null;
            
            const imageSrc = typeof src === 'string' ? src : String(src);
            if (!imageSrc.trim()) return null;
            
            // تحقق من صحة base64 data
            const isBase64Image = imageSrc.startsWith('data:image/');
            if (!isBase64Image && !imageSrc.startsWith('http')) {
              console.error('Invalid image source:', imageSrc.substring(0, 100) + '...');
              return null;
            }
            
            return (
              <div className="my-4">
                <img 
                  src={imageSrc}
                  alt={alt || 'Generated Image'}
                  className="max-w-full h-auto rounded-lg shadow-lg border border-gray-600 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => onImageClick && onImageClick(imageSrc)}
                  style={{ maxHeight: '500px', objectFit: 'contain' }}
                  onError={(e) => {
                    console.error('❌ Image failed to load:', {
                      src: imageSrc.substring(0, 100) + '...',
                      isBase64: isBase64Image,
                      length: imageSrc.length
                    });
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('✅ Image loaded successfully:', {
                      isBase64: isBase64Image,
                      size: imageSrc.length
                    });
                  }}
                />
              </div>
            );
          }
        }}
      >
        {message.content}
      </ReactMarkdown>
    );
  };

  return <div className="prose max-w-none text-foreground [&>*]:text-foreground">{renderContent()}</div>;
});

MessageContent.displayName = 'MessageContent';

// Unified ID generator
const genId = () => (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;

const PromptsPage: React.FC = () => {
  // Temporarily disabled to fix Next.js 15 headers() error
  // const { user } = useUser();
  const user = null;
  const { language } = useLanguage();
  const [selectedModel, setSelectedModel] = useState<AIModel>(defaultModel);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sendingMessageId, setSendingMessageId] = useState<string | null>(null);
  const [serverPaths, setServerPaths] = useState<{[key: string]: string}>({
    filesystem: '/home/msr/Desktop/ss/collactions',
    git: '/home/msr/Desktop/ss/collactions'
  });
  const [error, setError] = useState<string>('');
  const [activeMode, setActiveMode] = useState<'general' | 'code' | 'creative'>('general');
  const [showSettings, setShowSettings] = useState(false);
  const [showAddServer, setShowAddServer] = useState(false);
  const [imageModal, setImageModal] = useState<{isOpen: boolean, src: string}>({isOpen: false, src: ''});
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);

  // Image modal functions
  const openImageModal = useCallback((src: string) => {
    setImageModal({isOpen: true, src});
  }, []);

  const closeImageModal = useCallback(() => {
    setImageModal({isOpen: false, src: ''});
  }, []);


  const [newServerData, setNewServerData] = useState({
    name: '',
    command: '',
    args: [] as string[],
    env: {} as Record<string, string>
  });
  const [serverInputMode, setServerInputMode] = useState<'form' | 'json'>('form');
  const [serverJsonInput, setServerJsonInput] = useState('');
  const [isEditingServer, setIsEditingServer] = useState<string | null>(null);
  const [connectingServer, setConnectingServer] = useState<string | null>(null);
  const [savedChats, setSavedChats] = useState<ChatMessage[][]>([]);
  const [showCopySuccess, setShowCopySuccess] = useState<string | null>(null);
  const [isLoadingUserServers, setIsLoadingUserServers] = useState(false);
  const [userServersLoaded, setUserServersLoaded] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [attachedImages, setAttachedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [mcpEnabled, setMcpEnabled] = useState(true);
  const [thinkingMessages, setThinkingMessages] = useState<{[key: string]: {thinking: string, response: string, isCompleted: boolean}}>({});
  const [fullscreenImage, setFullscreenImage] = useState<{index: number, url: string} | null>(null);
  const [attachedFile, setAttachedFile] = useState<{file: File, content: string, preview: string} | null>(null);
  const [pendingImageGeneration, setPendingImageGeneration] = useState<{
    originalPrompt: string;
    enhancedPrompt: string;
    model: string;
  } | null>(null);
  // تم إزالة enhancePrompt state لأنه لا يُستخدم بعد الآن
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [promptComparison, setPromptComparison] = useState<{
    original: string;
    enhanced: string;
    model: string;
  } | null>(null);
  const [translationComparison, setTranslationComparison] = useState<{
    original: string;
    translated: string;
  } | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isHistorySidebarVisible, setIsHistorySidebarVisible] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [currentChatSession, setCurrentChatSession] = useState<ChatSession | null>(null);
  const [isLoadingChat, setIsLoadingChat] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  // HTML preview now opens in new tab, no modal state needed
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // MCP data will be loaded via API calls

  // Function to refresh chat history from server
  const refreshChatHistory = useCallback(async () => {
    const sessions = await chatStorage.listSessions();
    setChatHistory(sessions);
    return sessions;
  }, []);

  // Race condition protection for sendMessage
  const sendMessageRef = useRef<boolean>(false);
  
  // Timeout cleanup refs
  const timeoutRefs = useRef<{
    copySuccess?: NodeJS.Timeout,
    autoSend?: NodeJS.Timeout,
    urlCleanup?: NodeJS.Timeout[],
    mcpRefresh?: NodeJS.Timeout[]
  }>({urlCleanup: [], mcpRefresh: []});

  // Cleanup image URLs and timeouts on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup all image preview URLs on component unmount
      imagePreviewUrls.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          console.warn('Failed to revoke URL:', url);
        }
      });
      
      // Cleanup all timeouts
      const timeouts = timeoutRefs.current;
      if (timeouts.copySuccess) clearTimeout(timeouts.copySuccess);
      if (timeouts.autoSend) clearTimeout(timeouts.autoSend);
      timeouts.urlCleanup?.forEach(timeout => clearTimeout(timeout));
      timeouts.mcpRefresh?.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Cleanup image URLs when changing conversations
  useEffect(() => {
    return () => {
      if (imagePreviewUrls.length > 0) {
        imagePreviewUrls.forEach(url => {
          try {
            URL.revokeObjectURL(url);
          } catch (error) {
            console.warn('Failed to revoke URL on conversation change:', url);
          }
        });
      }
    };
  }, [currentChatSession?.id]);

  // Auto-load last conversation and model on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      if (isInitializing) return; // Prevent multiple initializations
      setIsInitializing(true);
      setIsLoadingChat(true);

      const lastModel = chatStorage.getLastUsedModel();
      if (lastModel) {
        setSelectedModel(lastModel);
      }

      const [sessions, currentSession] = await Promise.all([
        chatStorage.listSessions(),
        chatStorage.getCurrentSession(),
      ]);

      setChatHistory(sessions);

      if (currentSession) {
        setCurrentChatSession(currentSession);
        setMessages(currentSession.messages);
        if (currentSession.model) {
          const model = allModels.find(m => m.id === currentSession.model.id) || defaultModel;
          setSelectedModel(model);
        }
      } else {
        setMessages([]);
        setCurrentChatSession(null);
      }

      setIsLoadingChat(false);
      setIsInitializing(false);
    };

    loadInitialData();
  }, []);

  // Auto-save when model changes
  useEffect(() => {
    if (!isLoadingChat) {
      chatStorage.setLastUsedModel(selectedModel);
    }
  }, [selectedModel, isLoadingChat]);

  // Enhanced auto-save using custom hook with content hashing
  const saveFunction = useCallback(async (sessionData: { messages: ChatMessage[], model: AIModel, session: ChatSession | null }) => {
    const { messages, model, session } = sessionData;
    
    if (!session) {
      // Create new session
      const newSession = await chatStorage.createSession(model, messages);
      setCurrentChatSession(newSession);
      console.log('🆕 New chat session created');
    } else {
      // Update existing session  
      const updatedSessionData = {
        ...session,
        messages,
        model
      };
      const savedSession = await chatStorage.saveSession(updatedSessionData);
      
      // Only update state if ID changed to prevent loops
      if (!currentChatSession || currentChatSession.id !== savedSession.id) {
        setCurrentChatSession(savedSession);
      }
      console.log('💾 Chat session updated');
    }
  }, [currentChatSession]);

  const { debouncedSave, getSaveState } = useAutoSave(saveFunction, {
    debounceMs: 3000,
    onSaveStart: () => console.log('🔄 Auto-save starting...'),
    onSaveSuccess: () => console.log('✅ Auto-save completed'),
    onSaveError: (error) => console.error('❌ Auto-save failed:', error),
    onSaveSkipped: (reason) => console.log('⏭️ Auto-save skipped:', reason)
  });

  // Trigger auto-save when messages change
  useEffect(() => {
    if (isLoadingChat || messages.length === 0 || sendMessageRef.current) return;
    
    const sessionData = {
      messages,
      model: selectedModel,
      session: currentChatSession
    };
    
    debouncedSave(sessionData);
  }, [messages, selectedModel, currentChatSession, isLoadingChat, debouncedSave]);

  // Use improved MCP servers custom hook
  const {
    servers: mcpServers,
    isLoading: isLoadingMCP,
    error: mcpError,
    addServer,
    removeServer,
    toggleServer,
    refreshServers,
    serverOperationInProgress
  } = useMcpServers({
    autoConnect: true,
    retryAttempts: 3,
    retryDelay: 2000
  });

  // Memoized expensive computations
  const connectedServersCount = useMemo(() => 
    mcpServers.filter(server => server.isConnected).length, 
    [mcpServers]
  );
  
  const totalToolsCount = useMemo(() => 
    mcpServers.reduce((total, server) => total + (server.toolsCount || 0), 0), 
    [mcpServers]
  );

  const sortedChatHistory = useMemo(() => 
    [...chatHistory].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()),
    [chatHistory]
  );

  // Generate image using Hugging Face FLUX.1-dev
  const generateImage = useCallback(async (prompt: string) => {
    setIsGeneratingImage(true);
    setError('');
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          model: "black-forest-labs/FLUX.1-dev"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate image');
      }

      return data;
    } catch (error: any) {
      console.error('Error generating image:', error);
      throw error;
    } finally {
      setIsGeneratingImage(false);
    }
  }, []);

  // Enhance prompt only (without generating image)
  const enhancePromptOnly = useCallback(async (prompt: string) => {
    setIsEnhancingPrompt(true);
    setError('');
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          model: selectedModel?.id === 'dalle' ? 'dall-e-3' : 'black-forest-labs/FLUX.1-dev',
          useGPT4Description: true,
          enhanceOnly: true, // Flag to only enhance description
          descriptionModel: selectedModel?.id === 'flux-gpt4mini' ? 'gpt-4o-mini' : 
                          selectedModel?.id === 'flux-gpt35' ? 'gpt-3.5-turbo' : 
                          selectedModel?.id === 'flux-gpt4' ? 'gpt-4o' : 'gpt-4o-mini'
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setPromptComparison({
          original: data.originalPrompt,
          enhanced: data.finalPrompt,
          model: data.descriptionModel
        });
      } else {
        throw new Error(data.message || data.error || 'Enhancement failed');
      }
    } catch (error) {
      console.error('Prompt enhancement error:', error);
      setError(error instanceof Error ? error.message : 'Enhancement failed');
    } finally {
      setIsEnhancingPrompt(false);
    }
  }, []);

  // Translate Arabic text to English
  const translatePrompt = useCallback(async (text: string) => {
    setIsTranslating(true);
    setError('');
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          useGPT4Description: true,
          enhanceOnly: true,
          translateOnly: true,
          descriptionModel: 'gpt-4o-mini'
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setTranslationComparison({
          original: result.originalPrompt,
          translated: result.finalPrompt
        });
      } else {
        throw new Error(result.message || result.error || 'Translation failed');
      }
    } catch (error) {
      console.error('Translation error:', error);
      setError(error instanceof Error ? error.message : 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  }, []);

  // MCP system state  
  const [serverTemplates, setServerTemplates] = useState<MCPServerTemplate[]>([]);
  const [isRefreshingMCP, setIsRefreshingMCP] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MCPServerTemplate | null>(null);

  // Add server from template
  const addServerFromTemplate = useCallback(async (template: MCPServerTemplate) => {
    if (!template) return;
    
    try {
      await addServer(template);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Failed to add server from template:', error);
    }
  }, [addServer]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Keyboard event handler for fullscreen images
  const handleFullscreenKeyPress = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        setFullscreenImage(null);
        break;
      case 'ArrowLeft':
        // Navigate to previous image functionality can be added here
        break;
      case 'ArrowRight':
        // Navigate to next image functionality can be added here
        break;
    }
  };

  // Keyboard navigation effect
  useEffect(() => {
    if (fullscreenImage) {
      document.addEventListener('keydown', handleFullscreenKeyPress);
      return () => document.removeEventListener('keydown', handleFullscreenKeyPress);
    }
  }, [fullscreenImage]);

  const handlePromptClick = async (prompt: MCPPrompt) => {
    const promptText = prompt.template.replace('{query}', language === 'ar' ? 'مثال' : 'example');
    setInputMessage(promptText);
    // Auto-send the prompt
    if (timeoutRefs.current.autoSend) {
      clearTimeout(timeoutRefs.current.autoSend);
    }
    timeoutRefs.current.autoSend = setTimeout(() => {
      if (promptText.trim()) {
        sendMessage();
      }
    }, 100);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() && attachedImages.length === 0) return;
    if (isLoading) return;
    
    // Prevent race conditions - only allow one sendMessage at a time
    if (sendMessageRef.current) {
      console.warn('SendMessage already in progress, ignoring duplicate call');
      return;
    }
    sendMessageRef.current = true;
    const messageContent = inputMessage;
    
    const userMessage: ChatMessage = {
      id: genId(),
      content: messageContent,
      role: 'user',
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);
    setError('');
    
    // Clear attachments after sending
    setAttachedFile(null);
    setAttachedImages([]);
    setImagePreviewUrls([]);

    try {
      setActiveMode('general');
      
      // Convert ChatMessage to API format
      const apiMessages = newMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Check if user is requesting image generation
      const lastMessage = apiMessages[apiMessages.length - 1]?.content || '';
      
      // Check if selected model is for image generation
      const isImageModel = selectedModel.capabilities.includes('text_to_image');
      
      // Enhanced detection for image requests
      const hasImageKeywords = /(?:generate|create|make|draw|paint|sketch|design|توليد|إنشاء|ارسم|اصنع|صمم|اطلب|أريد)\s*(?:an?\s+)?(?:image|picture|photo|painting|drawing|artwork|صورة|رسمة|لوحة|تصميم)/i.test(lastMessage);
      const hasImageContext = /(?:FLUX|Stable\s*Diffusion|Hugging\s*Face|AI\s*art|digital\s*art|فن\s*رقمي|ذكاء\s*اصطناعي)/i.test(lastMessage);
      
      // Simple keyword detection for common image requests
      const simpleImageKeywords = /(?:صورة|رسمة|لوحة|تصميم|image|picture|photo|drawing)/i.test(lastMessage);
      const hasDescriptiveContent = lastMessage.length > 50 && /(?:with|featuring|showing|في|يظهر|يحتوي|مع)/i.test(lastMessage);
      
      // If user selected specific models, treat any descriptive message as generation request
      const isImageRequest = isImageModel || hasImageKeywords || hasImageContext || simpleImageKeywords ||
                            (hasDescriptiveContent && lastMessage.length > 100);
      
      console.log('🔍 Image request detection:', {
        isImageModel,
        hasImageKeywords,
        hasImageContext, 
        simpleImageKeywords,
        isImageRequest,
        messageLength: lastMessage.length
      });

      let response: string;

      if (isImageRequest) {
        // Extract the image description from the message
        let imagePrompt = lastMessage;
        // Remove common prefixes
        imagePrompt = imagePrompt.replace(/(?:generate|create|make|draw|توليد|إنشاء|ارسم)\s+(?:an?\s+)?(?:image|picture|photo|صورة|رسمة)\s+(?:of|for|showing|تظهر|تُظهر|لـ)?\s*/i, '');
        imagePrompt = imagePrompt.replace(/(?:using|with|by|باستخدام|مع|عبر)\s+(?:FLUX|Hugging\s+Face|هاقنق\s+فيس).*/i, '');
        
        console.log('Generating image with prompt:', imagePrompt);
        
        let responseContent: string = '';
        
        try {
          const fetchResponse = await fetch('/api/generate-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: imagePrompt,
              model: selectedModel?.id === 'dalle' ? 'dall-e-3' : 'black-forest-labs/FLUX.1-dev',
              useGPT4Description: false, // عدم تحسين الوصف تلقائياً - فقط عبر الزر المخصص
              descriptionModel: selectedModel?.id === 'flux-gpt4mini' ? 'gpt-4o-mini' : 
                              selectedModel?.id === 'flux-gpt35' ? 'gpt-3.5-turbo' : 
                              selectedModel?.id === 'flux-gpt4' ? 'gpt-4o' : 'gpt-4o-mini'
            }),
          });

          const imageData = await fetchResponse.json();
          console.log('Image generation response:', imageData);
          
          // معالجة الاستجابة بناءً على النوع
          if (fetchResponse.ok && imageData.success && imageData.image) {
            // نجح توليد الصورة الفعلية
            const enhancementInfo = imageData.descriptionModel ? 
              `${imageData.descriptionModel}` : 'GPT-4o';
            
            responseContent = `🎨 **${language === 'ar' ? 'تم توليد الصورة بنجاح' : 'Image Generated Successfully'}**

**${language === 'ar' ? 'الوصف المستخدم' : 'Used Description'}:** ${imageData.finalPrompt || imagePrompt}
**${language === 'ar' ? 'النموذج' : 'Model'}:** ${imageData.model} (${imageData.provider})

![Generated Image](${imageData.image})

<div class="image-container" style="margin: 16px 0;">
  <img src="${imageData.image}" alt="Generated Image" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #444; cursor: pointer;" onclick="window.open('${imageData.image}', '_blank')" />
</div>

${language === 'ar' 
  ? `✨ تم توليد هذه الصورة باستخدام ${imageData.model}${imageData.enhanced ? ` مع تحسين الوصف بواسطة ${enhancementInfo}` : ''}`
  : `✨ This image was generated using ${imageData.model}${imageData.enhanced ? ` with description enhanced by ${enhancementInfo}` : ''}`
}`;

            // طباعة تفاصيل الصورة للتشخيص
            console.log('🖼️ Image data debug:', {
              hasImage: !!imageData.image,
              imageType: imageData.image?.substring(0, 30),
              imageLength: imageData.image?.length,
              isBase64: imageData.image?.startsWith('data:image/'),
              contentPreview: responseContent.substring(0, 200) + '...'
            });

          } else if (fetchResponse.ok && !imageData.success && imageData.fallback && imageData.text) {
            // فشل توليد الصورة لكن حصلنا على وصف محسن (حالة fallback)
            const isCreditsExceeded = imageData.creditsExceeded;
            const iconEmoji = isCreditsExceeded ? '💳' : '📝';
            const enhancementInfo = imageData.model?.includes('GPT') ? imageData.model : 'GPT-4o';
            
            responseContent = `${iconEmoji} **${language === 'ar' 
              ? (isCreditsExceeded ? `انتهى الرصيد - وصف محسن بواسطة ${enhancementInfo}` : `وصف محسن بواسطة ${enhancementInfo}`)
              : (isCreditsExceeded ? `Credits Exceeded - Enhanced by ${enhancementInfo}` : `Enhanced Description by ${enhancementInfo}`)
            }**

**${language === 'ar' ? 'الوصف الأصلي' : 'Original Prompt'}:** ${imageData.prompt}

**${language === 'ar' ? `الوصف المحسن` : 'Enhanced Description'}:**
${imageData.text}

${isCreditsExceeded 
  ? (language === 'ar' 
      ? `💡 **الحلول البديلة:**
• انتظر بداية الشهر القادم لتجديد الرصيد المجاني
• اشترك في Hugging Face PRO للحصول على رصيد أكبر
• استخدم الوصف أعلاه مع أدوات توليد الصور الأخرى`
      : `💡 **Alternative Solutions:**
• Wait for next month for free credits renewal
• Subscribe to Hugging Face PRO for more credits
• Use the description above with other image generation tools`)
  : (language === 'ar' 
      ? '⚠️ لم يتمكن من توليد الصورة الفعلية، لكن تم إنشاء وصف مفصل يمكن استخدامه مع أدوات توليد الصور الأخرى.'
      : '⚠️ Could not generate the actual image, but created a detailed description that can be used with other image generation tools.')
}`;

          } else if (!fetchResponse.ok && imageData.fallback && imageData.type === 'text') {
            // فشل توليد الصورة لكن حصلنا على وصف محسن (حالة انتهاء الرصيد)
            const isCreditsExceeded = imageData.creditsExceeded;
            const enhancementInfo = imageData.descriptionModel || 'GPT-4o';
            
            responseContent = `💳 **${language === 'ar' 
              ? `انتهى الرصيد - وصف محسن بواسطة ${enhancementInfo}`
              : `Credits Exceeded - Enhanced Description by ${enhancementInfo}`
            }**

**${language === 'ar' ? 'الوصف الأصلي' : 'Original Prompt'}:** ${imageData.prompt}

**${language === 'ar' ? `الوصف المحسن بواسطة ${enhancementInfo}` : `Enhanced Description by ${enhancementInfo}`}:**
${imageData.text}

💡 **${language === 'ar' ? 'الحلول البديلة' : 'Alternative Solutions'}:**
• ${language === 'ar' ? 'انتظر بداية الشهر القادم لتجديد الرصيد المجاني' : 'Wait for next month for free credits renewal'}
• ${language === 'ar' ? 'اشترك في Hugging Face PRO للحصول على رصيد أكبر' : 'Subscribe to Hugging Face PRO for more credits'}
• ${language === 'ar' ? 'استخدم الوصف أعلاه مع أدوات توليد الصور الأخرى' : 'Use the description above with other image generation tools'}`;
            
          } else if (!fetchResponse.ok) {
            // معالجة خطأ 402 (Payment Required)
            if (fetchResponse.status === 402 || imageData.type === 'payment_required') {
              responseContent = `💳 **${language === 'ar' 
                ? 'تجاوز الحد المجاني لتوليد الصور'
                : 'Free Image Generation Limit Exceeded'
              }**

${language === 'ar' 
  ? `⚠️ **المشكلة:** انتهى الرصيد المجاني الشهري لـ Hugging Face`
  : `⚠️ **Issue:** Monthly free credits for Hugging Face have been exhausted`
}

**${language === 'ar' ? 'الوصف المطلوب' : 'Requested Prompt'}:** ${imagePrompt}

💡 **${language === 'ar' ? 'الحلول المتاحة' : 'Available Solutions'}:**
• ${language === 'ar' 
  ? 'انتظار بداية الشهر القادم لتجديد الرصيد المجاني تلقائياً' 
  : 'Wait until next month for automatic free credits renewal'
}
• ${language === 'ar' 
  ? 'الاشتراك في Hugging Face PRO للحصول على رصيد أكبر' 
  : 'Subscribe to Hugging Face PRO for higher limits'
}
• ${language === 'ar' 
  ? 'استخدام البرومت مع أدوات توليد صور أخرى مثل DALL-E أو Midjourney' 
  : 'Use the prompt with other image generation tools like DALL-E or Midjourney'
}

🔗 **${language === 'ar' ? 'روابط مفيدة' : 'Helpful Links'}:**
• [Hugging Face Pricing](https://huggingface.co/pricing)
• [Alternative Tools](https://openai.com/dall-e-3)`;
            } else {
              // خطأ عام
              throw new Error(imageData.message || imageData.error || 'Failed to generate image');
            }
          } else {
            // حالة غير متوقعة - أعطي معلومات مفيدة
            console.error('Unexpected response structure:', {
              ok: fetchResponse.ok,
              success: imageData.success,
              hasImage: !!imageData.image,
              hasText: !!imageData.text,
              keys: Object.keys(imageData)
            });
            
            // حاول معالجة أي استجابة بها صورة
            if (imageData.image) {
              console.log('📸 Image URL received:', imageData.image.substring(0, 100) + '...');
              responseContent = `🎨 **${language === 'ar' ? 'تم توليد الصورة' : 'Image Generated'}**

![Generated Image](${imageData.image})

${language === 'ar' ? 'تم توليد الصورة بنجاح' : 'Image generated successfully'}`;
              console.log('✅ Response content prepared with image');
            } else {
              throw new Error(`Unexpected API response format. Keys: ${Object.keys(imageData).join(', ')}`);
            }
          }

          response = responseContent;


        } catch (error: any) {
          console.error('Error generating image:', error);
          
          // معالجة أنواع الأخطاء المختلفة
          let errorMessage = '';
          if (error.message?.includes('401') || error.message?.includes('Invalid') || error.message?.includes('token')) {
            errorMessage = language === 'ar' 
              ? 'خطأ في مفتاح API - يرجى التحقق من إعدادات Hugging Face token'
              : 'API key error - please check Hugging Face token configuration';
          } else if (error.message?.includes('503') || error.message?.includes('loading')) {
            errorMessage = language === 'ar' 
              ? 'النموذج قيد التحميل - يرجى المحاولة مرة أخرى خلال دقائق'
              : 'Model is loading - please try again in a few minutes';
          } else if (error.message?.includes('rate limit') || error.message?.includes('429')) {
            errorMessage = language === 'ar' 
              ? 'تم الوصول لحد استخدام الخدمة - انتظر قليلاً ثم حاول مرة أخرى'
              : 'Rate limit reached - wait a moment then try again';
          } else {
            errorMessage = language === 'ar' 
              ? `فشل في توليد الصورة: ${error.message}`
              : `Failed to generate image: ${error.message}`;
          }

          responseContent = `❌ **${language === 'ar' ? 'خطأ في توليد الصورة' : 'Image Generation Error'}**

${errorMessage}

${language === 'ar' 
  ? 'يمكنك المحاولة مرة أخرى أو استخدام وصف نصي مختلف.'
  : 'You can try again or use a different text description.'
}`;
        }
        
        response = responseContent;
      } else {
        // Use Enhanced API with MCP support for normal chat
        console.log('Using Enhanced API with MCP support');
        
        const enhancedResponse = await fetch('/api/chat/enhanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageContent,
            messages: apiMessages.slice(0, -1), // Don't include the current message
            model: selectedModel,
            useMCP: mcpEnabled // Use MCP if enabled
          })
        });

        if (!enhancedResponse.ok) {
          throw new Error(`Enhanced API error: ${enhancedResponse.status}`);
        }

        const enhancedData = await enhancedResponse.json();
        console.debug('enhancedData', enhancedData);
        
        if (!enhancedData.success) {
          throw new Error(enhancedData.error || 'Enhanced API failed');
        }
        
        // Try common fallbacks: message | text | content | choices[0].message.content
        const maybeMessage = enhancedData?.message
          || enhancedData?.text
          || enhancedData?.content
          || (enhancedData?.choices && enhancedData.choices[0] && (enhancedData.choices[0].message?.content || enhancedData.choices[0].text))
          || '';
        response = maybeMessage;
        console.debug('resolved response text', response);
        
        // Force non-empty response to prevent empty messages
        if (!response || response.trim() === '') {
          response = language === 'ar' 
            ? 'عذراً، لم أتمكن من الحصول على رد مناسب. يرجى المحاولة مرة أخرى.'
            : 'Sorry, I could not generate a proper response. Please try again.';
          console.warn('Empty API response, using fallback message');
        }
        
        // Log MCP usage if any
        if (enhancedData.mcpUsed && enhancedData.mcpResults) {
          console.log('MCP tools used:', enhancedData.mcpResults);
        }
        
        // معالجة التفكير إذا كان متوفراً
        if (enhancedData.hasReasoning && enhancedData.thinking) {
          const messageId = genId();
          setThinkingMessages(prev => ({
            ...prev,
            [messageId]: {
              thinking: enhancedData.thinking,
              response: enhancedData.message,
              isCompleted: false
            }
          }));
          
          // إنشاء رسالة مؤقتة للتفكير
          const thinkingMessage: ChatMessage = {
            id: messageId,
            content: '', // سيتم ملؤه لاحقاً
            role: 'assistant',
            timestamp: new Date().toISOString(),
            isThinking: true
          };
          
          setMessages(prev => [...prev, thinkingMessage]);
          setLastMessageId(messageId);
          
          // Fallback timeout to ensure message appears even if ThinkingMessage fails
          setTimeout(() => {
            setThinkingMessages(prev => {
              const entry = prev[messageId];
              if (entry && !entry.isCompleted) {
                setMessages(prevMsgs => prevMsgs.map(m => 
                  m.id === messageId 
                    ? { ...m, content: entry.response || '(No response returned)', isThinking: false } 
                    : m
                ));
                const next = { ...prev };
                delete next[messageId];
                return next;
              }
              return prev;
            });
          }, 8000); // 8s guard
          
          return; // الخروج مبكراً لعرض التفكير
        }
      }
      
      // Create storage-compatible assistant message
      const assistantMessage: ChatMessage = {
        id: genId(),
        content: response,
        role: 'assistant',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setLastMessageId(assistantMessage.id);
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        setError(language === 'ar' 
          ? `تم الوصول لحد استخدام الخدمة. يرجى المحاولة مرة أخرى خلال دقائق قليلة أو الترقية لحساب Pro للحصول على وصول أولوي.\n\nService rate limit reached. Please try again in a few minutes or upgrade to Pro account for priority access.`
          : `Service rate limit reached. Please try again in a few minutes or upgrade to Pro account for priority access.\n\nتم الوصول لحد استخدام الخدمة. يرجى المحاولة مرة أخرى خلال دقائق قليلة أو الترقية لحساب Pro.`
        );
      } else if (error.message?.includes('Invalid API key')) {
        setError(language === 'ar' 
          ? `خطأ في مفتاح API. يرجى التحقق من ملف .env والتأكد من وجود GPTGOD_API و OPEN_ROUTER_API.\n\nAPI key error. Please check .env file and ensure GPTGOD_API and OPEN_ROUTER_API are set.`
          : `API key error. Please check .env file and ensure GPTGOD_API and OPEN_ROUTER_API are set.\n\nخطأ في مفتاح API. يرجى التحقق من ملف .env والتأكد من وجود المفاتيح المطلوبة.`
        );
      } else {
        setError(error.message || (language === 'ar' ? 'حدث خطأ أثناء إرسال الرسالة' : 'An error occurred while sending the message'));
      }
    } finally {
      setIsLoading(false);
      sendMessageRef.current = false; // Reset race condition flag
    }
  };

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const copyChat = useCallback((messageId?: string) => {
    if (messages.length === 0) {
      alert(language === 'ar' ? 'لا توجد محادثة لنسخها' : 'No conversation to copy');
      return;
    }

    let textToCopy = '';
    
    if (messageId !== undefined) {
      // Copy single message
      const message = messages.find(m => m.id === messageId);
      if (!message) return;
      textToCopy = message.content;
    } else {
      // Copy entire chat
      textToCopy = messages.map(message => {
        const sender = message.role === 'user' 
          ? (language === 'ar' ? 'أنت' : 'You')
          : selectedModel.name;
        
        return `${sender}:\n${message.content}\n`;
      }).join('\n---\n\n');
    }

    // Copy to clipboard with fallback
    const copyToClipboard = async (text: string) => {
      try {
        // Modern clipboard API
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          return true;
        } else {
          // Fallback for older browsers or non-secure contexts
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          const success = document.execCommand('copy');
          textArea.remove();
          
          if (!success) {
            throw new Error('Copy command failed');
          }
          return true;
        }
      } catch (err) {
        console.error('Failed to copy:', err);
        return false;
      }
    };

    copyToClipboard(textToCopy).then((success) => {
      if (success) {
        const successId = messageId !== undefined ? `message-${messageId}` : 'chat';
        setShowCopySuccess(successId);
        
        // Hide success message after 2 seconds
        if (timeoutRefs.current.copySuccess) {
          clearTimeout(timeoutRefs.current.copySuccess);
        }
        timeoutRefs.current.copySuccess = setTimeout(() => {
          setShowCopySuccess(null);
        }, 2000);
      } else {
        alert(language === 'ar' ? 'فشل في النسخ' : 'Failed to copy');
      }
    });
  }, [messages, language, selectedModel]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError('');
    setCurrentChatSession(null);
  }, []);

  const resetChat = useCallback(async () => {
    setMessages([]);
    setInputMessage('');
    setError('');
    setActiveMode('general');
    setCurrentChatSession(null);
    chatStorage.setCurrentSessionId(null);
  }, []);

  const startNewChat = useCallback(async () => {
    setMessages([]);
    setInputMessage('');
    setError('');
    setCurrentChatSession(null);
    chatStorage.setCurrentSessionId(null);
    await refreshChatHistory(); // Refresh to ensure list is up-to-date
  }, [refreshChatHistory]);

  const loadChatSession = useCallback(async (sessionId: string) => {
    setIsLoadingChat(true);
    const session = await chatStorage.getSession(sessionId);
    if (session) {
      chatStorage.setCurrentSessionId(session.id);
      setCurrentChatSession(session);
      setMessages(session.messages);
      setSelectedModel(session.model || defaultModel);
      setIsHistorySidebarVisible(false); // Close sidebar after selection
    }
    setIsLoadingChat(false);
  }, []);

  const deleteChatSession = useCallback(async (sessionId: string) => {
    const isCurrent = currentChatSession?.id === sessionId;
    await chatStorage.deleteSession(sessionId);
    await refreshChatHistory();
    if (isCurrent) {
      await startNewChat();
    }
  }, [currentChatSession?.id, refreshChatHistory, startNewChat]);

  const toggleHistorySidebar = useCallback(() => {
    setIsHistorySidebarVisible(!isHistorySidebarVisible);
  }, [isHistorySidebarVisible]);

  const handleModeChange = useCallback((mode: 'general' | 'code' | 'creative') => {
    setActiveMode(mode);
    // Apply mode-specific system message
    const systemPrompts = {
      general: language === 'ar' ? 'أنت مساعد ذكي مفيد ومتعاون.' : 'You are a helpful and collaborative AI assistant.',
      code: language === 'ar' ? 'أنت خبير برمجة متخصص في كتابة وشرح الكود.' : 'You are a programming expert specialized in writing and explaining code.',
      creative: language === 'ar' ? 'أنت مساعد إبداعي متخصص في الكتابة الإبداعية والأفكار المبتكرة.' : 'You are a creative assistant specialized in creative writing and innovative ideas.'
    };
  }, [language]);

  const handleCreateNewServer = useCallback(async () => {
    try {
      console.log('Creating new server...'); // Debug log
      // Server creation will be handled via API
      let serverConfig;

      if (serverInputMode === 'json') {
        try {
          const parsedJson = JSON.parse(serverJsonInput);
          console.log('Parsed JSON input:', parsedJson); // Debug log

          // Check if the user pasted the format from GitHub { "mcpServers": { ... } }
          if (parsedJson.mcpServers && typeof parsedJson.mcpServers === 'object') {
            const serverName = Object.keys(parsedJson.mcpServers)[0];
            if (serverName) {
              const serverDetails = parsedJson.mcpServers[serverName];
              serverConfig = {
                name: serverName,
                command: serverDetails.command,
                args: serverDetails.args || [],
                env: serverDetails.env || {}
              };
              console.log('Transformed GitHub config to:', serverConfig); // Debug log
            } else {
              throw new Error('mcpServers object is empty.');
            }
          } else {
            // Assume it's the direct server object format
            serverConfig = parsedJson;
          }

        } catch (jsonError) {
          alert(language === 'ar' ? 'خطأ في تنسيق JSON' : 'Invalid JSON format');
          return;
        }
      } else {
        serverConfig = {
          name: newServerData.name,
          description: 'User-added server',
          category: 'custom',
          status: 'inactive' as const,
          command: newServerData.command,
          args: newServerData.args
        };
        console.log('Form config:', serverConfig); // Debug log
      }

      try {
        // Server creation will be handled via API
        console.log('Server created'); // Debug log
        
        const updatedServers: MCPServer[] = [];
        // Server updates handled by hook;
        
        // If user is logged in, save to their account
        if (user && userServersLoaded) {
          try {
            // userMCPService removed - using new simplified MCP system
            console.log('Server sync - using new MCP system');
            console.log('Server saved to user account');
          } catch (err) {
            console.error('Failed to save server to user account:', err);
          }
        }
        
        setShowAddServer(false);
        setNewServerData({ name: '', command: '', args: [], env: {} });
        setServerJsonInput('');
        
        const successMessage = language === 'ar' 
          ? (user ? 'تم إنشاء وحفظ الخادم بنجاح!' : 'تم إنشاء الخادم بنجاح!')
          : (user ? 'Server created and saved successfully!' : 'Server created successfully!');
        
        alert(successMessage);
      } catch (error) {
        console.error('Error creating server:', error); // Debug log
        alert(language === 'ar' ? `خطأ في إنشاء الخادم: ${error}` : `Failed to create server: ${error}`);
        setError(`Failed to create server: ${error}`);
      }
    } catch (outerError) {
      console.error('Outer error creating server:', outerError);
      alert(language === 'ar' ? `خطأ في إنشاء الخادم: ${outerError}` : `Failed to create server: ${outerError}`);
      setError(`Failed to create server: ${outerError}`);
    }
  }, [serverInputMode, serverJsonInput, newServerData, language]);

  const handleAddArg = useCallback(() => {
    setNewServerData(prev => ({
      ...prev,
      args: [...prev.args, '']
    }));
  }, []);

  const handleUpdateArg = useCallback((index: number, value: string) => {
    setNewServerData(prev => ({
      ...prev,
      args: prev.args.map((arg, i) => i === index ? value : arg)
    }));
  }, []);

  const handleRemoveArg = useCallback((index: number) => {
    setNewServerData(prev => ({
      ...prev,
      args: prev.args.filter((_, i) => i !== index)
    }));
  }, []);

  // Check if current model supports vision/images
  const modelSupportsImages = useCallback(() => {
    return selectedModel.capabilities.includes('vision') || selectedModel.capabilities.includes('multimodal');
  }, [selectedModel]);

  // Handle image upload
  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        setAttachedImages(prev => [...prev, ...imageFiles]);
        
        // Create preview URLs
        const newPreviewUrls = imageFiles.map(file => URL.createObjectURL(file));
        setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
      }
    };
    input.click();
  }, []);

  // Remove attached image
  const removeImage = useCallback((index: number) => {
    // Revoke the old URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  }, [imagePreviewUrls]);

  // Clear all images
  const clearAllImages = useCallback(() => {
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setAttachedImages([]);
    setImagePreviewUrls([]);
    setFullscreenImage(null);
  }, [imagePreviewUrls]);

  // Open image in fullscreen
  const openFullscreenImage = useCallback((index: number, url: string) => {
    setFullscreenImage({index, url});
  }, []);

  // Close fullscreen image
  const closeFullscreenImage = useCallback(() => {
    setFullscreenImage(null);
  }, []);

  // Navigate to next/previous image in fullscreen
  const navigateFullscreenImage = useCallback((direction: 'next' | 'prev') => {
    if (!fullscreenImage || imagePreviewUrls.length <= 1) return;
    
    const currentIndex = fullscreenImage.index;
    let newIndex;
    
    if (direction === 'next') {
      newIndex = currentIndex + 1 >= imagePreviewUrls.length ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex - 1 < 0 ? imagePreviewUrls.length - 1 : currentIndex - 1;
    }
    
    setFullscreenImage({
      index: newIndex,
      url: imagePreviewUrls[newIndex]
    });
  }, [fullscreenImage, imagePreviewUrls]);

  // Download image function with memory cleanup
  const downloadImageFile = useCallback((url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up blob URLs if applicable
    if (url.startsWith('blob:')) {
      const cleanupTimeout = setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100); // Short delay to ensure download started
      
      timeoutRefs.current.urlCleanup?.push(cleanupTimeout);
    }
  }, []);

  // Handle text/code file upload with cleanup
  const handleFileUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.h,.css,.html,.xml,.json,.md,.yml,.yaml,.sql,.sh,.bat,.ps1,.php,.rb,.go,.rs,.swift,.kt,.scala,.clj,.hs,.ml,.r,.m,.pl,.lua,.dart,.vue,.svelte,.astro';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Check file size (max 1MB)
        if (file.size > 1024 * 1024) {
          alert(language === 'ar' 
            ? 'حجم الملف كبير جداً. الحد الأقصى 1 ميجابايت.'
            : 'File size too large. Maximum 1MB allowed.'
          );
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const preview = content.length > 200 ? content.substring(0, 200) + '...' : content;
          
          setAttachedFile({
            file,
            content,
            preview
          });
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  // Remove attached file
  const removeAttachedFile = () => {
    setAttachedFile(null);
  };

  // Convert image file to base64 with validation and error handling
  const imageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        reject(new Error(`Invalid file type: ${file.type}. Only image files are allowed.`));
        return;
      }
      
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        reject(new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum allowed: 10MB.`));
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        if (!result) {
          reject(new Error('Failed to read file content'));
          return;
        }
        resolve(result);
      };
      
      reader.onerror = () => {
        reject(new Error(`Failed to read file: ${file.name}`));
      };
      
      try {
        reader.readAsDataURL(file);
      } catch (error) {
        reject(new Error(`Error reading file: ${error}`));
      }
    });
  };

  // Close HTML preview
  // HTML preview function removed - now opens directly in new tab

  // Get file icon based on extension
  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const codeExts = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'css', 'html', 'xml', 'json', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala', 'clj', 'hs', 'ml', 'r', 'm', 'pl', 'lua', 'dart', 'vue', 'svelte', 'astro'];
    
    if (codeExts.includes(ext || '')) {
      return '💻'; // Code file
    } else if (['md', 'txt'].includes(ext || '')) {
      return '📝'; // Text file
    } else if (['yml', 'yaml', 'json'].includes(ext || '')) {
      return '⚙️'; // Config file
    } else {
      return '📄'; // Generic file
    }
  };

  const handleUploadFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.json,.md,.pdf';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setInputMessage((prev: string) => prev + '\n\n' + (language === 'ar' ? 'محتوى الملف:' : 'File content:') + '\n' + content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleTerminalOpen = () => {
    // Open terminal modal or navigate to terminal page
    window.open('/terminal', '_blank');
  };

  const handleChatHistory = () => {
    setShowSettings(true); // Show settings modal with chat history
  };

  const connectedServers = mcpServers.filter(s => s.status === 'connected');
  const allPrompts: any[] = [];

  return (
    <Layout title="Collactions" showSearch={true} hideFooter={true}>
      <div className="h-screen text-foreground overflow-hidden relative">

        {/* Responsive Layout */}
        <div className="flex h-full">
          {/* Left Panel - Hidden by default, toggleable */}
          <div 
            className={`
              w-80 bg-background border-r flex flex-col h-full
              fixed top-0 left-0 z-40 
              transform transition-all duration-300 ease-in-out
              ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'}
            `}
            style={{
              transform: isSidebarVisible ? 'translateX(0)' : 'translateX(-100%)'
            }}
          >
            {/* MCP Sidebar */}
            <div className="p-3 lg:p-4 bg-bg-[#212121] border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <h1 className="text-lg lg:text-xl font-semibold text-foreground flex items-center">
                  <Server className="w-5 h-5 mr-2" />
                  {language === 'ar' ? 'خوادم MCP' : 'MCP Servers'}
                </h1>
                <div className="flex items-center space-x-2">
                  {/* Disconnect All Button */}
                  <button
                    onClick={async () => {
                      const connectedServersList = mcpServers.filter(s => s.status === 'connected');
                      if (connectedServersList.length === 0) {
                        return;
                      }
                      
                      if (window.confirm(language === 'ar' ? 
                        `هل تريد قطع الاتصال عن جميع الخوادم المتصلة (${connectedServersList.length})؟` : 
                        `Disconnect all connected servers (${connectedServersList.length})?`
                      )) {
                        setIsRefreshingMCP(true);
                        try {
                          const disconnectPromises = connectedServersList.map(async (server) => {
                            try {
                              const response = await fetch('/api/mcp/toggle', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                  serverId: server.id, 
                                  action: 'disconnect'
                                })
                              });
                              const result = await response.json();
                              console.log(`Disconnected ${server.name}:`, result);
                              return result;
                            } catch (error) {
                              console.error(`Failed to disconnect ${server.name}:`, error);
                              return null;
                            }
                          });
                          
                          await Promise.all(disconnectPromises);
                          
                          // Single refresh after all disconnections
                          await refreshServers();
                          
                        } catch (error) {
                          console.error('Error disconnecting all servers:', error);
                        } finally {
                          setIsRefreshingMCP(false);
                        }
                      }
                    }}
                    disabled={isRefreshingMCP || mcpServers.filter(s => s.status === 'connected').length === 0}
                    className="p-1.5 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded transition-colors disabled:opacity-50"
                    title={language === 'ar' ? 'قطع الاتصال عن جميع الخوادم' : 'Disconnect All Servers'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  {/* Refresh Button */}
                  <button
                    onClick={refreshServers}
                    disabled={isRefreshingMCP}
                    className="p-2 hover:bg-muted/50 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshingMCP ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* MCP Servers */}
            <div className="flex-1 p-2 lg:p-4 space-y-2 lg:space-y-3 overflow-y-scroll">
              {mcpServers.length === 0 ? (
                <div className="text-center py-8">
                  <Server className="w-12 h-12 mx-auto text-muted mb-4" />
                  <p className="text-muted text-sm">
                    {language === 'ar' ? 'لا توجد خوادم MCP متصلة' : 'No MCP servers connected'}
                  </p>
                  <p className="text-xs text-muted mt-2">
                    {language === 'ar' ? 'أضف خادم من إعدادات الخوادم' : 'Add a server from server settings'}
                  </p>
                </div>
              ) : (
                mcpServers.map((server, index) => (
                  <div
                    key={`${server.id || server.name}-${index}`}
                    className="p-2 lg:p-3 bg-transparent border border-border rounded-lg transition-all duration-200 hover:bg-bg-dark/50"
                  >
                    <div className="flex items-start space-x-2 lg:space-x-3">
                      <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                        server.status === 'connected' ? 'bg-green-500 animate-pulse' : 
                        server.status === 'error' ? 'bg-red-500' : 
                        'bg-yellow-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground text-sm lg:text-base truncate">
                          {server.name}
                        </h3>
                        <p className="text-xs text-muted">
                          {server.status === 'connected' ? 
                            (language === 'ar' ? 'متصل ✓' : 'Connected ✓') :
                            server.status === 'error' ?
                            (language === 'ar' ? 'خطأ في الاتصال' : 'Connection Error') :
                            (language === 'ar' ? 'غير متصل' : 'Disconnected')
                          }
                        </p>
                        {server.description && (
                          <p className="text-xs text-muted mt-1 line-clamp-2">
                            {server.description}
                          </p>
                        )}
                        
                        {/* Server Tools Count */}
                        {server.tools && server.tools.length > 0 && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Zap className="w-3 h-3 text-blue-400" />
                            <span className="text-xs text-muted">
                              {server.tools.length} {language === 'ar' ? 'أداة' : 'tools'}
                            </span>
                          </div>
                        )}
                        
                        {/* Path Config Button for Filesystem/Git */}
                        {(server.id === 'filesystem' || server.id === 'git') && (
                          <div className="mt-2 pt-2 border-t border-border/30">
                            <button 
                              onClick={() => {
                                const newPath = prompt(
                                  language === 'ar' 
                                    ? `أدخل المسار الجديد لـ ${server.name}:` 
                                    : `Enter new path for ${server.name}:`,
                                  serverPaths[server.id] || '/home/msr/Desktop/ss/collactions'
                                );
                                if (newPath && newPath.trim()) {
                                  setServerPaths(prev => ({
                                    ...prev,
                                    [server.id]: newPath.trim()
                                  }));
                                }
                              }}
                              className="w-full p-1 text-xs bg-bg-dark/50 hover:bg-bg-dark text-muted hover:text-foreground border border-border/50 rounded transition-colors flex items-center justify-center space-x-1"
                              title={language === 'ar' ? 'تعديل المسار' : 'Edit Path'}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m8 10 4 4 4-4" />
                              </svg>
                              <span>{language === 'ar' ? 'تعديل المسار' : 'Edit Path'}</span>
                            </button>
                            {serverPaths[server.id] && (
                              <div className="mt-1 text-xs text-blue-400">
                                {language === 'ar' ? 'المسار:' : 'Path:'} {serverPaths[server.id]}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Server Actions */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                          <div className="flex items-center space-x-1">
                            {/* Connect/Disconnect Button */}
                            <button
                              onClick={async () => {
                                setConnectingServer(server.name);
                                try {
                                  console.log(`Toggling ${server.id} from ${server.status} to ${server.status === 'connected' ? 'disconnect' : 'connect'}`);
                                  const action = server.status === 'connected' ? 'disconnect' : 'connect';
                                  
                                  const response = await fetch('/api/mcp/toggle', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ 
                                      serverId: server.id, 
                                      action,
                                      path: serverPaths[server.id] || undefined
                                    })
                                  });
                                  
                                  // Parse JSON with proper error handling
                                  let result;
                                  try {
                                    result = await response.json();
                                  } catch (parseError) {
                                    console.error('Failed to parse response JSON:', parseError);
                                    result = { 
                                      success: false, 
                                      error: 'Invalid response format',
                                      message: `Server returned status ${response.status} with invalid JSON`
                                    };
                                  }
                                  console.log('Toggle result:', result);
                                  
                                  if (result.success) {
                                    // Immediate refresh for disconnect, delayed for connect
                                    if (action === 'disconnect') {
                                      await refreshServers();
                                    } else {
                                      // Single refresh for connect with longer delay
                                      const refreshTimeout = setTimeout(async () => {
                                        await refreshServers();
                                      }, 2000);
                                      timeoutRefs.current.mcpRefresh?.push(refreshTimeout);
                                    }
                                  } else {
                                    console.error('Toggle failed:', result.message || result.error || 'Unknown error');
                                    // Show user-friendly message based on error type
                                    if (result.error === 'Connection timeout') {
                                      console.warn('⏱️ Server connection timed out. The MCP server may not be available.');
                                    } else if (result.error === 'Connection failed') {
                                      console.warn('🔌 Failed to establish connection to MCP server.');
                                    }
                                  }
                                } catch (err) {
                                  console.error('Toggle server error:', err);
                                } finally {
                                  setConnectingServer(null);
                                }
                              }}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                connectingServer === server.name ? 'bg-yellow-500 text-black' : 
                                server.status === 'connected' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 
                                'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              }`}
                              disabled={connectingServer !== null}
                              title={server.status === 'connected' ? 
                                (language === 'ar' ? 'قطع الاتصال' : 'Disconnect') : 
                                (language === 'ar' ? 'اتصال' : 'Connect')
                              }
                            >
                              {connectingServer === server.name ? (
                                <Loader className="w-3 h-3 animate-spin" />
                              ) : server.status === 'connected' ? (
                                <Pause className="w-3 h-3" />
                              ) : (
                                <Globe className="w-3 h-3" />
                              )}
                            </button>

                            {/* Refresh Server Button */}
                            <button
                              onClick={async () => {
                                try {
                                  // Call API to refresh specific server
                                  const response = await fetch(`/api/mcp/refresh/${server.id}`, {
                                    method: 'POST'
                                  });
                                  
                                  if (response.ok) {
                                    await refreshServers();
                                  }
                                } catch (err) {
                                  console.error('Refresh server error:', err);
                                }
                              }}
                              className="p-1 text-xs text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                              title={language === 'ar' ? 'تحديث الخادم' : 'Refresh Server'}
                            >
                              <Loader className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Delete Server Button */}
                          <button
                            onClick={async () => {
                              if (window.confirm(language === 'ar' ? 
                                `هل أنت متأكد من حذف خادم ${server.name}؟` : 
                                `Are you sure you want to delete server ${server.name}?`
                              )) {
                                try {
                                  // Call API to delete server
                                  const response = await fetch(`/api/mcp/delete/${server.id}`, {
                                    method: 'DELETE'
                                  });
                                  
                                  if (response.ok) {
                                    // Remove from local state
                                    // Server removal handled by hook;
                                    
                                    // Also remove from user servers if logged in
                                    if (user && userServersLoaded) {
                                      // userMCPService removed - using new simplified MCP system
                                      console.log('Server deletion - using new MCP system');
                                    }
                                  }
                                } catch (err) {
                                  console.error('Delete server error:', err);
                                }
                              }
                            }}
                            className="p-1 text-xs text-red-400 hover:bg-red-500/20 rounded transition-colors"
                            title={language === 'ar' ? 'حذف الخادم' : 'Delete Server'}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Command Menu Hint & Add Servers */}
            <div className="p-2 lg:p-4 border-t-3 ">
              <div className="text-center text-xs lg:text-sm text-muted py-1 lg:py-2 mb-2 lg:mb-3 hidden lg:block">
                {language === 'ar' ? 'أو اضغط' : 'or enter'} <kbd className="px-2 py-1 bg-bg-dark border border-border rounded text-xs mx-1">⌘K</kbd> {language === 'ar' ? 'لعرض قائمة الأوامر' : 'to view command menu'}
              </div>

              {/* User Status Indicator */}
              {user && (
                <div className="text-center text-xs text-muted mb-2 lg:mb-3">
                  {isLoadingUserServers ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader className="w-3 h-3 animate-spin" />
                      <span>{language === 'ar' ? 'تحميل الخوادم المحفوظة...' : 'Loading saved servers...'}</span>
                    </div>
                  ) : userServersLoaded ? (
                    <div className="flex items-center justify-center space-x-2 ">
              <img src="/small_icon_cyen.svg" alt="Service icon" className="w-4 h-4" />
              <span>{language === 'ar' ? 'متصل - الخوادم محفوظة في حسابك' : 'Connected - Servers saved to your account'}</span>
                    </div>
                  ) : null}
                </div>
              )}

              <button
                onClick={() => setShowAddServer(!showAddServer)}
                className="w-full flex items-center justify-center space-x-2 p-2 lg:p-3 bg-transparent hover:bg-bg-dark border border-border rounded-lg transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span className="text-xs lg:text-sm text-foreground">
                  {language === 'ar' ? 'إضافة خادم' : 'Add Server'}
                </span>
              </button>

              {/* Add Server Form */}
              {showAddServer && (
                <div className="mt-4 p-4 bg-card rounded-lg border border-border">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    {language === 'ar' ? 'إضافة خادم جديد' : 'Add New Server'}
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {language === 'ar' ? 'معرف الخادم' : 'Server ID'}
                      </label>
                      <input
                        type="text"
                        value={newServerData.name}
                        onChange={(e) => setNewServerData({...newServerData, name: e.target.value})}
                        placeholder={language === 'ar' ? 'مثال: my-server' : 'Example: my-server'}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {language === 'ar' ? 'الأمر' : 'Command'}
                      </label>
                      <input
                        type="text"
                        value={newServerData.command}
                        onChange={(e) => setNewServerData({...newServerData, command: e.target.value})}
                        placeholder="npx"
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {language === 'ar' ? 'المعاملات' : 'Arguments'}
                      </label>
                      <input
                        type="text"
                        value={newServerData.args.join(' ')}
                        onChange={(e) => setNewServerData({...newServerData, args: e.target.value.split(' ').filter((arg: string) => arg.trim())})}
                        placeholder="-y @modelcontextprotocol/server-time"
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                      />
                    </div>
                    
                    <button
                      onClick={async () => {
                        if (!newServerData.name || !newServerData.command) {
                          alert(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
                          return;
                        }
                        
                        try {
                          setConnectingServer(newServerData.name);
                          console.log(`🔄 Adding custom server: ${newServerData.name}`);
                          
                          const response = await fetch('/api/mcp/servers', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              serverId: newServerData.name,
                              command: newServerData.command,
                              args: newServerData.args
                            })
                          });
                          
                          const result = await response.json();
                          console.log('Add server result:', result);
                          
                          if (result.success) {
                            // Clear form
                            setNewServerData({
                              name: '',
                              command: '',
                              args: [],
                              env: {}
                            });
                            setShowAddServer(false);
                            
                            // Refresh server list
                            await refreshServers();
                            
                            console.log(`✅ Server ${newServerData.name} added successfully`);
                          } else {
                            console.error('Failed to add server:', result.error);
                            alert(language === 'ar' ? 
                              `فشل في إضافة الخادم: ${result.error}` : 
                              `Failed to add server: ${result.error}`
                            );
                          }
                        } catch (err) {
                          console.error('Add server error:', err);
                          alert(language === 'ar' ? 'حدث خطأ في إضافة الخادم' : 'Error adding server');
                        } finally {
                          setConnectingServer(null);
                        }
                      }}
                      disabled={!newServerData.name || !newServerData.command || connectingServer !== null}
                      className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {connectingServer === newServerData.name ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      {language === 'ar' ? 'إضافة خادم' : 'Add Server'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Overlay */}
          {isSidebarVisible && (
            <div 
              className="fixed inset-0 bg-black/50 z-30"
              onClick={() => setIsSidebarVisible(false)}
            />
          )}

          {/* Right Panel - Chat Area */}
          <div className="flex-1 flex flex-col bg-background min-h-0 w-full">
            {/* Top Bar */}
            <div className="p-2 lg:p-4 border-b flex items-center justify-between">
              <div className="flex items-center space-x-2 lg:space-x-3">
                {/* Sidebar Toggle Button */}
                <button
                  onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                  className="p-2 bg-background border border-border rounded-lg hover:bg-muted transition-all duration-200"
                  title={isSidebarVisible 
                    ? (language === 'ar' ? 'إخفاء القائمة الجانبية' : 'Hide sidebar')
                    : (language === 'ar' ? 'إظهار القائمة الجانبية' : 'Show sidebar')
                  }
                >
                  {isSidebarVisible ? (
                    <CloseIcon className="w-4 h-4 text-foreground" />
                  ) : (
                    <Menu className="w-4 h-4 text-foreground" />
                  )}
                </button>
                
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelSelect={setSelectedModel}
                  className="min-w-[180px] lg:min-w-[280px] bg-bg-dark text-sm lg:text-base"
                />
              </div>
              <div className="flex items-center space-x-1 lg:space-x-2">
                <button 
                  onClick={toggleHistorySidebar}
                  className="p-1.5 lg:p-2 text-muted hover:text-foreground transition-colors rounded"
                  title={language === 'ar' ? 'تاريخ المحادثات' : 'Chat History'}
                >
                  <MessageSquare className="h-3 w-3 lg:h-4 lg:w-4" />
                </button>
                <button 
                  onClick={handleUploadFile}
                  className="p-1.5 lg:p-2 text-muted hover:text-foreground transition-colors rounded"
                  title={language === 'ar' ? 'رفع ملف' : 'Upload file'}
                >
                  <Upload className="h-3 w-3 lg:h-4 lg:w-4" />
                </button>
                <button 
                  onClick={handleTerminalOpen}
                  className="p-1.5 lg:p-2 text-muted hover:text-foreground transition-colors rounded"
                  title={language === 'ar' ? 'فتح الطرفية' : 'Open terminal'}
                >
                  <Terminal className="h-3 w-3 lg:h-4 lg:w-4" />
                </button>
                <button 
                  onClick={() => setShowAddServer(true)}
                  className={`p-1.5 lg:p-2 transition-colors rounded ${
                    mcpEnabled 
                      ? 'text-blue-500 hover:text-blue-400' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  title={language === 'ar' ? 'إعدادات MCP' : 'MCP Settings'}
                >
                  <Server className="h-3 w-3 lg:h-4 lg:w-4" />
                </button>
                <button 
                  onClick={() => setMcpEnabled(!mcpEnabled)}
                  className={`p-1.5 lg:p-2 transition-colors rounded ${
                    mcpEnabled 
                      ? 'text-green-500 hover:text-green-400' 
                      : 'text-red-500 hover:text-red-400'
                  }`}
                  title={language === 'ar' 
                    ? `${mcpEnabled ? 'إيقاف' : 'تفعيل'} MCP` 
                    : `${mcpEnabled ? 'Disable' : 'Enable'} MCP`
                  }
                >
                  <Zap className="h-3 w-3 lg:h-4 lg:w-4" />
                </button>
                <button 
                  onClick={handleChatHistory}
                  title={language === 'ar' ? 'الإعدادات' : 'Settings'}
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Prompt Comparison Modal */}
            {promptComparison && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 lg:p-4">
                <div className="bg-background border border-border rounded-lg p-4 lg:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                  <div className="flex items-center justify-between mb-4 lg:mb-6">
                    <h2 className="text-lg lg:text-xl font-semibold text-foreground">
                      {language === 'ar' ? 'مقارنة البرومت' : 'Prompt Comparison'}
                    </h2>
                    <button 
                      onClick={() => setPromptComparison(null)}
                      className="p-2 hover:bg-bg-dark rounded-full transition-colors"
                    >
                      <X className="h-5 w-5 lg:h-6 lg:w-6 text-muted" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
                    {/* Original Prompt */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-foreground border-b border-border pb-2 flex items-center space-x-2">
                        <span>{language === 'ar' ? 'البرومت الأصلي' : 'Original Prompt'}</span>
                        <span className="text-xs bg-muted/20 px-2 py-1 rounded">
                          {language === 'ar' ? 'كما كتبته' : 'As you wrote it'}
                        </span>
                      </h3>
                      <div className="bg-bg-dark border border-border rounded-lg p-3 text-sm text-foreground min-h-[100px]">
                        {promptComparison.original}
                      </div>
                      <button
                        onClick={() => {
                          setInputMessage(promptComparison!.original);
                          setPromptComparison(null);
                        }}
                        className="w-full px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm"
                      >
                        {language === 'ar' ? 'استخدام الأصلي' : 'Use Original'}
                      </button>
                    </div>

                    {/* Enhanced Prompt */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-foreground border-b border-border pb-2 flex items-center space-x-2">
                        <span>{language === 'ar' ? 'البرومت المحسن' : 'Enhanced Prompt'}</span>
                        <span className="text-xs bg-primary/20 px-2 py-1 rounded">
                          {promptComparison.model}
                        </span>
                      </h3>
                      <div className="bg-bg-dark border border-primary/30 rounded-lg p-3 text-sm text-foreground min-h-[100px]">
                        {promptComparison.enhanced}
                      </div>
                      <button
                        onClick={() => {
                          setInputMessage(promptComparison!.enhanced);
                          setPromptComparison(null);
                        }}
                        className="w-full px-4 py-2 bg-primary text-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                      >
                        {language === 'ar' ? 'استخدام المحسن' : 'Use Enhanced'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-2 pt-4 border-t border-border">
                    <button
                      onClick={() => setPromptComparison(null)}
                      className="px-6 py-2 text-muted hover:text-foreground transition-colors text-sm"
                    >
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Translation Comparison Modal */}
            {translationComparison && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 lg:p-4">
                <div className="bg-background border border-border rounded-lg p-4 lg:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                  <div className="flex items-center justify-between mb-4 lg:mb-6">
                    <h2 className="text-lg lg:text-xl font-semibold text-foreground">
                      {language === 'ar' ? 'مقارنة الترجمة' : 'Translation Comparison'}
                    </h2>
                    <button 
                      onClick={() => setTranslationComparison(null)}
                      className="p-2 hover:bg-bg-dark rounded-full transition-colors"
                    >
                      <X className="h-5 w-5 lg:h-6 lg:w-6 text-muted" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
                    {/* Original Arabic */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-foreground border-b border-border pb-2 flex items-center space-x-2">
                        <span>{language === 'ar' ? 'النص العربي الأصلي' : 'Original Arabic'}</span>
                        <span className="text-xs bg-muted/20 px-2 py-1 rounded">
                          عربي
                        </span>
                      </h3>
                      <div className="bg-bg-dark border border-border rounded-lg p-3 text-sm text-foreground min-h-[100px] text-right">
                        {translationComparison.original}
                      </div>
                      <button
                        onClick={() => {
                          setInputMessage(translationComparison!.original);
                          setTranslationComparison(null);
                        }}
                        className="w-full px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm"
                      >
                        {language === 'ar' ? 'استخدام العربي' : 'Use Arabic'}
                      </button>
                    </div>

                    {/* English Translation */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-foreground border-b border-border pb-2 flex items-center space-x-2">
                        <span>{language === 'ar' ? 'الترجمة الإنجليزية' : 'English Translation'}</span>
                        <span className="text-xs bg-blue-500/20 px-2 py-1 rounded">
                          English
                        </span>
                      </h3>
                      <div className="bg-bg-dark border border-blue-500/30 rounded-lg p-3 text-sm text-foreground min-h-[100px]">
                        {translationComparison.translated}
                      </div>
                      <button
                        onClick={() => {
                          setInputMessage(translationComparison!.translated);
                          setTranslationComparison(null);
                        }}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500/90 transition-colors text-sm"
                      >
                        {language === 'ar' ? 'استخدام الترجمة' : 'Use Translation'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-2 pt-4 border-t border-border">
                    <button
                      onClick={() => setTranslationComparison(null)}
                      className="px-6 py-2 text-muted hover:text-foreground transition-colors text-sm"
                    >
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Content */}
            <div className="flex-1 overflow-y-scroll ">
              {messages.length === 0 ? (
                <div className="p-3 lg:p-6 flex flex-col items-center justify-center h-full">
                  <div className="text-center space-y-4 lg:space-y-6 max-w-2xl px-4">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <MessageSquare className="w-6 h-6 lg:w-8 lg:h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl lg:text-2xl font-bold text-muted mb-2">
                        {language === 'ar' ? 'مرحباً بك في Collactions AI' : 'Welcome to Collactions AI'}
                      </h2>
                      <p className="text-muted text-base lg:text-lg">
                        {language === 'ar' 
                          ? 'اختر نموذج AI واسأل أي شيء. يمكنك أيضاً استخدام الأدوات المتقدمة للمساعدة في مهامك.'
                          : 'Choose an AI model and ask anything. You can also use advanced tools to help with your tasks.'
                        }
                      </p>
                    </div>
                    <div className="text-white/50 border-glow rounded-lg p-3 lg:p-4">
                      <div className="text-xs lg:text-sm text-muted font-mono">
                        {language === 'ar' ? 'أنت مساعد مفيد.' : 'You are a helpful assistant.'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 lg:p-6 ">
                  <div className="space-y-3 lg:space-y-4 ">
                    {messages && messages.map((message) => (
                      <div key={message.id} className="flex items-start space-x-2 lg:space-x-3 ">
                        {message.role === 'user' ? (
              <img src="/small_icon_cyen.svg" alt="Service icon" className="w-7 h-7 " />
            ) : (
              <img src="/small_icon_lime.svg" alt="Service icon" className="w-7 h-7" />
                        )}
                        <div className={`px-3 py-3 lg:px-4 lg:py-4 flex-1 min-w-0 border-3 rounded-lg break-words overflow-auto ${
                          message.role === 'user'
                            ? 'border-glow  text-white/50'
                            : 'bg-bg-dark border-black !border-3  text-white/50' 
                        }`}>
                          <div className="text-xs lg:text-sm text-muted mb-1  flex justify-between items-center">
                            <span>
                              {message.role === 'user' 
                                ? (language === 'ar' ? 'أنت' : 'You')
                                : selectedModel.name
                            }
                            </span>
                            <button   
                              onClick={() => copyChat(message.id)}
                              className='p-1.5 lg:p-2 border-3 rounded-md text-white bg-[#1c2225]/50 !border-[#000]/10 transition-colors relative'
                            >
                              {showCopySuccess === `message-${message.id}` ? (
                                <div className='flex items-center space-x-1 text-green-400'>
                                  <svg className='w-3 h-3 lg:w-3.5 lg:h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                                  </svg>
                                  <span className='text-xs hidden lg:inline'>
                                    {language === 'ar' ? 'تم النسخ' : 'Copied'}
                                  </span>
                                </div>
                              ) : (
                                <ClipboardList className='w-3 h-33 lg:w-3.5 lg:h-3.5 ' />
                              )}
                            </button>
                          </div>
                          <div className="text-foreground prose max-w-none prose-code:text-primary text-sm lg:text-base [&>*]:text-foreground">
                            {/* DEBUG: Log message for empty content */}
                            {!message.content && (() => {
                              console.warn('Empty message content:', {
                                id: message.id,
                                role: message.role,
                                isThinking: message.isThinking,
                                hasThinkingData: !!thinkingMessages[message.id],
                                lastMessageId: lastMessageId
                              });
                              return null;
                            })()}
                            {message.isThinking && thinkingMessages[message.id] ? (
                              <ThinkingMessage
                                thinking={thinkingMessages[message.id].thinking}
                                response={thinkingMessages[message.id].response}
                                modelName={selectedModel.name}
                                onThinkingComplete={() => {
                                  setThinkingMessages(prev => ({
                                    ...prev,
                                    [message.id]: {
                                      ...prev[message.id],
                                      isCompleted: true
                                    }
                                  }));
                                }}
                                onResponseComplete={() => {
                                  setThinkingMessages(prev => {
                                    const entry = prev[message.id];
                                    if (!entry) return prev;
                                    const response = entry.response;
                                    // Update messages with the captured response
                                    setMessages(prevMsgs => prevMsgs.map(m => 
                                      m.id === message.id 
                                        ? { ...m, content: response, isThinking: false } 
                                        : m
                                    ));
                                    // Remove thinking entry
                                    const newPrev = { ...prev };
                                    delete newPrev[message.id];
                                    return newPrev;
                                  });
                                }}
                              />
                            ) : (
                              <MessageContentRenderer content={message.content || '[Empty Response]'} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-center space-x-2 lg:space-x-3">
              <img src="/small_icon_lime.svg" alt="Service icon" className="w-4 h-4" />
              <div className="flex-1">
                          <div className="text-xs lg:text-sm text-muted mb-1">{selectedModel.name}</div>
                          <div className="flex items-center space-x-2 text-muted">
                            <Loader className="w-3 h-3 lg:w-4 lg:h-4 animate-spin" />
                            <span className="text-xs lg:text-sm">{getTranslation('thinking', language)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mt-6">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="text-red-400 font-medium">{language === 'ar' ? 'خطأ:' : 'Error:'}</p>
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border p-2 lg:p-4 bg-background">
              {/* Image Preview Section */}
              {attachedImages.length > 0 && (
                <div className="mb-3 p-3 bg-bg-dark border border-primary/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Image className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">
                        {language === 'ar' ? `الصور المرفقة (${attachedImages.length})` : `Attached Images (${attachedImages.length})`}
                      </span>
                      {modelSupportsImages() ? (
                        <div className="flex items-center space-x-1 text-green-400">
                          <Eye className="w-3 h-3" />
                          <span className="text-xs">
                            {language === 'ar' ? 'مدعوم' : 'Supported'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-orange-400">
                          <EyeOff className="w-3 h-3" />
                          <span className="text-xs">
                            {language === 'ar' ? 'غير مدعوم' : 'Not Supported'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowImagePreview(!showImagePreview)}
                        className="p-1 text-muted hover:text-foreground transition-colors"
                        title={showImagePreview 
                          ? (language === 'ar' ? 'إخفاء المعاينة' : 'Hide Preview')
                          : (language === 'ar' ? 'عرض المعاينة' : 'Show Preview')
                        }
                      >
                        {showImagePreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={clearAllImages}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title={language === 'ar' ? 'إزالة جميع الصور' : 'Remove all images'}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  {showImagePreview && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-16 lg:h-20 object-cover rounded border border-border group-hover:border-primary/50 transition-colors cursor-pointer"
                            onClick={() => openFullscreenImage(index, url)}
                            title={language === 'ar' ? 'اضغط للعرض بملء الشاشة' : 'Click for fullscreen view'}
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-10"
                            title={language === 'ar' ? 'إزالة الصورة' : 'Remove image'}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {!modelSupportsImages() && (
                    <div className="mt-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded text-xs text-orange-400">
                      {language === 'ar' 
                        ? 'تحذير: النموذج المحدد لا يدعم تحليل الصور. قم بتغيير النموذج إلى GPT-4o أو Mistral Small للحصول على دعم الصور.'
                        : 'Warning: Selected model doesn\'t support image analysis. Switch to GPT-4o or Mistral Small for image support.'
                      }
                    </div>
                  )}
                </div>
              )}
              
              {/* File Preview Section */}
              {attachedFile && (
                <div className="mb-3 p-3 bg-bg-dark border border-primary/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getFileIcon(attachedFile.file.name)}</span>
                      <div>
                        <span className="text-sm text-foreground font-medium">
                          {language === 'ar' ? 'الملف المرفق' : 'Attached File'}
                        </span>
                        <div className="text-xs text-muted">
                          {attachedFile.file.name} ({(attachedFile.file.size / 1024).toFixed(1)}KB)
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setAttachedFile(null)}
                      className="text-muted hover:text-foreground p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-muted bg-bg-darker p-2 rounded max-h-20 overflow-y-auto">
                    {attachedFile.preview}
                    {attachedFile.content.length > 200 && (
                      <div className="text-muted mt-1 text-center">
                        {language === 'ar' ? '... والمزيد' : '... and more'}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Input Field - Main Focus */}
              <div className="mb-3 mr-2 ml-8 lg:mr-4">
                {/* Attachment Buttons - Above textarea */}
                <div className="flex items-center space-x-2 mb-2">
                  {/* Image Upload Button */}
                  <button 
                    onClick={handleImageUpload}
                    className={`p-2 rounded-md transition-colors ${
                      modelSupportsImages() 
                        ? 'text-primary hover:text-primary/80 hover:bg-primary/10 border border-primary/30' 
                        : 'text-muted/50 hover:text-muted cursor-not-allowed border border-muted/30'
                    }`}
                    title={modelSupportsImages() 
                      ? (language === 'ar' ? 'إرفاق صورة - مدعوم' : 'Attach image - Supported')
                      : (language === 'ar' ? 'إرفاق صورة - غير مدعوم في هذا النموذج' : 'Attach image - Not supported by this model')
                    }
                  >
                    <Image className="w-4 h-4" />
                  </button>
                  
                  <button 
                    onClick={handleFileUpload}
                    className="p-2 text-muted hover:text-primary transition-colors border border-muted/30 hover:border-primary/30 rounded-md"
                    title={language === 'ar' ? 'إرفاق ملف نصي أو برمجي' : 'Attach text or code file'}
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                </div>

                {/* Textarea with action buttons inside */}
                <div className="relative rounded-xl">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={language === 'ar' ? 'اكتب رسالتك هنا... (اضغط Enter للإرسال)' : 'Type your message here... (Press Enter to send)'}
                    className={`w-full h-33 bg-input border-2 border-primary/30 rounded-lg px-3 py-3 lg:px-4 lg:py-4 text-foreground placeholder-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 shadow-lg text-sm lg:text-base ${language === 'ar' ? 'pl-20 lg:pl-24' : 'pr-20 lg:pr-24'}`}
                    rows={1}
                    style={{ minHeight: '48px', maxHeight: '100px' }}
                  />
                  
                  {/* Action buttons positioned absolutely inside textarea */}
                  <div className={`absolute  pl-2 bottom-6 flex items-center space-x-1 ${language === 'ar' ? 'left-2' : 'right-2'}`}>
                    <button className="px-3.5 py-3.5  flex items-center text-black rounded-lg border bg-primary !border-foreground/40 border-2 backdrop-blur-sm space-x-1 lg:space-x-2 hidden lg:flex hover:bg-primary ">
                      <Pause className="w-4 h-4 lg:w-4 lg:h-4" />
                    </button>
                    <div className='w-2'>

                    </div>
                    <button 
                      onClick={inputMessage.trim() ? sendMessage : startNewChat}
                      disabled={(!inputMessage.trim() && messages.length === 0) || isLoading}
                      className="px-3.5 py-3 pl-3 flex items-center rounded-lg border bg-[#00212b] border-2 !border-foreground/40  backdrop-blur-sm space-x-1 lg:space-x-2  disabled:opacity-60 disabled:!cursor-not-allowed transition-colors text-white"
                    >
                      <Send className="w-5 h-5 lg:w-5 lg:h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Input Options Row with Action Buttons */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-2 lg:space-y-0 mb-3">
                <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-2 lg:space-y-0 lg:space-x-3">
                  <span className="text-xs lg:text-sm text-muted hidden lg:block">
                    {language === 'ar' ? 'خيارات الإدخال:' : 'Input Options:'}
                  </span>
                  <div className="flex items-center space-x-1 lg:space-x-2">
                    <button 
                      onClick={() => handleModeChange('general')}
                      className={`px-2 lg:px-4 py-1 lg:py-1.5 text-xs border-3 rounded-full transition-all duration-300 fade-in-scale hover:button-glow ${
                        activeMode === 'general' 
                          ? 'bg-bg-dark !border-primary-glow-enhanced  button-glow light-glow-red' 
                          : 'text-muted hover:text-white/50 !hover:border-white/50'
                      }`} >
                      {language === 'ar' ? 'عام' : 'General'}
                    </button>
                    <button 
                      onClick={() => handleModeChange('code')}
                      className={`px-2 lg:px-4 py-1 lg:py-1.5 text-xs rounded-full transition-all duration-300 border-3 fade-in-scale hover:button-glow ${
                        activeMode === 'code' 
                          ? 'bg-bg-dark !border-primary-glow-enhanced primary-glow-enhanced button-glow' 
                          : 'text-muted hover:text-white/50 !hover:border-white/50'
                      }`}
                    >
                      {language === 'ar' ? 'كود' : 'Code'}
                    </button>
                    <button 
                      onClick={() => handleModeChange('creative')}
                      className={`px-2 lg:px-4 py-1 lg:py-1.5 text-xs rounded-full transition-all duration-300 border-3 fade-in-scale hover:button-glow ${
                        activeMode === 'creative' 
                          ? 'bg-bg-dark primary-glow-enhanced !border-primary-glow-enhanced button-glow' 
                          : 'text-muted hover:text-white/50 !hover:border-white/50'
                      }`}
                    >
                      {language === 'ar' ? 'إبداعي' : 'Creative'}
                    </button>
                  </div>
                </div>
                
                {/* Action Buttons on Right Side */}
                <div className="flex flex-wrap items-center gap-2 ml-4 pl-7 lg:mr-4">
                  <button 
                    onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                    className={`px-3 lg:px-4 py-1 lg:py-1.5 text-s rounded-full transition-all duration-300 border-2 flex items-center space-x-1 ${
                      webSearchEnabled 
                        ? ' bg-foreground/20 border-primary text-bold text-[#f5f5f5]' 
                        : 'border-border text-foreground  hover:!border-foreground/50'
                    }`}
                    title={language === 'ar' ? 'تفعيل البحث في الإنترنت' : 'Enable web search'}
                  >
                    <Search className='w-3 h-3' />
                    <span className="hidden lg:inline">
                      {webSearchEnabled 
                        ? (language === 'ar' ? 'بحث' : 'Search') 
                        : (language === 'ar' ? 'بحث' : 'Search')
                      }
                    </span>
                  </button>

                  <button 
                    onClick={() => enhancePromptOnly(inputMessage)}
                    disabled={!inputMessage.trim() || isEnhancingPrompt}
                    className="px-2 lg:px-3 py-1 lg:py-1.5 text-s rounded-full transition-all duration-300 border-2 border-border text-foreground/90  hover:!border-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    title={language === 'ar' ? 'تحسين البرومت' : 'Enhance prompt'}
                  >
                    {isEnhancingPrompt ? (
                      <Loader className='w-3 h-3 animate-spin' />
                    ) : (
                      <Zap className='w-3 h-3' />
                    )}
                    <span className="hidden lg:inline">
                      {isEnhancingPrompt
                        ? (language === 'ar' ? 'تحسين...' : 'Enhance...')
                        : (language === 'ar' ? 'تحسين' : 'Enhance')
                      }
                    </span>
                  </button>

                  <button 
                    onClick={() => translatePrompt(inputMessage)}
                    disabled={!inputMessage.trim() || isTranslating || !/[\u0600-\u06FF]/.test(inputMessage)}
                    className="px-2 lg:px-3 py-1 lg:py-2.5 text-s rounded-full transition-all duration-300 border-2 border-border text-foreground hover:text-foreground hover:!border-foreground/50  disabled:cursor-not-allowed flex items-center space-x-1"
                    title={language === 'ar' ? 'ترجمة للإنجليزية' : 'Translate to English'}
                  >
                    {isTranslating ? (
                      <Loader className='w-3 h-3 animate-spin' />
                    ) : (
                      <Globe className='w-3 h-3' />
                    )}
                    <span className="hidden lg:inline">
                      {isTranslating
                        ? (language === 'ar' ? 'ترجمة...' : 'Translate...')
                        : (language === 'ar' ? 'ترجمة' : 'Translate')
                      }
                    </span>
                  </button>

                  <button 
                    onClick={() => {
                      setShowAddServer(true);
                      refreshServers();
                    }}
                    className="px-2 lg:px-3 py-1 lg:py-1.5 text-s rounded-full transition-all duration-300 border-2 border-border text-foreground hover:text-foreground hover:!border-foreground/50 flex items-center space-x-1"
                    title={language === 'ar' ? 'إدارة خوادم MCP' : 'Manage MCP Servers'}
                  >
                    <Server className='w-3 h-3' />
                    <span className="hidden lg:inline">
                      {language === 'ar' ? 'MCP' : 'MCP'}
                    </span>
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row justify-end items-center mt-2 lg:mt-3 space-y-2 lg:space-y-0">
      
              </div>
            </div>
          </div>

          {/* Settings Modal */}
          {showSettings && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 lg:p-4">
              <div className="bg-background border border-border rounded-lg p-4 lg:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <h2 className="text-lg lg:text-xl font-semibold text-foreground">
                    {language === 'ar' ? 'الإعدادات' : 'Settings'}
                  </h2>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="p-2 hover:bg-bg-dark rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 lg:h-6 lg:w-6 text-muted" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                  {/* Chat Settings */}
                  <div className="space-y-4 lg:space-y-6">
                    <h3 className="text-base lg:text-lg font-medium text-foreground border-b border-border pb-2">
                      {language === 'ar' ? 'إعدادات المحادثة' : 'Chat Settings'}
                    </h3>
                    
                    <div className="space-y-3 lg:space-y-4">
                      <div>
                        <label className="block text-xs lg:text-sm font-medium text-foreground mb-2">
                          {language === 'ar' ? 'درجة الحرارة' : 'Temperature'}
                        </label>
                        <input 
                          type="range" 
                          min="0" 
                          max="2" 
                          step="0.1" 
                          defaultValue="0.7"
                          className="w-full"
                        />
                        <div className="text-xs text-muted mt-1">
                          {language === 'ar' ? 'يؤثر على إبداعية الردود' : 'Affects response creativity'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs lg:text-sm font-medium text-foreground mb-2">
                          {language === 'ar' ? 'الحد الأقصى للرموز' : 'Max Tokens'}
                        </label>
                        <input 
                          type="number" 
                          min="100" 
                          max="4000" 
                          defaultValue="2048"
                          className="w-full px-2 lg:px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm"
                        />
                      </div>

                      <div>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-xs lg:text-sm text-foreground">
                            {language === 'ar' ? 'حفظ المحادثات تلقائياً' : 'Auto-save conversations'}
                          </span>
                        </label>
                      </div>

                      <div>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-xs lg:text-sm text-foreground">
                            {language === 'ar' ? 'تفعيل الاختصارات' : 'Enable keyboard shortcuts'}
                          </span>
                        </label>
                      </div>

                      {/* Add Server Button */}
                      <div className="pt-2">
                        <button
                          onClick={() => setShowAddServer(true)}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary text-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-sm">
                            {language === 'ar' ? 'إضافة خادم' : 'Add Server'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Chat History */}
                  <div className="space-y-4 lg:space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base lg:text-lg font-medium text-foreground border-b border-border pb-2 flex-1">
                        {language === 'ar' ? 'تاريخ المحادثات' : 'Chat History'}
                      </h3>
                      <button
                        onClick={startNewChat}
                        className="ml-3 px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                      >
                        {language === 'ar' ? 'محادثة جديدة' : 'New Chat'}
                      </button>
                    </div>

                    <div className="space-y-2 lg:space-y-3 max-h-64 lg:max-h-80 overflow-y-auto">
                      {isLoadingChat ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader className="w-6 h-6 animate-spin text-muted" />
                          <span className="ml-2 text-muted text-sm">
                            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                          </span>
                        </div>
                      ) : chatHistory.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted opacity-50" />
                          <p className="text-muted text-xs lg:text-sm">
                            {language === 'ar' ? 'لا توجد محادثات محفوظة' : 'No chat history yet'}
                          </p>
                        </div>
                      ) : (
                        chatHistory.map((session) => (
                          <div 
                            key={session.id} 
                            className={`
                              bg-bg-dark border border-border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:bg-muted/50
                              ${currentChatSession?.id === session.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}
                            `}
                            onClick={() => {
                              loadChatSession(session.id);
                              setShowSettings(false);
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="text-xs lg:text-sm font-medium text-foreground truncate">
                                  {session.title || 'Untitled Chat'}
                                </div>
                                <div className="text-xs text-muted mt-1">
                                  {session.messageCount} {language === 'ar' ? 'رسالة' : 'messages'} • {new Date(session.updatedAt).toLocaleDateString(
                                    language === 'ar' ? 'ar-SA' : 'en-US',
                                    { 
                                      month: 'short', 
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    }
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center space-x-1 lg:space-x-2 ml-2">
                                {currentChatSession?.id === session.id && (
                                  <div className="w-2 h-2 bg-primary rounded-full" title={language === 'ar' ? 'محادثة نشطة' : 'Active chat'} />
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteChatSession(session.id);
                                  }}
                                  className="p-1 text-muted hover:text-red-500 transition-colors rounded opacity-60 hover:opacity-100"
                                  title={language === 'ar' ? 'حذف المحادثة' : 'Delete chat'}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col lg:flex-row justify-end space-y-2 lg:space-y-0 lg:space-x-3 mt-4 lg:mt-8 pt-4 lg:pt-6 border-t border-border">
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="w-full lg:w-auto px-3 lg:px-4 py-2 text-xs lg:text-sm bg-bg-dark border border-border rounded-lg hover:bg-bg-dark/80 transition-colors"
                  >
                    {language === 'ar' ? 'إغلاق' : 'Close'}
                  </button>
                  <button 
                    onClick={() => {
                      alert(language === 'ar' ? 'تم حفظ الإعدادات' : 'Settings saved');
                      setShowSettings(false);
                    }}
                    className="w-full lg:w-auto px-3 lg:px-4 py-2 text-xs lg:text-sm bg-primary text-background rounded-lg hover:bg-primary/80 transition-colors"
                  >
                    {language === 'ar' ? 'حفظ' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* Add Server Modal */}
          {showAddServer && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 lg:p-4">
              <div className="bg-background border border-border rounded-lg p-4 lg:p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <h3 className="text-base lg:text-lg font-semibold text-foreground">
                    {language === 'ar' ? 'إضافة خادم MCP جديد' : 'Add New MCP Server'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddServer(false);
                      setNewServerData({ name: '', command: '', args: [], env: {} });
                      setServerJsonInput('');
                    }}
                    className="p-2 text-muted hover:text-foreground rounded-full hover:bg-bg-dark transition-colors"
                  >
                    <X className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                </div>

                {/* Input Mode Toggle */}
                <div className="flex mb-4 lg:mb-6 bg-bg-dark rounded-lg p-1">
                  <button
                    onClick={() => setServerInputMode('form')}
                    className={`flex-1 px-3 lg:px-4 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors ${
                      serverInputMode === 'form'
                        ? 'bg-[#ce5d22] text-background'
                        : 'text-[#000]'
                    }`}
                  >
                    {language === 'ar' ? 'نموذج' : 'Form'}
                  </button>
                  <button
                    onClick={() => setServerInputMode('json')}
                    className={`flex-1 px-3 lg:px-4 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors ${
                      serverInputMode === 'json'
                        ? 'bg-[#ce5d22] text-background'
                        : 'text-[#000] '
                    }`}
                  >
                    JSON
                  </button>
                </div>

                {serverInputMode === 'form' ? (
                  <div className="space-y-3 lg:space-y-4">
                    {/* Server Name */}
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-foreground mb-2">
                        {language === 'ar' ? 'اسم الخادم' : 'Server Name'}
                      </label>
                      <input
                        type="text"
                        value={newServerData.name}
                        onChange={(e) => setNewServerData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-bg-dark border border-border rounded-lg px-3 py-2 text-foreground text-sm"
                        placeholder={language === 'ar' ? 'اسم الخادم' : 'Server name'}
                      />
                    </div>

                    {/* Command */}
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-foreground mb-2">
                        {language === 'ar' ? 'الأمر' : 'Command'}
                      </label>
                      <input
                        type="text"
                        value={newServerData.command}
                        onChange={(e) => setNewServerData(prev => ({ ...prev, command: e.target.value }))}
                        className="w-full bg-bg-dark border border-border rounded-lg px-3 py-2 text-foreground text-sm"
                        placeholder={language === 'ar' ? 'مسار الأمر' : 'Command path'}
                      />
                    </div>

                    {/* Arguments */}
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-foreground mb-2">
                        {language === 'ar' ? 'المعاملات' : 'Arguments'}
                      </label>
                      <div className="space-y-2">
                        {newServerData.args && newServerData.args.map((arg, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={arg}
                              onChange={(e) => handleUpdateArg(index, e.target.value)}
                              className="flex-1 bg-bg-dark border border-border rounded-lg px-3 py-2 text-foreground text-sm"
                              placeholder={`${language === 'ar' ? 'معامل' : 'Argument'} ${index + 1}`}
                            />
                            <button
                              onClick={() => handleRemoveArg(index)}
                              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                            >
                              <X className="w-3 h-3 lg:w-4 lg:h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={handleAddArg}
                          className="flex items-center space-x-2 text-primary hover:text-primary/80 text-sm transition-colors"
                        >
                          <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
                          <span>{language === 'ar' ? 'إضافة معامل' : 'Add Argument'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-foreground mb-2">
                      {language === 'ar' ? 'تكوين JSON' : 'JSON Configuration'}
                    </label>
                    <textarea
                      value={serverJsonInput}
                      onChange={(e) => setServerJsonInput(e.target.value)}
                      className="w-full h-32 lg:h-40 bg-black border border-border rounded-lg px-3 py-2 text-foreground font-mono text-xs lg:text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder={`{
  "name": "my-server",
  "command": "node",
  "args": ["server.js"],
  "env": {
    "NODE_ENV": "production"
  }
}`}
                    />
                  </div>
                )}

                {/* Actions - Made more prominent */}
                <div className="flex flex-col lg:flex-row justify-end space-y-2 lg:space-y-0 lg:space-x-3 mt-4 lg:mt-6 pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      setShowAddServer(false);
                      setNewServerData({ name: '', command: '', args: [], env: {} });
                      setServerJsonInput('');
                    }}
                    className="w-full lg:w-auto px-3 lg:px-4 py-2 text-xs lg:text-sm bg-bg-dark border border-border rounded-lg hover:bg-bg-dark/80 transition-colors"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleCreateNewServer}
                    disabled={serverInputMode === 'form' 
                      ? !newServerData.name || !newServerData.command
                      : !serverJsonInput.trim()
                    }
                    className="w-full lg:w-auto px-6 py-3 bg-[#ce5d22] text-[#000] border-3 font-semibold rounded-lg hover:bg-[#000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg text-sm lg:text-base"
                  >
                    {language === 'ar' ? 'حفظ الخادم 💾' : 'Save Server 💾'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Image Generator Modal */}
          {showImageGenerator && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-background border border-border rounded-xl p-6 max-w-md w-full space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {language === 'ar' ? 'توليد صورة بالذكاء الاصطناعي' : 'AI Image Generation'}
                  </h3>
                  <button
                    onClick={() => setShowImageGenerator(false)}
                    className="p-1 hover:bg-bg-dark rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-medium">
                    {language === 'ar' ? 'وصف الصورة' : 'Image Description'}
                  </label>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder={language === 'ar' 
                      ? 'اكتب وصفاً للصورة التي تريد توليدها...' 
                      : 'Describe the image you want to generate...'}
                    className="w-full bg-bg-dark border border-border rounded-lg px-3 py-2 text-foreground text-sm min-h-[100px] resize-none"
                    rows={4}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowImageGenerator(false)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-bg-dark transition-colors"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const result = await generateImage(imagePrompt);
                        
                        if (result.success && result.image) {
                          // صورة فعلية من Hugging Face
                          const imageMessage: ChatMessage = {
                            id: genId(),
                            role: 'assistant',
                            content: `![Generated Image](${result.image})

**${language === 'ar' ? 'تم توليد الصورة بنجاح' : 'Image generated successfully'}** ✨

**${language === 'ar' ? 'النموذج' : 'Model'}:** ${result.model}
**${language === 'ar' ? 'المزود' : 'Provider'}:** ${result.provider}${result.enhanced ? `
**${language === 'ar' ? 'تم تحسين الوصف بواسطة' : 'Description enhanced by'}:** ${result.descriptionModel}` : ''}

${result.gptDescription ? `**${language === 'ar' ? 'الوصف المحسن' : 'Enhanced Description'}:** ${result.gptDescription}` : ''}`,
                            timestamp: new Date().toISOString(),
                            model: result.model
                          };
                          
                          setMessages(prev => [...prev, imageMessage]);
                          setImagePrompt('');
                          setShowImageGenerator(false);
                          
                        } else if (result.type === 'text' && result.text) {
                          // وصف نصي من GPTGOD (fallback)
                          const textMessage: ChatMessage = {
                            id: genId(),
                            role: 'assistant', 
                            content: `**${language === 'ar' ? 'وصف الصورة المطلوبة' : 'Image Description'}** 🎨

${result.text}

---
**${language === 'ar' ? 'النموذج' : 'Model'}:** ${result.model}
**${language === 'ar' ? 'المزود' : 'Provider'}:** ${result.provider}

${result.message ? `⚠️ ${result.message}` : ''}`,
                            timestamp: new Date().toISOString(),
                            model: result.model
                          };
                          
                          setMessages(prev => [...prev, textMessage]);
                          setImagePrompt('');
                          setShowImageGenerator(false);
                        }
                        
                      } catch (error: any) {
                        setError(error.message || (language === 'ar' ? 'فشل في توليد الصورة' : 'Failed to generate image'));
                      }
                    }}
                    disabled={!imagePrompt.trim() || isGeneratingImage}
                    className="flex-1 px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isGeneratingImage ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>{language === 'ar' ? 'جاري التوليد...' : 'Generating...'}</span>
                      </>
                    ) : (
                      <span>{language === 'ar' ? 'توليد الصورة' : 'Generate Image'}</span>
                    )}
                  </button>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {language === 'ar' 
                    ? 'يتم استخدام نموذج FLUX.1-dev من Hugging Face'
                    : 'Using FLUX.1-dev model from Hugging Face'}
                </div>
              </div>
            </div>
          )}

          {/* Fullscreen Image Modal */}
          {fullscreenImage && (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[100]">
              {/* Close Button */}
              <button
                onClick={closeFullscreenImage}
                className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                title={language === 'ar' ? 'إغلاق' : 'Close'}
              >
                <X className="w-6 h-6" />
              </button>

              {/* Download Button */}
              <button
                onClick={() => downloadImageFile(fullscreenImage.url, `image-${fullscreenImage.index + 1}.jpg`)}
                className="absolute top-4 left-4 z-50 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                title={language === 'ar' ? 'تحميل الصورة' : 'Download image'}
              >
                <Download className="w-6 h-6" />
              </button>

              {/* Image Counter */}
              {imagePreviewUrls.length > 1 && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-black/50 text-white rounded-full text-sm">
                  {fullscreenImage.index + 1} / {imagePreviewUrls.length}
                </div>
              )}

              {/* Navigation Arrows */}
              {imagePreviewUrls.length > 1 && (
                <>
                  <button
                    onClick={() => navigateFullscreenImage('prev')}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                    title={language === 'ar' ? 'الصورة السابقة' : 'Previous image'}
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button
                    onClick={() => navigateFullscreenImage('next')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                    title={language === 'ar' ? 'الصورة التالية' : 'Next image'}
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}

              {/* Main Image */}
              <div className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center">
                <img
                  src={fullscreenImage.url}
                  alt={`Fullscreen ${fullscreenImage.index + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Click outside to close */}
              <div
                className="absolute inset-0 -z-10"
                onClick={closeFullscreenImage}
              />

              {/* Keyboard Navigation Info */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-black/50 text-white rounded-full text-xs text-center">
                {language === 'ar' 
                  ? 'استخدم الأسهم أو اضغط ESC للإغلاق'
                  : 'Use arrow keys or press ESC to close'
                }
              </div>
            </div>
          )}

          {/* HTML Preview now opens in new browser tab */}

        </div>
      </div>

      {/* Image Modal */}
      {imageModal.isOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50" onClick={closeImageModal}>
          
          {/* Floating Control Buttons */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-60 pointer-events-none">
            {/* Download Button */}
            <button
              onClick={() => downloadImageFile(imageModal.src, 'generated-image.png')}
              className="flex items-center space-x-2 bg-bg-dark/50 border-3 !border-muted hover:bg-green-700 hover:text-background backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg pointer-events-auto"
              title={language === 'ar' ? 'تحميل الصورة' : 'Download Image'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">{language === 'ar' ? 'تحميل' : 'Download'}</span>
            </button>
            
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="flex items-center justify-center w-12 h-12 bg-red-600/90 hover:bg-red-700 backdrop-blur-sm text-white rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg pointer-events-auto"
              title={language === 'ar' ? 'إغلاق' : 'Close'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Full Screen Image Container */}
          <div className="w-full h-full flex items-center justify-center p-4">
            <div className="max-w-full max-h-full overflow-auto">
              <img 
                src={imageModal.src}
                alt="Generated Image"
                className="max-w-none h-auto rounded-lg shadow-2xl"
                style={{ 
                  maxHeight: 'calc(100vh - 8rem)',
                  minHeight: '200px',
                  objectFit: 'contain'
                }}
                onClick={(e) => e.stopPropagation()}
                onLoad={() => console.log('🖼️ Modal image loaded')}
              />
            </div>
          </div>

          {/* Floating Footer Info */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-none">
            <p className="text-gray-300 text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
              {language === 'ar' ? 'عجلة الماوس للتكبير • ESC أو اضغط خارج الصورة للإغلاق' : 'Mouse wheel to zoom • ESC or click outside to close'}
            </p>
          </div>
        </div>
      )}

   
    </Layout>
  );
};

export default PromptsPage;
