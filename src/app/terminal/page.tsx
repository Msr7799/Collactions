'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';
import { Terminal, X, Minimize2, Maximize2, Copy } from 'lucide-react';
import { chatStorage, ChatSession } from '../prompts/chatStorage';
// MCP operations now handled via API routes

interface Command {
  input: string;
  output: string;
  timestamp: Date;
}

const TerminalPage: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { language } = useLanguage();
  const [commands, setCommands] = useState<Command[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [currentPath, setCurrentPath] = useState('~');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isNanoMode, setIsNanoMode] = useState(false);
  const [nanoFile, setNanoFile] = useState({ name: '', content: '', isNew: false });
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Early return if user is not loaded yet
  if (!isLoaded) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading terminal...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600">Please sign in to access the terminal.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Available commands for tab completion
  const availableCommands = ['help', 'clear', 'pwd', 'ls', 'cd', 'chat', 'mcp', 'whoami', 'date', 'nano'];
  const chatSubCommands = ['list', 'view', 'delete'];
  const mcpSubCommands = ['list', 'status', 'enable', 'disable'];

  // Available paths in the real system
  const availablePaths = ['~', '~/chats', '~/mcp', '~/prompts', '~/documents'];

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Auto scroll to bottom when new commands are added
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [commands]);

  // Initialize terminal with welcome message
  useEffect(() => {
    if (user) {
      const welcomeCommand: Command = {
        input: '',
        output: getWelcomeMessage(),
        timestamp: new Date()
      };
      setCommands([welcomeCommand]);
    }
  }, [user, language]);

  const getWelcomeMessage = (): string => {
    const userEmail = user?.emailAddresses[0]?.emailAddress || 'user';
    return language === 'ar' ? 
      `🏠 مرحباً بك ${userEmail} في تيرمينال Collaction الشخصي!

📁 المجلدات المتاحة:
  ~/chats     - إدارة المحادثات المحفوظة
  ~/mcp       - إعدادات خوادم MCP
  ~/prompts   - ملفات المقترحات
  ~/documents - المستندات الشخصية

📋 الأوامر المتاحة:
  ls          - عرض محتويات المجلد
  cd <path>   - تغيير المجلد
  pwd         - عرض المجلد الحالي
  chat        - إدارة المحادثات
  mcp         - إدارة خوادم MCP
  help        - عرض المساعدة
  clear       - مسح الشاشة

⚠️  ملاحظة أمنية: يمكنك الوصول فقط لبياناتك الشخصية` :
      `🏠 Welcome ${userEmail} to your Collaction Personal Terminal!

📁 Available Directories:
  ~/chats     - Manage saved conversations  
  ~/mcp       - MCP server settings
  ~/prompts   - Prompt files
  ~/documents - Personal documents

📋 Available Commands:
  ls          - List directory contents
  cd <path>   - Change directory
  pwd         - Print working directory
  chat        - Manage conversations
  mcp         - Manage MCP servers
  help        - Show help
  clear       - Clear screen

⚠️  Security Note: You can only access your personal data`;
  };

  // Execute terminal commands with real API integration
  const executeCommand = async (cmd: string): Promise<string> => {
    const parts = cmd.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    try {
      switch (command) {
        case 'help':
          return getHelpText();
          
        case 'clear':
          setCommands([]);
          return '';
          
        case 'pwd':
          return currentPath;
          
        case 'ls':
          return await handleLsCommand(args);
          
        case 'cd':
          return handleCdCommand(args);
          
        case 'chat':
          return await handleChatCommand(args);
          
        case 'mcp':
          return await handleMcpCommand(args);
          
        case 'whoami':
          return user?.emailAddresses[0]?.emailAddress || 'user';
          
        case 'date':
          return new Date().toLocaleString();
          
        case 'nano':
          return await handleNanoCommand(args);
          
        default:
          return language === 'ar' ? 
            `الأمر "${command}" غير موجود. اكتب "help" للمساعدة` :
            `Command "${command}" not found. Type "help" for assistance`;
      }
    } catch (error) {
      console.error('Command execution error:', error);
      return language === 'ar' ? 
        `خطأ في تنفيذ الأمر: ${error instanceof Error ? error.message : 'خطأ غير معروف'}` :
        `Command execution error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  };

  const getHelpText = (): string => {
    return language === 'ar' ? 
      `📖 مساعدة التيرمينال:

🔧 أوامر النظام:
  help        - عرض هذه المساعدة
  clear       - مسح الشاشة
  pwd         - عرض المجلد الحالي
  cd <path>   - تغيير المجلد
  ls [path]   - عرض محتويات المجلد
  whoami      - عرض المستخدم الحالي
  date        - عرض التاريخ والوقت

💬 أوامر المحادثات:
  chat list          - عرض جميع المحادثات
  chat view <file>   - عرض محادثة محددة
  chat delete <file> - حذف محادثة

🔌 أوامر MCP:
  mcp list           - عرض خوادم MCP
  mcp status <name>  - حالة خادم محدد
  mcp enable <name>  - تفعيل خادم
  mcp disable <name> - إلغاء تفعيل خادم

📝 أوامر التحرير:
  nano <file>        - فتح محرر النصوص` :
      `📖 Terminal Help:

🔧 System Commands:
  help        - Show this help
  clear       - Clear screen
  pwd         - Print working directory
  cd <path>   - Change directory
  ls [path]   - List directory contents
  whoami      - Show current user
  date        - Show date and time

💬 Chat Commands:
  chat list          - List all conversations
  chat view <file>   - View specific conversation
  chat delete <file> - Delete conversation

🔌 MCP Commands:
  mcp list           - List MCP servers
  mcp status <name>  - Show server status
  mcp enable <name>  - Enable server
  mcp disable <name> - Disable server

📝 Editor Commands:
  nano <file>        - Open text editor`;
  };

  const handleLsCommand = async (args: string[]): Promise<string> => {
    const targetPath = args[0] || currentPath;
    
    try {
      switch (targetPath) {
        case '~':
        case '~/':
          return language === 'ar' ? 
            `📁 محتويات المجلد الرئيسي:\n\nchats/      💬 المحادثات المحفوظة\nmcp/        🔌 إعدادات خوادم MCP\nprompts/    📝 ملفات المقترحات\ndocuments/  📄 المستندات الشخصية` :
            `📁 Home directory contents:\n\nchats/      💬 Saved conversations\nmcp/        🔌 MCP server settings\nprompts/    📝 Prompt files\ndocuments/  📄 Personal documents`;
            
        case '~/chats':
          return await listChatFiles();
          
        case '~/mcp':
          return await listMcpFiles();
          
        case '~/prompts':
          return language === 'ar' ? 
            `📁 مجلد المقترحات:\n\nchat/       📁 ملفات المحادثات\nREADME.md   📄 معلومات المجلد` :
            `📁 Prompts directory:\n\nchat/       📁 Chat files\nREADME.md   📄 Directory info`;
            
        case '~/documents':
          return language === 'ar' ? 
            `📁 المستندات الشخصية:\n\nREADME.md   📄 معلومات المستخدم` :
            `📁 Personal documents:\n\nREADME.md   📄 User information`;
            
        default:
          return language === 'ar' ? 
            `المجلد "${targetPath}" غير موجود` :
            `Directory "${targetPath}" not found`;
      }
    } catch (error) {
      return language === 'ar' ? 
        `خطأ في قراءة المجلد: ${error instanceof Error ? error.message : 'خطأ غير معروف'}` :
        `Error reading directory: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  };

  const listChatFiles = async (): Promise<string> => {
    try {
      const sessions = await chatStorage.getAllSessions();
      if (sessions.length === 0) {
        return language === 'ar' ? 
          '📁 مجلد المحادثات فارغ\n\nلا توجد محادثات محفوظة' :
          '📁 Chats directory is empty\n\nNo saved conversations';
      }
      
      const fileList = sessions.map((session: ChatSession) => {
        const date = new Date(session.createdAt).toLocaleDateString();
        const size = `${Math.round(JSON.stringify(session).length / 1024)}KB`;
        return `${session.filename.padEnd(30)} ${date.padEnd(12)} ${size.padEnd(8)} ${session.messages.length} msgs`;
      }).join('\n');
      
      return language === 'ar' ? 
        `📁 المحادثات المحفوظة (${sessions.length}):\n\n${'الملف'.padEnd(30)} ${'التاريخ'.padEnd(12)} ${'الحجم'.padEnd(8)} الرسائل\n${'-'.repeat(70)}\n${fileList}` :
        `📁 Saved conversations (${sessions.length}):\n\n${'File'.padEnd(30)} ${'Date'.padEnd(12)} ${'Size'.padEnd(8)} Messages\n${'-'.repeat(70)}\n${fileList}`;
    } catch (error) {
      return language === 'ar' ? 
        `خطأ في تحميل ملفات المحادثات: ${error instanceof Error ? error.message : 'خطأ غير معروف'}` :
        `Error loading chat files: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  };

  const listMcpFiles = async (): Promise<string> => {
    try {
      const response = await fetch('/api/mcp/servers');
      const data = await response.json();
      const servers = data.servers || [];
      const serverList = servers.length > 0 ? 
        servers.map((server: any) => {
          return `${server.name} (${server.status}) - ${server.toolsCount} tools`;
        }).join('\n') : 
        (language === 'ar' ? 'لا توجد خوادم MCP نشطة' : 'No active MCP servers');
      
      return `📂 ${language === 'ar' ? 'خوادم MCP:' : 'MCP Servers:'}\n${serverList}`;
    } catch (error) {
      return `❌ ${language === 'ar' ? 'خطأ في جلب خوادم MCP:' : 'Error fetching MCP servers:'} ${error}`;
    }
  };

  const handleCdCommand = (args: string[]): string => {
    if (args.length === 0) {
      setCurrentPath('~');
      return '';
    }
    
    const targetPath = args[0];
    if (availablePaths.includes(targetPath)) {
      setCurrentPath(targetPath);
      return '';
    } else {
      return language === 'ar' ? 
        `المجلد "${targetPath}" غير موجود أو غير مسموح` :
        `Directory "${targetPath}" not found or not allowed`;
    }
  };

  const handleChatCommand = async (args: string[]): Promise<string> => {
    if (args.length === 0 || args[0] === 'list') {
      try {
        const sessions = await chatStorage.getAllSessions();
        if (sessions.length === 0) {
          return language === 'ar' ? 
            '📭 لا توجد محادثات محفوظة' :
            '📭 No saved conversations';
        }
        
        const chatList = sessions.map((session: ChatSession) => {
          const date = new Date(session.createdAt).toLocaleDateString();
          const messageCount = session.messages?.length || 0;
          return `📄 ${session.filename.padEnd(25)} ${session.title.slice(0, 30).padEnd(32)} ${date.padEnd(12)} ${messageCount} msgs`;
        }).join('\n');
        
        return language === 'ar' ? 
          `💬 المحادثات المحفوظة (${sessions.length}):\n\n${'الملف'.padEnd(25)} ${'العنوان'.padEnd(32)} ${'التاريخ'.padEnd(12)} الرسائل\n${'-'.repeat(80)}\n${chatList}\n\nاستخدم "chat view <filename>" لعرض محادثة` :
          `💬 Saved Conversations (${sessions.length}):\n\n${'File'.padEnd(25)} ${'Title'.padEnd(32)} ${'Date'.padEnd(12)} Messages\n${'-'.repeat(80)}\n${chatList}\n\nUse "chat view <filename>" to view a conversation`;
      } catch (error) {
        return language === 'ar' ? 
          'خطأ في تحميل المحادثات' :
          'Error loading conversations';
      }
    }
    
    switch (args[0]) {
      case 'view':
        if (!args[1]) {
          return language === 'ar' ? 
            'يرجى تحديد اسم الملف. استخدم: chat view <filename>' :
            'Please specify filename. Usage: chat view <filename>';
        }
        return await viewChatSession(args[1]);
        
      case 'delete':
        if (!args[1]) {
          return language === 'ar' ? 
            'يرجى تحديد اسم الملف. استخدم: chat delete <filename>' :
            'Please specify filename. Usage: chat delete <filename>';
        }
        return await deleteChatSession(args[1]);
        
      default:
        return language === 'ar' ? 
          'أمر chat غير صحيح. الأوامر المتاحة: list, view, delete' :
          'Invalid chat command. Available: list, view, delete';
    }
  };

  const viewChatSession = async (filename: string): Promise<string> => {
    try {
      const session = await chatStorage.getSession(filename);
      if (session) {
        const messages = session.messages.slice(0, 3).map((msg, i) => {
          const role = msg.role === 'user' ? '👤 USER' : '🤖 ASSISTANT';
          const timestamp = new Date(msg.timestamp).toLocaleTimeString();
          const content = msg.content.length > 150 ? msg.content.slice(0, 150) + '...' : msg.content;
          return `[${timestamp}] ${role}:\n${content}`;
        }).join('\n\n');
        
        const moreMessages = session.messages.length > 3 ? 
          (language === 'ar' ? `\n\n... و ${session.messages.length - 3} رسائل أخرى` : `\n\n... and ${session.messages.length - 3} more messages`) : '';
        
        return language === 'ar' ? 
          `💬 المحادثة: ${session.title}\n📅 تاريخ الإنشاء: ${new Date(session.createdAt).toLocaleString()}\n📊 عدد الرسائل: ${session.messages.length}\n🤖 النموذج: ${session.model?.name || 'Unknown'}\n\n${'-'.repeat(60)}\n${messages}${moreMessages}` :
          `💬 Conversation: ${session.title}\n📅 Created: ${new Date(session.createdAt).toLocaleString()}\n📊 Messages: ${session.messages.length}\n🤖 Model: ${session.model?.name || 'Unknown'}\n\n${'-'.repeat(60)}\n${messages}${moreMessages}`;
      } else {
        return language === 'ar' ? 
          `المحادثة "${filename}" غير موجودة` :
          `Conversation "${filename}" not found`;
      }
    } catch (error) {
      return language === 'ar' ? 
        'خطأ في تحميل المحادثة' :
        'Error loading conversation';
    }
  };

  const deleteChatSession = async (filename: string): Promise<string> => {
    try {
      await chatStorage.deleteSession(filename);
      return language === 'ar' ? 
        `✅ تم حذف المحادثة "${filename}" بنجاح` :
        `✅ Successfully deleted conversation "${filename}"`;
    } catch (error) {
      return language === 'ar' ? 
        `❌ فشل في حذف المحادثة "${filename}"` :
        `❌ Failed to delete conversation "${filename}"`;
    }
  };

  const handleMcpCommand = async (args: string[]): Promise<string> => {
    if (args.length === 0 || args[0] === 'list') {
      try {
        const response = await fetch('/api/mcp/servers');
        const data = await response.json();
        const servers = data.servers || [];
        if (servers.length === 0) {
          return language === 'ar' ? 
            '❌ لا توجد خوادم MCP متصلة.\nاستخدم: mcp add <server-name> لإضافة خادم' :
            '❌ No MCP servers connected.\nUse: mcp add <server-name> to add a server';
        }
        
        const serverDetails = servers.map((server: any) => {
          const status = server.isConnected ? '🟢 متصل' : '🔴 منقطع';
          const tools = server.toolsCount > 0 ? `\n  🔧 الأدوات: ${server.toolsCount}` : '';
          return `📡 ${server.name}\n  📊 الحالة: ${status}${tools}`;
        }).join('\n\n');
        
        return `🔌 ${language === 'ar' ? 'خوادم MCP النشطة:' : 'Active MCP Servers:'}\n\n${serverDetails}`;
      } catch (error) {
        return `❌ ${language === 'ar' ? 'خطأ في جلب خوادم MCP:' : 'Error fetching MCP servers:'} ${error}`;
      }
    }
    
    switch (args[0]) {
      case 'status':
        if (!args[1]) {
          return language === 'ar' ? 
            'يرجى تحديد اسم الخادم. استخدم: mcp status <name>' :
            'Please specify server name. Usage: mcp status <name>';
        }
        return await getMcpServerStatus(args[1]);
        
      case 'enable':
      case 'disable':
        if (!args[1]) {
          return language === 'ar' ? 
            `يرجى تحديد اسم الخادم. استخدم: mcp ${args[0]} <name>` :
            `Please specify server name. Usage: mcp ${args[0]} <name>`;
        }
        return await toggleMcpServer(args[1], args[0] === 'enable');
        
      default:
        return language === 'ar' ? 
          'أمر mcp غير صحيح. الأوامر المتاحة: list, status, enable, disable' :
          'Invalid mcp command. Available: list, status, enable, disable';
    }
  };

  const getMcpServerStatus = async (serverName: string): Promise<string> => {
    try {
      const response = await fetch('/api/mcp/servers');
      const data = await response.json();
      const servers = data.servers || [];
      const server = servers.find((s: any) => s.name === serverName);
      
      if (!server) {
        return `❌ ${language === 'ar' ? 'خادم غير موجود:' : 'Server not found:'} ${serverName}`;
      }
      
      const status = server.isConnected ? '🟢 متصل' : '🔴 منقطع';
      const tools = server.toolsCount > 0 ? `\n🔧 الأدوات المتاحة: ${server.toolsCount}` : '\n⚠️ لا توجد أدوات متاحة';
      
      return `📡 ${server.name}\n📊 الحالة: ${status}${tools}`;
    } catch (error) {
      return `❌ ${language === 'ar' ? 'خطأ في جلب حالة الخادم:' : 'Error fetching server status:'} ${error}`;
    }
  };

  const toggleMcpServer = async (serverName: string, enable: boolean): Promise<string> => {
    try {
      const response = await fetch('/api/mcp/servers');
      const data = await response.json();
      const servers = data.servers || [];
      const server = servers.find((s: any) => s.name === serverName);
      
      if (!server) {
        return `❌ ${language === 'ar' ? 'خادم غير موجود:' : 'Server not found:'} ${serverName}`;
      }
      
      const toggleResponse = await fetch('/api/mcp/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverId: server.id,
          action: enable ? 'connect' : 'disconnect'
        })
      });
      
      if (toggleResponse.ok) {
        return `✅ ${language === 'ar' ? (enable ? 'تم تفعيل الخادم:' : 'تم إيقاف الخادم:') : (enable ? 'Server enabled:' : 'Server disabled:')} ${serverName}`;
      } else {
        return `❌ ${language === 'ar' ? 'فشل في تغيير حالة الخادم' : 'Failed to toggle server'}`;
      }
    } catch (error) {
      return `❌ ${language === 'ar' ? 'خطأ في تغيير حالة الخادم:' : 'Error toggling server:'} ${error}`;
    }
  };

  const handleNanoCommand = async (args: string[]): Promise<string> => {
    if (args.length === 0) {
      return language === 'ar' ? 
        'يرجى تحديد اسم الملف. استخدم: nano <filename>' :
        'Please specify filename. Usage: nano <filename>';
    }

    const filename = args[0];
    setIsNanoMode(true);
    
    // Try to load existing file content
    try {
      if (filename.endsWith('.json') && currentPath === '~/chats') {
        const session = await chatStorage.getSession(filename);
        if (session) {
          setNanoFile({
            name: filename,
            content: JSON.stringify(session, null, 2),
            isNew: false
          });
        } else {
          setNanoFile({ name: filename, content: '', isNew: true });
        }
      } else {
        // Create new file
        setNanoFile({ name: filename, content: '', isNew: true });
      }
      
      return language === 'ar' ? 
        `📝 فتح محرر النصوص للملف: ${filename}\n\nاستخدم Ctrl+X للخروج, Ctrl+O للحفظ` :
        `📝 Opening text editor for: ${filename}\n\nUse Ctrl+X to exit, Ctrl+O to save`;
    } catch (error) {
      return language === 'ar' ? 
        `خطأ في فتح الملف: ${error instanceof Error ? error.message : 'خطأ غير معروف'}` :
        `Error opening file: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  };

  // Tab completion function
  const getTabCompletion = (currentInput: string): string => {
    const parts = currentInput.split(' ');
    const command = parts[0].toLowerCase();
    
    if (parts.length === 1) {
      // Complete command
      const matches = availableCommands.filter(cmd => cmd.startsWith(command));
      if (matches.length === 1) {
        return matches[0] + ' ';
      }
    } else if (parts.length === 2) {
      // Complete subcommands or file names
      const arg = parts[1];
      
      switch (command) {
        case 'chat':
          const chatMatches = chatSubCommands.filter(sub => sub.startsWith(arg));
          if (chatMatches.length === 1) {
            return `${command} ${chatMatches[0]} `;
          }
          break;
          
        case 'mcp':
          const mcpMatches = mcpSubCommands.filter(sub => sub.startsWith(arg));
          if (mcpMatches.length === 1) {
            return `${command} ${mcpMatches[0]} `;
          }
          break;
          
        case 'cd':
          const pathMatches = availablePaths.filter(path => path.startsWith(arg));
          if (pathMatches.length === 1) {
            return `${command} ${pathMatches[0]} `;
          }
          break;
      }
    }
    
    return currentInput;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const completed = getTabCompletion(currentCommand);
      setCurrentCommand(completed);
    } else if (e.key === 'Enter' && currentCommand.trim()) {
      handleCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    }
  };

  const handleNanoKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === 'x') {
      e.preventDefault();
      setIsNanoMode(false);
      setNanoFile({ name: '', content: '', isNew: false });
    } else if (e.ctrlKey && e.key === 'o') {
      e.preventDefault();
      saveNanoFile();
    }
  };

  const saveNanoFile = async () => {
    try {
      if (nanoFile.name.endsWith('.json') && currentPath === '~/chats') {
        // Save as chat session
        const parsedContent = JSON.parse(nanoFile.content);
        await chatStorage.saveSession(parsedContent);
      }
      // For other files, we would need file system API
      setCommands(prev => [...prev, {
        input: '',
        output: language === 'ar' ? 
          `✅ تم حفظ الملف "${nanoFile.name}" بنجاح` :
          `✅ File "${nanoFile.name}" saved successfully`,
        timestamp: new Date()
      }]);
    } catch (error) {
      setCommands(prev => [...prev, {
        input: '',
        output: language === 'ar' ? 
          `❌ فشل في حفظ الملف: ${error instanceof Error ? error.message : 'خطأ غير معروف'}` :
          `❌ Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }]);
    }
  };

  const handleCommand = async () => {
    if (!currentCommand.trim()) return;

    // Add to command history
    setCommandHistory(prev => [...prev, currentCommand]);
    setHistoryIndex(-1);

    const output = await executeCommand(currentCommand);
    
    setCommands(prev => [...prev, {
      input: currentCommand,
      output,
      timestamp: new Date()
    }]);

    setCurrentCommand('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-green-400 font-mono">
        <div className={`transition-all duration-300 ${isMaximized ? 'fixed inset-0 z-50' : 'container mx-auto p-4'}`}>
          <div className={`bg-black border border-green-500 rounded-lg overflow-hidden shadow-2xl ${isMinimized ? 'h-12' : 'h-[600px]'}`}>
            {/* Terminal Header */}
            <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-green-500">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-green-400" />
                <span className="text-sm font-semibold text-white">
                  {language === 'ar' ? 'تيرمينال Collaction' : 'Collaction Terminal'}
                </span>
                <span className="text-xs text-gray-400">
                  {user?.emailAddresses[0]?.emailAddress || 'user'}@collaction:{currentPath}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => copyToClipboard(commands.map(cmd => cmd.input + '\n' + cmd.output).join('\n\n'))}
                  className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
                  title={language === 'ar' ? 'نسخ المحتوى' : 'Copy content'}
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            {!isMinimized && (
              <div className="flex flex-col h-full">
                {/* Nano Editor Mode */}
                {isNanoMode ? (
                  <div className="flex flex-col h-full">
                    {/* Nano Header */}
                    <div className="bg-gray-700 px-4 py-2 text-sm text-white border-b border-gray-600">
                      <div className="flex justify-between items-center">
                        <span>
                          {language === 'ar' ? 
                            `محرر النصوص - ${nanoFile.name} ${nanoFile.isNew ? '(ملف جديد)' : ''}` :
                            `Text Editor - ${nanoFile.name} ${nanoFile.isNew ? '(New File)' : ''}`
                          }
                        </span>
                        <span className="text-xs text-gray-300">
                          Ctrl+O: {language === 'ar' ? 'حفظ' : 'Save'} | Ctrl+X: {language === 'ar' ? 'خروج' : 'Exit'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Nano Content */}
                    <textarea
                      value={nanoFile.content}
                      onChange={(e) => setNanoFile(prev => ({ ...prev, content: e.target.value }))}
                      onKeyDown={handleNanoKeyDown}
                      className="flex-1 bg-black text-green-400 font-mono text-sm p-4 border-none outline-none resize-none"
                      placeholder={language === 'ar' ? 'اكتب محتوى الملف هنا...' : 'Type file content here...'}
                      autoFocus
                    />
                    
                    {/* Nano Footer */}
                    <div className="bg-gray-700 px-4 py-1 text-xs text-gray-300 border-t border-gray-600">
                      <div className="flex justify-between">
                        <span>
                          {language === 'ar' ? 
                            `الأسطر: ${nanoFile.content.split('\n').length} | الأحرف: ${nanoFile.content.length}` :
                            `Lines: ${nanoFile.content.split('\n').length} | Characters: ${nanoFile.content.length}`
                          }
                        </span>
                        <span>
                          {language === 'ar' ? 'اضغط Tab للمساعدة' : 'Press Tab for help'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Output Area */}
                    <div
                      ref={outputRef}
                      className="flex-1 overflow-y-auto p-4 space-y-2 text-sm"
                    >
                      {commands.map((cmd, index) => (
                        <div key={index} className="space-y-1">
                          {cmd.input && (
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-400">
                                {user?.emailAddresses[0]?.emailAddress || 'user'}@collaction:{currentPath}$
                              </span>
                              <span className="text-white">{cmd.input}</span>
                            </div>
                          )}
                          {cmd.output && (
                            <pre className="text-green-400 whitespace-pre-wrap font-mono ml-4">
                              {cmd.output}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-green-500 p-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-400 text-sm">
                          {user?.emailAddresses[0]?.emailAddress || 'user'}@collaction:{currentPath}$
                        </span>
                        <input
                          ref={inputRef}
                          type="text"
                          value={currentCommand}
                          onChange={(e) => setCurrentCommand(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="flex-1 bg-transparent border-none outline-none text-white text-sm font-mono"
                          placeholder={language === 'ar' ? 'اكتب أمر... (اضغط Tab للإكمال)' : 'Type a command... (Press Tab to complete)'}
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TerminalPage;