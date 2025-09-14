import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Play, Download, Eye, EyeOff, Terminal, FileCode, Table, MessageSquare, Send, Maximize2, Minimize2 } from 'lucide-react';
import { getAIGateway, ChatMessage } from '@/lib/api';
import { AIModel } from '@/lib/models';

// Enhanced Code Block Component - Modern dark design with beautiful syntax highlighting
const CodeBlock = ({ code, language, title, fileName, executable = false }: {
  code: string;
  language: string;
  title?: string;
  fileName?: string;
  executable?: boolean;
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');
  const shouldTruncate = lines.length > 15;
  
  // Language display name with icons
  const getLanguageDisplayName = (lang: string) => {
    const langMap: Record<string, { name: string; icon: string; color: string }> = {
      javascript: { name: 'JavaScript', icon: '⚡', color: '#f7df1e' },
      jsx: { name: 'React JSX', icon: '⚛️', color: '#61dafb' },
      tsx: { name: 'React TSX', icon: '⚛️', color: '#61dafb' },
      typescript: { name: 'TypeScript', icon: '🔷', color: '#3178c6' },
      json: { name: 'JSON', icon: '📄', color: '#00d2ff' },
      csv: { name: 'CSV', icon: '📊', color: '#00c851' },
      md: { name: 'Markdown', icon: '📝', color: '#083fa1' },
      go: { name: 'Go', icon: '🐹', color: '#00add8' },
      java: { name: 'Java', icon: '☕', color: '#ed8b00' },
      kotlin: { name: 'Kotlin', icon: '🏹', color: '#7f52ff' },
      ruby: { name: 'Ruby', icon: '💎', color: '#cc342d' },
      php: { name: 'PHP', icon: '🐘', color: '#777bb4' },
      swift: { name: 'Swift', icon: '🦉', color: '#fa7343' },
      rust: { name: 'Rust', icon: '🦀', color: '#ce422b' },
      perl: { name: 'Perl', icon: '🐪', color: '#39457e' },
      scala: { name: 'Scala', icon: '🏗️', color: '#dc322f' },
      groovy: { name: 'Groovy', icon: '🎶', color: '#4298b8' },
      python: { name: 'Python', icon: '🐍', color: '#3776ab' },
      html: { name: 'HTML', icon: '🌐', color: '#e34c26' },
      css: { name: 'CSS', icon: '🎨', color: '#1572b6' },
      bash: { name: 'Bash', icon: '💻', color: '#4eaa25' },
      shell: { name: 'Shell', icon: '🖥️', color: '#89e051' },
      sql: { name: 'SQL', icon: '🗃️', color: '#336791' },
      yaml: { name: 'YAML', icon: '⚙️', color: '#cb171e' },
      xml: { name: 'XML', icon: '📋', color: '#005a9c' }
    };
    
    const langInfo = langMap[lang.toLowerCase()];
    return langInfo || { name: lang.toUpperCase(), icon: '📄', color: '#888' };
  };

  const langInfo = getLanguageDisplayName(language);

  return (
    <div className={`relative group my-6 rounded-lg overflow-hidden bg-[#212121] border border-gray-800 shadow-2xl ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      {/* Header - Beautiful modern design */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          {/* Language indicator with icon and color */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
              <span className="text-sm">{langInfo.icon}</span>
              <FileCode className="w-4 h-4" style={{ color: langInfo.color }} />
              <span className="text-sm font-medium text-gray-200">
                {langInfo.name}
              </span>
            </div>
            {lines.length > 1 && (
              <div className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded border border-gray-700">
                {lines.length} lines
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105"
              title={isExpanded ? "إخفاء | Hide" : "عرض الكامل | Expand"}
            >
              {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105"
            title={isFullscreen ? "تصغير | Minimize" : "ملء الشاشة | Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          
          <button
            onClick={copyCode}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105"
            title="نسخ الكود | Copy Code"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Code Content - Pure black background with enhanced highlighting */}
      <div className={`relative bg-[#212121] ${shouldTruncate && !isExpanded && !isFullscreen ? 'max-h-96' : ''} overflow-auto`}>
        <pre className="p-5 text-sm font-mono leading-relaxed">
          <code>
            {lines.map((line, index) => (
              <div key={index} className="flex items-start hover:bg-gray-900/30 transition-colors duration-150 group/line">
                <span className="text-gray-600 text-xs mr-4 mt-0.5 select-none min-w-[3rem] text-right font-medium group-hover/line:text-gray-500">
                  {String(index + 1).padStart(3, ' ')}
                </span>
                <span className="flex-1 text-gray-100" dangerouslySetInnerHTML={{ 
                  __html: highlightSyntax(line, language) 
                }} />
              </div>
            ))}
          </code>
        </pre>
        
        {copied && (
          <div className="absolute top-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium animate-pulse shadow-lg">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>{language === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
            </div>
          </div>
        )}
        
        {shouldTruncate && !isExpanded && !isFullscreen && (
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black via-black/95 to-transparent flex items-end justify-center pb-4">
            <button
              onClick={() => setIsExpanded(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm rounded-lg transition-all duration-200 shadow-lg transform hover:scale-105 font-medium"
            >
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>عرض {lines.length - 15} سطر إضافي | Show {lines.length - 15} more lines</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced syntax highlighting with more vibrant colors
const highlightSyntax = (line: string, language: string): string => {
  let highlighted = line;
  
  // Escape HTML entities first
  highlighted = highlighted
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  const patterns = {
    json: [
      // Property names (keys) - bright cyan
      { pattern: /"([^"]+)":/g, replacement: '<span style="color: #00d4ff; font-weight: 500">"$1"</span>:' },
      // String values - warm yellow
      { pattern: /:\s*"([^"]*)"/g, replacement: ': <span style="color: #ffd700">"$1"</span>' },
      // Numbers - bright green
      { pattern: /:\s*(\d+\.?\d*)/g, replacement: ': <span style="color: #00ff88; font-weight: 500">$1</span>' },
      // Booleans and null - purple
      { pattern: /:\s*(true|false|null)/g, replacement: ': <span style="color: #c792ea; font-weight: 500">$1</span>' },
      // Brackets and braces - golden
      { pattern: /([{}[\],])/g, replacement: '<span style="color: #ffb86c; font-weight: bold">$1</span>' },
    ],
    javascript: [
      // Keywords - bright blue
      { pattern: /\b(const|let|var|function|return|if|else|for|while|import|export|class|extends|async|await|try|catch|finally|throw|new|this|super)\b/g, replacement: '<span style="color: #82aaff; font-weight: 600">$1</span>' },
      // Strings - warm green
      { pattern: /"([^"]*)"/g, replacement: '<span style="color: #c3e88d">"$1"</span>' },
      { pattern: /'([^']*)'/g, replacement: '<span style="color: #c3e88d">\'$1\'</span>' },
      { pattern: /`([^`]*)`/g, replacement: '<span style="color: #c3e88d">`$1`</span>' },
      // Comments - soft gray
      { pattern: /\/\/(.*)/g, replacement: '<span style="color: #546e7a; font-style: italic">//$1</span>' },
      { pattern: /\/\*([\s\S]*?)\*\//g, replacement: '<span style="color: #546e7a; font-style: italic">/*$1*/</span>' },
      // Numbers - bright orange
      { pattern: /\b(\d+\.?\d*)\b/g, replacement: '<span style="color: #f78c6c; font-weight: 500">$1</span>' },
      // Functions - yellow
      { pattern: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, replacement: '<span style="color: #ffcb6b; font-weight: 500">$1</span>(' },
      // Operators - pink
      { pattern: /([+\-*/%=<>!&|]+)/g, replacement: '<span style="color: #ff5370; font-weight: 500">$1</span>' },
    ],
    typescript: [
      // TypeScript specific keywords - purple
      { pattern: /\b(interface|type|enum|namespace|declare|abstract|implements|public|private|protected|readonly|static)\b/g, replacement: '<span style="color: #c792ea; font-weight: 600">$1</span>' },
      // Regular keywords - bright blue
      { pattern: /\b(const|let|var|function|return|if|else|for|while|import|export|class|extends|async|await|try|catch|finally|throw|new|this|super)\b/g, replacement: '<span style="color: #82aaff; font-weight: 600">$1</span>' },
      // Strings - warm green
      { pattern: /"([^"]*)"/g, replacement: '<span style="color: #c3e88d">"$1"</span>' },
      { pattern: /'([^']*)'/g, replacement: '<span style="color: #c3e88d">\'$1\'</span>' },
      // Comments - soft gray
      { pattern: /\/\/(.*)/g, replacement: '<span style="color: #546e7a; font-style: italic">//$1</span>' },
      // Numbers - bright orange
      { pattern: /\b(\d+\.?\d*)\b/g, replacement: '<span style="color: #f78c6c; font-weight: 500">$1</span>' },
      // Types - cyan
      { pattern: /:\s*([A-Z][a-zA-Z0-9_<>|\[\]]*)/g, replacement: ': <span style="color: #89ddff; font-weight: 500">$1</span>' },
    ],
    python: [
      // Keywords - purple
      { pattern: /\b(def|class|import|from|if|else|elif|for|while|try|except|finally|with|as|return|yield|lambda|and|or|not|in|is|None|True|False)\b/g, replacement: '<span style="color: #c792ea; font-weight: 600">$1</span>' },
      // Strings - warm green
      { pattern: /"([^"]*)"/g, replacement: '<span style="color: #c3e88d">"$1"</span>' },
      { pattern: /'([^']*)'/g, replacement: '<span style="color: #c3e88d">\'$1\'</span>' },
      // Comments - soft gray
      { pattern: /#(.*)/g, replacement: '<span style="color: #546e7a; font-style: italic">#$1</span>' },
      // Numbers - bright orange
      { pattern: /\b(\d+\.?\d*)\b/g, replacement: '<span style="color: #f78c6c; font-weight: 500">$1</span>' },
      // Functions - yellow
      { pattern: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, replacement: '<span style="color: #ffcb6b; font-weight: 500">$1</span>(' },
    ],
    css: [
      // Properties - cyan
      { pattern: /([a-zA-Z-]+)\s*:/g, replacement: '<span style="color: #89ddff; font-weight: 500">$1</span>:' },
      // Values - warm yellow
      { pattern: /:\s*([^;{}]+)/g, replacement: ': <span style="color: #ffcb6b">$1</span>' },
      // Selectors - orange
      { pattern: /^([.#]?[a-zA-Z-_]+)/g, replacement: '<span style="color: #f78c6c; font-weight: 500">$1</span>' },
      // Comments - soft gray
      { pattern: /\/\*([\s\S]*?)\*\//g, replacement: '<span style="color: #546e7a; font-style: italic">/*$1*/</span>' },
    ]
  };

  const langPatterns = patterns[language as keyof typeof patterns] || patterns.javascript;
  langPatterns.forEach(({ pattern, replacement }) => {
    highlighted = highlighted.replace(pattern, replacement);
  });

  return highlighted;
};

// Responsive Table Component
const ResponsiveTable = ({ data, headers, title }: {
  data: any[];
  headers: string[];
  title?: string;
}) => {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedData = React.useMemo(() => {
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

  const paginatedData = React.useMemo(() => {
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
            <Table className="w-5 h-5 text-[#3c3c3c]" />
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
                      <span className="text-[#3c3c3c]">
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
              عرض {((currentPage - 1) * itemsPerPage) + 1} إلى {Math.min(currentPage * itemsPerPage, sortedData.length)} من {sortedData.length} عنصر
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded text-sm transition-colors"
              >
                السابق
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + Math.max(1, currentPage - 2);
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      page === currentPage 
                        ? 'bg-[#3c3c3c] text-white' 
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
                التالي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Markdown Renderer with responsive design
const MarkdownRenderer = ({ content }: { content: string }) => {
  const parseMarkdown = (text: string) => {
    let parsed = text;

    // Headers with responsive design
    parsed = parsed.replace(/^### (.*$)/gim, '<h3 class="text-lg md:text-xl font-semibold text-white mt-6 mb-3 flex items-center"><span class="w-1 h-5 bg-blue-500 rounded mr-3"></span>$1</h3>');
    parsed = parsed.replace(/^## (.*$)/gim, '<h2 class="text-xl md:text-2xl font-bold text-white mt-8 mb-4 flex items-center"><span class="w-1 h-6 bg-purple-500 rounded mr-3"></span>$1</h2>');
    parsed = parsed.replace(/^# (.*$)/gim, '<h1 class="text-2xl md:text-3xl font-bold text-white mt-8 mb-6 flex items-center"><span class="w-1 h-7 bg-blue-600 rounded mr-3"></span>$1</h1>');

    // Responsive text formatting
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-blue-300">$1</strong>');
    parsed = parsed.replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>');

    // Inline code with responsive padding
    parsed = parsed.replace(/`([^`]+)`/g, '<code class="bg-gray-900 text-cyan-400 px-2 py-1 rounded text-sm font-mono border border-gray-700 break-all">$1</code>');

    // Responsive lists
    parsed = parsed.replace(/^\* (.*$)/gim, '<li class="flex items-start mb-2"><span class="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span><span class="break-words">$1</span></li>');
    parsed = parsed.replace(/^- (.*$)/gim, '<li class="flex items-start mb-2"><span class="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span><span class="break-words">$1</span></li>');

    parsed = parsed.replace(/(<li.*?<\/li>(\n<li.*?<\/li>)*)/g, '<ul class="space-y-1 my-4">$1</ul>');

    // Responsive links
    parsed = parsed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline transition-colors break-all" target="_blank" rel="noopener noreferrer">$1</a>');

    // Responsive paragraphs
    parsed = parsed.replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed break-words">');
    parsed = `<p class="mb-4 leading-relaxed break-words">${parsed}</p>`;

    return parsed;
  };

  return (
    <div 
      className="prose prose-invert max-w-none text-sm md:text-base"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
};

// Enhanced Message interface
interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  codeBlocks?: {
    language: string;
    code: string;
    fileName?: string;
    executable?: boolean;
  }[];
  tableData?: {
    headers: string[];
    data: any[];
  };
  // MCP related properties
  mcpUsed?: boolean;
  thinkingSteps?: {
    step: number;
    thought: string;
    currentStep?: any;
    recommendedTools?: any[];
  }[];
}

// Main Chat Component
const ResponsiveAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel] = useState<AIModel>({
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'GPTGOD0',
    description: 'إصدار مضغوط من GPT-4o، أسرع وأكثر كفاءة للمهام البسيطة',
    contextLength: 128000,
    pricing: { input: 'Via GPTGOD', output: 'Via GPTGOD' },
    capabilities: ['fast', 'efficient', 'general_purpose', 'cost_effective'],
    type: 'free'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      // استخدام MCP endpoint الجديد | Use new MCP endpoint
      const response = await fetch('/api/chat/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          model: selectedModel,
          useSequentialThinking: true,
          maxThinkingSteps: 5
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Unknown error occurred');
      }

      // Parse response for markdown, code blocks, and tables
      const parsedResponse = parseResponseContent(data.message);
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: parsedResponse.content,
        timestamp: new Date(),
        codeBlocks: parsedResponse.codeBlocks,
        tableData: parsedResponse.tableData,
        // إضافة معلومات MCP | Add MCP information
        mcpUsed: data.mcpUsed,
        thinkingSteps: data.thinkingSteps
      };

      setMessages(prev => [...prev, assistantMessage]);

      // عرض رسالة تأكيد إذا تم استخدام MCP | Show confirmation if MCP was used
      if (data.mcpUsed && data.thinkingSteps?.length > 0) {
        console.log(`✅ MCP Sequential Thinking used with ${data.thinkingSteps.length} steps`);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'عذراً، حدث خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى.\n\nSorry, there was an error sending the message. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Parse response content for enhanced features
  const parseResponseContent = (content: string) => {
    const codeBlocks: any[] = [];
    let tableData: any = undefined;

    // Extract code blocks with improved parsing
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1] || 'text';
      const code = match[2].trim();
      if (code) {
        codeBlocks.push({
          language: language.toLowerCase(),
          code: code,
          executable: ['javascript', 'typescript', 'python', 'bash', 'shell'].includes(language.toLowerCase())
        });
      }
    }

    // Extract tables (basic markdown table detection)
    const tableRegex = /\|(.+)\|\n\|[-\s|]+\|\n((\|.+\|\n?)+)/g;
    const tableMatch = tableRegex.exec(content);
    if (tableMatch) {
      const headers = tableMatch[1].split('|').map(h => h.trim()).filter(h => h);
      const rows = tableMatch[2].split('\n').filter(row => row.trim())
        .map(row => {
          const cells = row.split('|').map(c => c.trim()).filter(c => c);
          const rowObj: any = {};
          headers.forEach((header, index) => {
            rowObj[header] = cells[index] || '';
          });
          return rowObj;
        });
      
      if (headers.length > 0 && rows.length > 0) {
        tableData = { headers, data: rows };
      }
    }

    // Remove code blocks from content for markdown parsing but keep placeholder
    let cleanContent = content.replace(/```[\s\S]*?```/g, '\n\n[كتلة كود | Code Block]\n\n');
    
    return {
      content: cleanContent,
      codeBlocks: codeBlocks.length > 0 ? codeBlocks : undefined,
      tableData
    };
  };

  return (
    <div className="flex flex-col h-screen bg-[#212121] text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-[#3c3c3c]" />
            <h1 className="text-lg font-semibold">مساعد AI متجاوب</h1>
          </div>
          <div className="text-sm text-gray-400">
            جداول ذكية • كود ملون • تصميم متجاوب
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">مرحباً بك في مساعد AI الذكي</h3>
            <p className="text-sm">اكتب رسالتك وسأساعدك بردود مفصلة مع دعم المارك داون والكود</p>
            <p className="text-xs mt-2 opacity-75">Welcome to the Smart AI Assistant</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-full ${message.role === 'user' ? 'max-w-xs md:max-w-md lg:max-w-lg' : 'max-w-full'} ${
              message.role === 'user' 
                ? 'bg-[#3c3c3c] text-white rounded-lg p-4' 
                : 'bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl w-full'
            }`}>
              
              {message.role === 'assistant' ? (
                <div>
                  <MarkdownRenderer content={message.content} />
                  
                  {/* Code Blocks */}
                  {message.codeBlocks?.map((block, index) => (
                    <CodeBlock
                      key={index}
                      code={block.code}
                      language={block.language}
                      fileName={block.fileName}
                      executable={block.executable}
                    />
                  ))}
                  
                  {/* Table */}
                  {message.tableData && (
                    <ResponsiveTable
                      data={message.tableData.data}
                      headers={message.tableData.headers}
                      title="مقارنة خدمات البحث"
                    />
                  )}
                </div>
              ) : (
                <p className="break-words">{message.content}</p>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3c3c3c]"></div>
                <div className="text-gray-300">
                  <p className="text-sm">يفكر المساعد الذكي...</p>
                  <p className="text-xs opacity-75">AI is thinking...</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="اكتب رسالتك..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#3c3c3c] focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            className="bg-[#3c3c3c] hover:bg-[#4a4a4a] text-white p-3 rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveAIChat;
