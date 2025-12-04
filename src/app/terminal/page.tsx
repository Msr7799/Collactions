'use client';


import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useLanguage } from '@/contexts/LanguageContext';
import TransparentLayout from '@/components/layout/TransparentLayout';
import { StarsLayout } from '@/components/layout/StarsLayout';
import { Terminal, X, Minimize2, Maximize2, Copy, Lock, Shield } from 'lucide-react';
import { chatStorage, ChatSession } from '../prompts-legacy/prompts/chatStorage';

interface Command {
  input: string;
  output: string;
  timestamp: Date;
}

interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  size?: number;
  permissions?: string;
  owner?: string;
  modified?: Date;
  children?: { [key: string]: FileSystemNode };
}

const TerminalPage: React.FC = () => {
  const { user } = useUser();
  const { language } = useLanguage();
  const [commands, setCommands] = useState<Command[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isNanoMode, setIsNanoMode] = useState(false);
  const [nanoFile, setNanoFile] = useState({ name: '', content: '', isNew: false });
  const [environment, setEnvironment] = useState<{ [key: string]: string }>({
    USER: 'user',
    HOME: '/home/user',
    PWD: '/home/user',
    SHELL: '/usr/bin/zsh',
    PATH: '/usr/local/bin:/usr/bin:/bin',
    ZSH: '/home/user/.oh-my-zsh',
    ZSH_THEME: 'collaction'
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // نظام ملفات افتراضي محدود وآمن
  const [fileSystem, setFileSystem] = useState<FileSystemNode>({
    name: '',
    type: 'directory',
    children: {
      home: {
        name: 'home',
        type: 'directory',
        permissions: 'drwxr-xr-x',
        owner: 'root',
        modified: new Date(),
        children: {
          user: {
            name: 'user',
            type: 'directory',
            permissions: 'drwx------',
            owner: 'user',
            modified: new Date(),
            children: {
              chats: {
                name: 'chats',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                owner: 'user',
                modified: new Date(),
                children: {}
              },
              documents: {
                name: 'documents',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                owner: 'user',
                modified: new Date(),
                children: {
                  'README.md': {
                    name: 'README.md',
                    type: 'file',
                    permissions: '-rw-r--r--',
                    owner: 'user',
                    modified: new Date(),
                    size: 256,
                    content: language === 'ar' ? 
                      '# مرحباً بك في مساحتك الشخصية\n\nهذا مجلد آمن يمكنك استخدامه لحفظ ملفاتك الشخصية.\nيمكنك إنشاء وتعديل الملفات هنا بأمان.\n\n## الأوامر المتاحة:\n- ls: عرض الملفات\n- cat: قراءة الملفات\n- nano: تحرير الملفات\n- mkdir: إنشاء مجلد\n- rm: حذف الملفات' :
                      '# Welcome to Your Personal Space\n\nThis is a secure folder where you can save your personal files.\nYou can create and modify files here safely.\n\n## Available Commands:\n- ls: list files\n- cat: read files\n- nano: edit files\n- mkdir: create directories\n- rm: delete files'
                  }
                }
              },
              projects: {
                name: 'projects',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                owner: 'user',
                modified: new Date(),
                children: {}
              },
              mcp: {
                name: 'mcp',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                owner: 'user',
                modified: new Date(),
                children: {
                  'servers.json': {
                    name: 'servers.json',
                    type: 'file',
                    permissions: '-rw-r--r--',
                    owner: 'user',
                    modified: new Date(),
                    size: 128,
                    content: '{\n  "servers": [],\n  "templates": []\n}'
                  }
                }
              },
              '.oh-my-zsh': {
                name: '.oh-my-zsh',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                owner: 'user',
                modified: new Date(),
                children: {
                  'themes': {
                    name: 'themes',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'user',
                    modified: new Date(),
                    children: {}
                  }
                }
              },
              '.zshrc': {
                name: '.zshrc',
                type: 'file',
                permissions: '-rw-r--r--',
                owner: 'user',
                modified: new Date(),
                size: 2048,
                content: '# Path to oh-my-zsh installation\nexport ZSH="$HOME/.oh-my-zsh"\n\n# Collaction Theme\nZSH_THEME="collaction"\n\n# Plugins\nplugins=(git node npm yarn docker kubectl)\n\nsource $ZSH/oh-my-zsh.sh\n\n# Custom aliases\nalias ll="ls -la"\nalias la="ls -A"\nalias l="ls -CF"\nalias ..="cd .."\nalias ...="cd ../.."\nalias chat="collaction chat"\nalias mcp="collaction mcp"\n\n# Welcome message\necho "🚀 Welcome to Collaction Terminal with Oh My Zsh!"'
              }
            }
          }
        }
      },
      tmp: {
        name: 'tmp',
        type: 'directory',
        permissions: 'drwxrwxrwt',
        owner: 'root',
        modified: new Date(),
        children: {}
      }
    }
  });

  // الأوامر المتاحة مع التوسع
  const availableCommands = [
    'help', 'clear', 'pwd', 'ls', 'cd', 'cat', 'nano', 'mkdir', 'rmdir', 'rm', 
    'cp', 'mv', 'touch', 'chmod', 'whoami', 'date', 'echo', 'grep', 'find',
    'chat', 'mcp', 'env', 'export', 'history', 'tree', 'du', 'df', 'ps', 'top',
    'll', 'la', 'gitlog', 'gitst'
  ];

  const chatSubCommands = ['list', 'view', 'delete', 'backup', 'import'];
  const mcpSubCommands = ['list', 'status', 'enable', 'disable', 'install', 'templates', 'logs'];

  // المسارات المحظورة لأمان النظام
  const restrictedPaths = [
    '/etc', '/usr', '/bin', '/sbin', '/root', '/sys', '/proc', '/dev', '/var/log',
    '/boot', '/lib', '/opt', '/', '/app', '/src', '/config', '/api'
  ];

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [commands]);

  useEffect(() => {
    if (user) {
      loadUserChats();
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
      `🛡️ مرحباً ${userEmail} في تيرمينال Collaction الآمن مع Oh My Zsh!

🔒 البيئة الآمنة: نظام ملفات محاكي آمن ومحدود
📁 مساحتك الشخصية: ${currentPath}
🐚 Shell: Zsh مع Oh My Zsh
🎨 Theme: Collaction المخصص

📋 الأوامر الأساسية:
  ls [-la] | ll | la  - عرض الملفات والمجلدات  
  cd <path> | .. | ... - تغيير المجلد
  cat <file>          - عرض محتوى الملف
  nano <file>         - تحرير الملف
  mkdir <dir>         - إنشاء مجلد
  rm [-rf] <file>     - حذف ملف/مجلد
  cp | mv <src> <dst> - نسخ/نقل الملفات

💬 أوامر المحادثات:
  chat list/view/delete/backup/import

🔌 أوامر MCP:
  mcp list/status/enable/disable/install

⚡ أوامر متقدمة:
  tree, find, grep, ps, top, env, history

⌨️ الاختصارات:
  Tab: إكمال تلقائي | ↑↓: تاريخ الأوامر | Ctrl+C: إلغاء | Ctrl+L: مسح

اكتب 'help' للحصول على مساعدة شاملة` :
      `🛡️ Welcome ${userEmail} to Collaction Secure Terminal with Oh My Zsh!

🔒 Secure Environment: Safe and limited simulated file system
📁 Your Personal Space: ${currentPath}
🐚 Shell: Zsh with Oh My Zsh
🎨 Theme: Custom Collaction

📋 Basic Commands:
  ls [-la] | ll | la  - List files and directories
  cd <path> | .. | ... - Change directory
  cat <file>          - Display file content
  nano <file>         - Edit file
  mkdir <dir>         - Create directory
  rm [-rf] <file>     - Delete file/directory
  cp | mv <src> <dst> - Copy/move files

💬 Chat Commands:
  chat list/view/delete/backup/import

🔌 MCP Commands:
  mcp list/status/enable/disable/install

⚡ Advanced Commands:
  tree, find, grep, ps, top, env, history

⌨️ Shortcuts:
  Tab: auto-complete | ↑↓: command history | Ctrl+C: cancel | Ctrl+L: clear

Type 'help' for comprehensive help`;
  };

  // تحميل محادثات المستخدم إلى نظام الملفات
  const loadUserChats = async () => {
    try {
      const sessions = await chatStorage.getAllSessions();
      const chatsNode = getNodeAtPath('/home/user/chats');
      if (chatsNode && chatsNode.children) {
        chatsNode.children = {};
        sessions.forEach((session: ChatSession) => {
          if (chatsNode.children) {
            chatsNode.children[session.filename] = {
              name: session.filename,
              type: 'file',
              permissions: '-rw-r--r--',
              owner: 'user',
              modified: new Date(session.createdAt),
              size: JSON.stringify(session).length,
              content: JSON.stringify(session, null, 2)
            };
          }
        });
      }
    } catch (error) {
      console.error('Error loading user chats:', error);
    }
  };

  // الحصول على عقدة في المسار المحدد
  const getNodeAtPath = (path: string): FileSystemNode | null => {
    if (path === '/') return fileSystem;
    
    const parts = path.split('/').filter(p => p);
    let current = fileSystem;
    
    for (const part of parts) {
      if (!current.children || !current.children[part]) {
        return null;
      }
      current = current.children[part];
    }
    
    return current;
  };

  // التحقق من صحة المسار وأمانه
  const isPathSafe = (path: string): boolean => {
    const normalizedPath = path.startsWith('/') ? path : currentPath + '/' + path;
    
    for (const restricted of restrictedPaths) {
      if (normalizedPath.startsWith(restricted) && normalizedPath !== '/home/user' && !normalizedPath.startsWith('/home/user/')) {
        return false;
      }
    }
    
    if (normalizedPath.includes('..') || normalizedPath.includes('./')) {
      return false;
    }
    
    return true;
  };

  // تنفيذ الأوامر
  const executeCommand = async (cmd: string): Promise<string> => {
    const parts = cmd.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    // إضافة للتاريخ
    if (!commandHistory.includes(cmd)) {
      setCommandHistory(prev => [...prev.slice(-99), cmd]);
    }
    
    try {
      switch (command) {
        case 'help':
          return getDetailedHelp(args);
          
        case 'clear':
          setCommands([]);
          return '';
          
        case 'pwd':
          return currentPath;
          
        case 'ls':
        case 'll':
        case 'la':
          return handleLsCommand(command === 'll' ? ['-l'] : command === 'la' ? ['-la'] : args);
          
        case 'cd':
          return handleCdCommand(args);
          
        case '..':
          return handleCdCommand(['..']);
          
        case '...':
          return handleCdCommand(['../..']);
          
        case 'cat':
          return handleCatCommand(args);
          
        case 'nano':
          return await handleNanoCommand(args);
          
        case 'mkdir':
          return handleMkdirCommand(args);
          
        case 'rm':
        case 'rmdir':
          return handleRmCommand(args, command === 'rmdir');
          
        case 'cp':
          return handleCpCommand(args);
          
        case 'mv':
          return handleMvCommand(args);
          
        case 'touch':
          return handleTouchCommand(args);
          
        case 'chmod':
          return handleChmodCommand(args);
          
        case 'find':
          return handleFindCommand(args);
          
        case 'grep':
          return handleGrepCommand(args);
          
        case 'tree':
          return handleTreeCommand(args);
          
        case 'du':
          return handleDuCommand(args);
          
        case 'df':
          return handleDfCommand();
          
        case 'ps':
          return handlePsCommand();
          
        case 'top':
          return handleTopCommand();
          
        case 'env':
          return handleEnvCommand();
          
        case 'export':
          return handleExportCommand(args);
          
        case 'echo':
          return handleEchoCommand(args);
          
        case 'whoami':
          return environment.USER;
          
        case 'date':
          return new Date().toLocaleString();
          
        case 'history':
          return handleHistoryCommand();
          
        case 'chat':
          return await handleChatCommand(args);
          
        case 'mcp':
          return await handleMcpCommand(args);

        case 'gitlog':
          return handleGitLog();

        case 'gitst':
          return handleGitStatus();
          
        default:
          return language === 'ar' ? 
            `zsh: command not found: ${command}\n${getCommandSuggestion(command)}` :
            `zsh: command not found: ${command}\n${getCommandSuggestion(command)}`;
      }
    } catch (error) {
      return language === 'ar' ? 
        `خطأ: ${error instanceof Error ? error.message : 'خطأ غير معروف'}` :
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  };

  const getCommandSuggestion = (command: string): string => {
    const suggestions = availableCommands.filter(cmd => 
      cmd.includes(command) || command.includes(cmd)
    );
    
    if (suggestions.length > 0) {
      return language === 'ar' ? 
        `💡 هل قصدت: ${suggestions.slice(0, 3).join(', ')}?` :
        `💡 Did you mean: ${suggestions.slice(0, 3).join(', ')}?`;
    }
    
    return language === 'ar' ? 
      `💡 اكتب 'help' لعرض الأوامر المتاحة` :
      `💡 Type 'help' to see available commands`;
  };

  const getDetailedHelp = (args: string[]): string => {
    if (args.length === 0) {
      return language === 'ar' ? 
        `🛡️ مساعدة تيرمينال Collaction الآمن مع Oh My Zsh

📁 أوامر الملفات والمجلدات:
  ls [-la] [path]     - عرض محتويات المجلد
  ll                  - اختصار لـ ls -la
  la                  - اختصار لـ ls -A
  cd <directory>      - تغيير المجلد الحالي
  .. | ...            - العودة للمجلد الأب
  pwd                 - عرض المسار الحالي
  cat <file>          - عرض محتوى الملف
  nano <file>         - فتح محرر النصوص
  mkdir <directory>   - إنشاء مجلد جديد
  rmdir <directory>   - حذف مجلد فارغ
  rm [-rf] <file>     - حذف ملف أو مجلد
  cp <source> <dest>  - نسخ ملف أو مجلد
  mv <source> <dest>  - نقل أو إعادة تسمية
  touch <file>        - إنشاء ملف فارغ
  chmod <mode> <file> - تغيير صلاحيات الملف

🔍 أوامر البحث والتصفية:
  find <path> <pattern> - البحث عن الملفات
  grep <pattern> <file> - البحث في محتوى الملفات
  tree [path]           - عرض هيكل المجلدات

📊 أوامر معلومات النظام:
  ps                    - عرض العمليات النشطة  
  top                   - مراقب النظام
  df                    - مساحة القرص المتاحة
  du [path]             - حجم المجلدات
  env                   - متغيرات البيئة
  whoami                - المستخدم الحالي
  date                  - التاريخ والوقت

💬 أوامر المحادثات:
  chat list             - عرض جميع المحادثات
  chat view <file>      - عرض محادثة معينة
  chat delete <file>    - حذف محادثة
  chat backup           - نسخ احتياطي للمحادثات
  chat import <file>    - استيراد محادثات

🔌 أوامر MCP:
  mcp list              - عرض خوادم MCP
  mcp status <name>     - حالة خادم معين
  mcp enable <name>     - تفعيل خادم
  mcp disable <name>    - إيقاف خادم
  mcp install <config>  - تثبيت خادم جديد
  mcp templates         - عرض قوالب الخوادم
  mcp logs [server]     - عرض سجلات الخوادم

🐙 أوامر Git (محاكاة):
  gitlog                - عرض تاريخ Git
  gitst                 - حالة Git

⚡ أوامر أخرى:
  echo <text>           - طباعة النص
  history               - تاريخ الأوامر
  export VAR=value      - تعيين متغير البيئة
  help <command>        - مساعدة مفصلة لأمر معين
  clear                 - مسح الشاشة

🔒 ملاحظات الأمان:
- يمكنك فقط الوصول للملفات في /home/user/
- لا يمكن الوصول لملفات النظام أو التطبيق
- جميع العمليات آمنة ومحاكاة

⌨️ اختصارات Oh My Zsh:
- Tab: إكمال تلقائي ذكي
- ↑↓: تصفح تاريخ الأوامر
- Ctrl+R: بحث في تاريخ الأوامر
- Ctrl+C: إلغاء الأمر الحالي
- Ctrl+L: مسح الشاشة` :
        `🛡️ Collaction Secure Terminal Help with Oh My Zsh

📁 File and Directory Commands:
  ls [-la] [path]       - List directory contents
  ll                    - Shortcut for ls -la
  la                    - Shortcut for ls -A
  cd <directory>        - Change current directory
  .. | ...              - Go to parent directory
  pwd                   - Print working directory
  cat <file>            - Display file content
  nano <file>           - Open text editor
  mkdir <directory>     - Create new directory
  rmdir <directory>     - Remove empty directory
  rm [-rf] <file>       - Remove file or directory
  cp <source> <dest>    - Copy file or directory
  mv <source> <dest>    - Move or rename
  touch <file>          - Create empty file
  chmod <mode> <file>   - Change file permissions

🔍 Search and Filter Commands:
  find <path> <pattern> - Search for files
  grep <pattern> <file> - Search within file content
  tree [path]           - Display directory structure

📊 System Information Commands:
  ps                    - Show running processes
  top                   - System monitor
  df                    - Show disk space
  du [path]             - Directory sizes
  env                   - Environment variables
  whoami                - Current user
  date                  - Date and time

💬 Chat Commands:
  chat list             - List all conversations
  chat view <file>      - View specific conversation
  chat delete <file>    - Delete conversation
  chat backup           - Backup conversations
  chat import <file>    - Import conversations

🔌 MCP Commands:
  mcp list              - List MCP servers
  mcp status <name>     - Show server status
  mcp enable <name>     - Enable server
  mcp disable <name>    - Disable server
  mcp install <config>  - Install new server
  mcp templates         - Show server templates
  mcp logs [server]     - Show server logs

🐙 Git Commands (Simulated):
  gitlog                - Show Git log
  gitst                 - Git status

⚡ Other Commands:
  echo <text>           - Print text
  history               - Command history
  export VAR=value      - Set environment variable
  help <command>        - Detailed help for command
  clear                 - Clear screen

🔒 Security Notes:
- You can only access files in /home/user/
- No access to system or application files
- All operations are safe and simulated

⌨️ Oh My Zsh Shortcuts:
- Tab: Smart auto-completion
- ↑↓: Browse command history
- Ctrl+R: Search command history
- Ctrl+C: Cancel current command
- Ctrl+L: Clear screen`;
    }
    
    return getSpecificHelp(args[0]);
  };

  const getSpecificHelp = (command: string): string => {
    // يمكن إضافة مساعدة مفصلة لأوامر معينة هنا
    return language === 'ar' ? 
      `لا توجد مساعدة مفصلة للأمر '${command}'` :
      `No detailed help available for '${command}'`;
  };

  const handleLsCommand = (args: string[]): string => {
    let showHidden = false;
    let showDetails = false;
    let targetPath = currentPath;
    
    const flags = args.filter(arg => arg.startsWith('-'));
    const paths = args.filter(arg => !arg.startsWith('-'));
    
    flags.forEach(flag => {
      if (flag.includes('a')) showHidden = true;
      if (flag.includes('l')) showDetails = true;
    });
    
    if (paths.length > 0) {
      targetPath = paths[0].startsWith('/') ? paths[0] : currentPath + '/' + paths[0];
    }
    
    if (!isPathSafe(targetPath)) {
      return language === 'ar' ? 
        `ls: لا يمكن الوصول '${targetPath}': صلاحية مرفوضة` :
        `ls: cannot access '${targetPath}': Permission denied`;
    }
    
    const node = getNodeAtPath(targetPath);
    if (!node) {
      return language === 'ar' ? 
        `ls: لا يمكن الوصول '${targetPath}': لا يوجد ملف أو مجلد بهذا الاسم` :
        `ls: cannot access '${targetPath}': No such file or directory`;
    }
    
    if (node.type === 'file') {
      return showDetails ? 
        `${node.permissions} 1 ${node.owner} ${node.owner} ${node.size} ${node.modified?.toLocaleDateString()} ${node.name}` :
        node.name;
    }
    
    if (!node.children) {
      return language === 'ar' ? 'المجلد فارغ' : 'Directory is empty';
    }
    
    const items = Object.values(node.children)
      .filter(child => showHidden || !child.name.startsWith('.'))
      .sort((a, b) => {
        if (a.type === 'directory' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'directory') return 1;
        return a.name.localeCompare(b.name);
      });
    
    if (showDetails) {
      const details = items.map(item => {
        const permissions = item.permissions || '-rw-r--r--';
        const owner = item.owner || 'user';
        const size = item.size || 0;
        const date = item.modified?.toLocaleDateString() || new Date().toLocaleDateString();
        const name = item.type === 'directory' ? `📁 ${item.name}` : `📄 ${item.name}`;
        
        return `${permissions} 1 ${owner.padEnd(8)} ${owner.padEnd(8)} ${size.toString().padStart(8)} ${date} ${name}`;
      }).join('\n');
      
      const total = items.length;
      return language === 'ar' ? 
        `المجموع ${total}\n${details}` :
        `total ${total}\n${details}`;
    } else {
      return items.map(item => {
        return item.type === 'directory' ? `📁 ${item.name}` : `📄 ${item.name}`;
      }).join('  ');
    }
  };

  // تنفيذ باقي الأوامر (نفس الكود السابق ولكن مع التحديثات)
  const handleCdCommand = (args: string[]): string => {
    if (args.length === 0) {
      setCurrentPath('/home/user');
      setEnvironment(prev => ({ ...prev, PWD: '/home/user' }));
      return '';
    }
    
    let targetPath = args[0];
    if (targetPath === '~') targetPath = '/home/user';
    if (targetPath === '..') {
      const parts = currentPath.split('/').filter(p => p);
      if (parts.length > 2) {
        targetPath = '/' + parts.slice(0, -1).join('/');
      } else {
        targetPath = '/home/user';
      }
    }
    if (targetPath === '../..') {
      const parts = currentPath.split('/').filter(p => p);
      if (parts.length > 3) {
        targetPath = '/' + parts.slice(0, -2).join('/');
      } else {
        targetPath = '/home/user';
      }
    }
    if (!targetPath.startsWith('/')) {
      targetPath = currentPath + '/' + targetPath;
    }
    
    const parts = targetPath.split('/').filter(p => p);
    const cleanPath = '/' + parts.join('/');
    
    if (!isPathSafe(cleanPath)) {
      return language === 'ar' ? 
        `cd: ${targetPath}: صلاحية مرفوضة` :
        `cd: ${targetPath}: Permission denied`;
    }
    
    const node = getNodeAtPath(cleanPath);
    if (!node) {
      return language === 'ar' ? 
        `cd: ${targetPath}: لا يوجد ملف أو مجلد بهذا الاسم` :
        `cd: ${targetPath}: No such file or directory`;
    }
    
    if (node.type !== 'directory') {
      return language === 'ar' ? 
        `cd: ${targetPath}: ليس مجلداً` :
        `cd: ${targetPath}: Not a directory`;
    }
    
    setCurrentPath(cleanPath);
    setEnvironment(prev => ({ ...prev, PWD: cleanPath }));
    return '';
  };

  const handleCatCommand = (args: string[]): string => {
    if (args.length === 0) {
      return language === 'ar' ? 
        'cat: يجب تحديد اسم الملف' :
        'cat: missing file name';
    }
    
    let filePath = args[0];
    if (!filePath.startsWith('/')) {
      filePath = currentPath + '/' + filePath;
    }
    
    if (!isPathSafe(filePath)) {
      return language === 'ar' ? 
        `cat: ${args[0]}: صلاحية مرفوضة` :
        `cat: ${args[0]}: Permission denied`;
    }
    
    const node = getNodeAtPath(filePath);
    if (!node) {
      return language === 'ar' ? 
        `cat: ${args[0]}: لا يوجد ملف أو مجلد بهذا الاسم` :
        `cat: ${args[0]}: No such file or directory`;
    }
    
    if (node.type !== 'file') {
      return language === 'ar' ? 
        `cat: ${args[0]}: هذا مجلد` :
        `cat: ${args[0]}: Is a directory`;
    }
    
    return node.content || '';
  };

  // أوامر أخرى مبسطة
  const handleMkdirCommand = (args: string[]): string => {
    if (args.length === 0) {
      return language === 'ar' ? 
        'mkdir: يجب تحديد اسم المجلد' :
        'mkdir: missing directory name';
    }
    
    const dirName = args[0];
    let targetPath = dirName.startsWith('/') ? dirName : currentPath + '/' + dirName;
    
    if (!isPathSafe(targetPath)) {
      return language === 'ar' ? 
        `mkdir: لا يمكن إنشاء المجلد '${dirName}': صلاحية مرفوضة` :
        `mkdir: cannot create directory '${dirName}': Permission denied`;
    }
    
    const parentPath = targetPath.substring(0, targetPath.lastIndexOf('/'));
    const newDirName = targetPath.substring(targetPath.lastIndexOf('/') + 1);
    
    const parentNode = getNodeAtPath(parentPath);
    if (!parentNode || !parentNode.children) {
      return language === 'ar' ? 
        `mkdir: لا يمكن إنشاء المجلد '${dirName}': المجلد الأب غير موجود` :
        `mkdir: cannot create directory '${dirName}': No such file or directory`;
    }
    
    if (parentNode.children[newDirName]) {
      return language === 'ar' ? 
        `mkdir: لا يمكن إنشاء المجلد '${dirName}': الملف موجود` :
        `mkdir: cannot create directory '${dirName}': File exists`;
    }
    
    parentNode.children[newDirName] = {
      name: newDirName,
      type: 'directory',
      permissions: 'drwxr-xr-x',
      owner: 'user',
      modified: new Date(),
      children: {}
    };
    
    setFileSystem({ ...fileSystem });
    return '';
  };

  const handleRmCommand = (args: string[], isDirOnly: boolean = false): string => {
    if (args.length === 0) {
      return language === 'ar' ? 
        `${isDirOnly ? 'rmdir' : 'rm'}: يجب تحديد اسم الملف أو المجلد` :
        `${isDirOnly ? 'rmdir' : 'rm'}: missing file or directory name`;
    }
    
    let recursive = false;
    let force = false;
    const files = [];
    
    for (const arg of args) {
      if (arg.startsWith('-')) {
        if (arg.includes('r') || arg.includes('R')) recursive = true;
        if (arg.includes('f')) force = true;
      } else {
        files.push(arg);
      }
    }
    
    const results = [];
    
    for (const fileName of files) {
      let filePath = fileName.startsWith('/') ? fileName : currentPath + '/' + fileName;
      
      if (!isPathSafe(filePath)) {
        results.push(language === 'ar' ? 
          `rm: لا يمكن حذف '${fileName}': صلاحية مرفوضة` :
          `rm: cannot remove '${fileName}': Permission denied`);
        continue;
      }
      
      const parentPath = filePath.substring(0, filePath.lastIndexOf('/'));
      const itemName = filePath.substring(filePath.lastIndexOf('/') + 1);
      
      const parentNode = getNodeAtPath(parentPath);
      if (!parentNode || !parentNode.children || !parentNode.children[itemName]) {
        if (!force) {
          results.push(language === 'ar' ? 
            `rm: لا يمكن حذف '${fileName}': لا يوجد ملف أو مجلد بهذا الاسم` :
            `rm: cannot remove '${fileName}': No such file or directory`);
        }
        continue;
      }
      
      const targetNode = parentNode.children[itemName];
      
      if (targetNode.type === 'directory' && !recursive && !isDirOnly) {
        results.push(language === 'ar' ? 
          `rm: لا يمكن حذف '${fileName}': هذا مجلد` :
          `rm: cannot remove '${fileName}': Is a directory`);
        continue;
      }
      
      delete parentNode.children[itemName];
    }
    
    setFileSystem({ ...fileSystem });
    return results.join('\n');
  };

  const handleCpCommand = (args: string[]): string => {
    if (args.length < 2) {
      return language === 'ar' ? 
        'cp: يجب تحديد المصدر والوجهة' :
        'cp: missing source and destination';
    }
    
    // تنفيذ مبسط للنسخ
    return language === 'ar' ? 
      'تم تنفيذ الأمر (محاكاة)' :
      'Command executed (simulated)';
  };

  const handleMvCommand = (args: string[]): string => {
    if (args.length < 2) {
      return language === 'ar' ? 
        'mv: يجب تحديد المصدر والوجهة' :
        'mv: missing source and destination';
    }
    
    return language === 'ar' ? 
      'تم تنفيذ الأمر (محاكاة)' :
      'Command executed (simulated)';
  };

  const handleTouchCommand = (args: string[]): string => {
    if (args.length === 0) {
      return language === 'ar' ? 
        'touch: يجب تحديد اسم الملف' :
        'touch: missing file name';
    }
    
    const fileName = args[0];
    let filePath = fileName.startsWith('/') ? fileName : currentPath + '/' + fileName;
    
    if (!isPathSafe(filePath)) {
      return language === 'ar' ? 
        `touch: لا يمكن لمس '${fileName}': صلاحية مرفوضة` :
        `touch: cannot touch '${fileName}': Permission denied`;
    }
    
    const parentPath = filePath.substring(0, filePath.lastIndexOf('/'));
    const newFileName = filePath.substring(filePath.lastIndexOf('/') + 1);
    
    const parentNode = getNodeAtPath(parentPath);
    if (!parentNode || !parentNode.children) {
      return language === 'ar' ? 
        `touch: لا يمكن لمس '${fileName}': لا يوجد ملف أو مجلد بهذا الاسم` :
        `touch: cannot touch '${fileName}': No such file or directory`;
    }
    
    if (parentNode.children[newFileName]) {
      parentNode.children[newFileName].modified = new Date();
    } else {
      parentNode.children[newFileName] = {
        name: newFileName,
        type: 'file',
        permissions: '-rw-r--r--',
        owner: 'user',
        modified: new Date(),
        size: 0,
        content: ''
      };
    }
    
    setFileSystem({ ...fileSystem });
    return '';
  };

  const handleChmodCommand = (args: string[]): string => {
    if (args.length < 2) {
      return language === 'ar' ? 
        'chmod: يجب تحديد الصلاحيات واسم الملف' :
        'chmod: missing mode and file name';
    }
    
    return language === 'ar' ? 
      'تم تغيير الصلاحيات (محاكاة)' :
      'Permissions changed (simulated)';
  };

  const handleFindCommand = (args: string[]): string => {
    const searchPath = args[0] || currentPath;
    const searchName = args[1] || '';
    
    return language === 'ar' ? 
      `البحث في ${searchPath} عن "${searchName}" (محاكاة)` :
      `Searching in ${searchPath} for "${searchName}" (simulated)`;
  };

  const handleGrepCommand = (args: string[]): string => {
    if (args.length < 2) {
      return language === 'ar' ? 
        'grep: يجب تحديد النمط واسم الملف' :
        'grep: missing pattern and file name';
    }
    
    return language === 'ar' ? 
      'البحث عن النمط (محاكاة)' :
      'Pattern search (simulated)';
  };

  const handleTreeCommand = (args: string[]): string => {
    const targetPath = args[0] || currentPath;
    
    const node = getNodeAtPath(targetPath);
    if (!node) {
      return language === 'ar' ? 
        `tree: ${targetPath}: لا يوجد ملف أو مجلد بهذا الاسم` :
        `tree: ${targetPath}: No such file or directory`;
    }
    
    const buildTree = (node: FileSystemNode, prefix: string = '', isLast: boolean = true): string => {
      const connector = isLast ? '└── ' : '├── ';
      const icon = node.type === 'directory' ? '📁' : '📄';
      let result = prefix + connector + icon + ' ' + node.name + '\n';
      
      if (node.type === 'directory' && node.children) {
        const children = Object.values(node.children);
        const nextPrefix = prefix + (isLast ? '    ' : '│   ');
        
        children.forEach((child, index) => {
          const isChildLast = index === children.length - 1;
          result += buildTree(child, nextPrefix, isChildLast);
        });
      }
      
      return result;
    };
    
    let result = `📁 ${node.name || targetPath}\n`;
    if (node.type === 'directory' && node.children) {
      const children = Object.values(node.children);
      children.forEach((child, index) => {
        const isLast = index === children.length - 1;
        result += buildTree(child, '', isLast);
      });
    }
    
    return result.trim();
  };

  const handleDuCommand = (args: string[]): string => {
    return language === 'ar' ? 
      '4.0K\t./\n16K\ttotal' :
      '4.0K\t./\n16K\ttotal';
  };

  const handleDfCommand = (): string => {
    return language === 'ar' ? 
      `نظام الملفات    الحجم  المستخدم  المتاح  النسبة% نقطة التحميل
/dev/virtual     100M     45M     55M     45%  /
tmpfs           50M      2M      48M      4%  /tmp` :
      `Filesystem     Size  Used Avail Use% Mounted on
/dev/virtual   100M   45M   55M  45% /
tmpfs          50M    2M   48M   4% /tmp`;
  };

  const handlePsCommand = (): string => {
    const processes = [
      { pid: 1, user: 'root', cmd: 'systemd' },
      { pid: 42, user: 'user', cmd: 'zsh' },
      { pid: 43, user: 'user', cmd: 'collaction-terminal' },
      { pid: 44, user: 'user', cmd: 'mcp-client' }
    ];
    
    const header = language === 'ar' ? 
      '  PID المستخدم الأمر' :
      '  PID USER     COMMAND';
    
    const processList = processes.map(p => 
      `${p.pid.toString().padStart(5)} ${p.user.padEnd(8)} ${p.cmd}`
    ).join('\n');
    
    return `${header}\n${processList}`;
  };

  const handleTopCommand = (): string => {
    return language === 'ar' ? 
      `تيرمينال Collaction - ${new Date().toLocaleTimeString()}
وقت التشغيل: 2:34, متوسط الحمولة: 0.15, 0.12, 0.08
العمليات: 4 المجموع, 1 قيد التشغيل, 3 في الانتظار
%استخدام المعالج: 2.3 مستخدم, 1.1 نظام, 96.6 خامل
الذاكرة: 1024M المجموع, 256M المستخدمة, 768M الحرة

  PID المستخدم %المعالج %الذاكرة الأمر
   42 user        0.1      0.5 zsh
   43 user        2.3      2.1 collaction-terminal` :
      `Collaction Terminal - ${new Date().toLocaleTimeString()}
up 2:34, load average: 0.15, 0.12, 0.08
Tasks: 4 total, 1 running, 3 sleeping
%Cpu(s): 2.3 us, 1.1 sy, 96.6 id
MiB Mem : 1024 total, 768 free, 256 used

  PID USER      %CPU %MEM COMMAND
   42 user       0.1  0.5 zsh
   43 user       2.3  2.1 collaction-terminal`;
  };

  const handleEnvCommand = (): string => {
    return Object.entries(environment)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
  };

  const handleExportCommand = (args: string[]): string => {
    if (args.length === 0) {
      return handleEnvCommand();
    }
    
    const assignment = args[0];
    const [key, value] = assignment.split('=');
    
    if (!key || value === undefined) {
      return language === 'ar' ? 
        'export: صيغة غير صحيحة. استخدم: export VAR=value' :
        'export: invalid format. Use: export VAR=value';
    }
    
    setEnvironment(prev => ({ ...prev, [key]: value }));
    return '';
  };

  const handleEchoCommand = (args: string[]): string => {
    return args.join(' ').replace(/\$(\w+)/g, (match, varName) => {
      return environment[varName] || match;
    });
  };

  const handleHistoryCommand = (): string => {
    return commandHistory
      .map((cmd, index) => `${(index + 1).toString().padStart(4)} ${cmd}`)
      .join('\n');
  };

  const handleGitLog = (): string => {
    return language === 'ar' ? 
      `commit a1b2c3d4e5f6 (HEAD -> main)
Author: ${environment.USER} <${user?.emailAddresses[0]?.emailAddress}>
Date:   ${new Date().toLocaleDateString()}

    إضافة ميزات تيرمينال متقدمة

commit f6e5d4c3b2a1
Author: Collaction <dev@collaction.io>
Date:   ${new Date(Date.now() - 86400000).toLocaleDateString()}

    تحسين واجهة المستخدم` :
      `commit a1b2c3d4e5f6 (HEAD -> main)
Author: ${environment.USER} <${user?.emailAddresses[0]?.emailAddress}>
Date:   ${new Date().toLocaleDateString()}

    Add advanced terminal features

commit f6e5d4c3b2a1
Author: Collaction <dev@collaction.io>
Date:   ${new Date(Date.now() - 86400000).toLocaleDateString()}

    Improve user interface`;
  };

  const handleGitStatus = (): string => {
    return language === 'ar' ? 
      `على الفرع main
فرعك محدث مع 'origin/main'.

لا شيء للالتزام، دليل العمل نظيف` :
      `On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean`;
  };

  // أوامر المحادثات (نفس الكود السابق مع تبسيط)
  const handleChatCommand = async (args: string[]): Promise<string> => {
    if (args.length === 0 || args[0] === 'list') {
      try {
        await loadUserChats();
        const chatsNode = getNodeAtPath('/home/user/chats');
        if (!chatsNode?.children || Object.keys(chatsNode.children).length === 0) {
          return language === 'ar' ? 
            '📭 لا توجد محادثات محفوظة في ~/chats' :
            '📭 No saved conversations in ~/chats';
        }
        
        const chatFiles = Object.values(chatsNode.children)
          .filter(file => file.name.endsWith('.json'))
          .sort((a, b) => (b.modified?.getTime() || 0) - (a.modified?.getTime() || 0));
        
        const chatList = chatFiles.map((file, index) => {
          const date = file.modified?.toLocaleDateString() || 'Unknown';
          const size = file.size ? `${Math.round(file.size / 1024)}KB` : '0KB';
          const number = (index + 1).toString().padStart(2);
          return `${number}. ${file.name.padEnd(25)} ${date.padEnd(12)} ${size.padStart(6)}`;
        }).join('\n');
        
        return language === 'ar' ? 
          `💬 المحادثات المحفوظة (${chatFiles.length})\n\n${'#'.padEnd(3)} ${'الملف'.padEnd(25)} ${'التاريخ'.padEnd(12)} ${'الحجم'.padStart(6)}\n${'-'.repeat(50)}\n${chatList}\n\n💡 استخدم: chat view <filename>` :
          `💬 Saved Conversations (${chatFiles.length})\n\n${'#'.padEnd(3)} ${'File'.padEnd(25)} ${'Date'.padEnd(12)} ${'Size'.padStart(6)}\n${'-'.repeat(50)}\n${chatList}\n\n💡 Use: chat view <filename>`;
      } catch (error) {
        return language === 'ar' ? 
          'خطأ في تحميل المحادثات' :
          'Error loading conversations';
      }
    }
    
    // تنفيذ أوامر المحادثات الأخرى
    return language === 'ar' ? 
      `أمر المحادثة "${args[0]}" قيد التطوير` :
      `Chat command "${args[0]}" under development`;
  };

  // أوامر MCP (مبسطة)
  const handleMcpCommand = async (args: string[]): Promise<string> => {
    if (args.length === 0 || args[0] === 'list') {
      return language === 'ar' ? 
        `🔌 خوادم MCP النشطة:

📡 filesystem-server
  📊 الحالة: 🟢 متصل
  🔧 الأدوات: 12

📡 web-search
  📊 الحالة: 🔴 منقطع
  🔧 الأدوات: 5` :
        `🔌 Active MCP Servers:

📡 filesystem-server
  📊 Status: 🟢 connected
  🔧 Tools: 12

📡 web-search
  📊 Status: 🔴 disconnected
  🔧 Tools: 5`;
    }
    
    return language === 'ar' ? 
      `أمر MCP "${args[0]}" قيد التطوير` :
      `MCP command "${args[0]}" under development`;
  };

  const handleNanoCommand = async (args: string[]): Promise<string> => {
    if (args.length === 0) {
      return language === 'ar' ? 
        'nano: يجب تحديد اسم الملف. استخدم: nano <filename>' :
        'nano: missing filename. Usage: nano <filename>';
    }

    const filename = args[0];
    let filePath = filename.startsWith('/') ? filename : currentPath + '/' + filename;
    
    if (!isPathSafe(filePath)) {
      return language === 'ar' ? 
        `nano: لا يمكن الوصول '${filename}': صلاحية مرفوضة` :
        `nano: cannot access '${filename}': Permission denied`;
    }
    
    setIsNanoMode(true);
    
    const node = getNodeAtPath(filePath);
    
    if (node) {
      if (node.type !== 'file') {
        setIsNanoMode(false);
        return language === 'ar' ? 
          `nano: ${filename}: هذا مجلد` :
          `nano: ${filename}: Is a directory`;
      }
      
      setNanoFile({
        name: filename,
        content: node.content || '',
        isNew: false
      });
    } else {
      setNanoFile({ 
        name: filename, 
        content: '', 
        isNew: true 
      });
    }
    
    return language === 'ar' ? 
      `📝 فتح محرر النصوص للملف: ${filename}\n\n⌨️ اختصارات المحرر:\n  Ctrl+O : حفظ الملف\n  Ctrl+X : الخروج من المحرر` :
      `📝 Opening text editor for: ${filename}\n\n⌨️ Editor shortcuts:\n  Ctrl+O : Save file\n  Ctrl+X : Exit editor`;
  };

  // تحسين الإكمال التلقائي
  const getTabCompletion = (currentInput: string): string => {
    const parts = currentInput.split(' ');
    const command = parts[0].toLowerCase();
    
    if (parts.length === 1) {
      const matches = availableCommands.filter(cmd => cmd.startsWith(command));
      if (matches.length === 1) {
        return matches[0] + ' ';
      } else if (matches.length > 1) {
        setCommands(prev => [...prev, {
          input: '',
          output: `💡 ${language === 'ar' ? 'الأوامر المتاحة:' : 'Available commands:'} ${matches.join(', ')}`,
          timestamp: new Date()
        }]);
        return currentInput;
      }
    } else if (parts.length >= 2) {
      const lastArg = parts[parts.length - 1];
      
      // إكمال مسارات الملفات
      if (['ls', 'cd', 'cat', 'nano', 'rm', 'cp', 'mv', 'find'].includes(command)) {
        let basePath = currentPath;
        let prefix = lastArg;
        
        if (lastArg.includes('/')) {
          const lastSlash = lastArg.lastIndexOf('/');
          basePath = lastArg.startsWith('/') ? 
            lastArg.substring(0, lastSlash) || '/' : 
            currentPath + '/' + lastArg.substring(0, lastSlash);
          prefix = lastArg.substring(lastSlash + 1);
        }
        
        const node = getNodeAtPath(basePath);
        if (node?.children) {
          const matches = Object.keys(node.children)
            .filter(name => name.startsWith(prefix))
            .filter(name => !name.startsWith('.') || lastArg.startsWith('.'));
          
          if (matches.length === 1) {
            const fullPath = lastArg.includes('/') ? 
              lastArg.substring(0, lastArg.lastIndexOf('/') + 1) + matches[0] :
              matches[0];
            return parts.slice(0, -1).join(' ') + ' ' + fullPath + 
              (node.children[matches[0]].type === 'directory' ? '/' : '');
          }
        }
      }
      
      // إكمال أوامر فرعية
      if (command === 'chat') {
        const chatMatches = chatSubCommands.filter(sub => sub.startsWith(lastArg));
        if (chatMatches.length === 1) {
          return parts.slice(0, -1).join(' ') + ' ' + chatMatches[0] + ' ';
        }
      }
      
      if (command === 'mcp') {
        const mcpMatches = mcpSubCommands.filter(sub => sub.startsWith(lastArg));
        if (mcpMatches.length === 1) {
          return parts.slice(0, -1).join(' ') + ' ' + mcpMatches[0] + ' ';
        }
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
    } else if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      setCurrentCommand('');
      setCommands(prev => [...prev, {
        input: currentCommand + '^C',
        output: '',
        timestamp: new Date()
      }]);
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      setCommands([]);
    } else if (e.ctrlKey && e.key === 'r') {
      e.preventDefault();
      // البحث في تاريخ الأوامر
      const searchTerm = prompt(language === 'ar' ? 'ابحث في تاريخ الأوامر:' : 'Search command history:');
      if (searchTerm) {
        const matches = commandHistory.filter(cmd => cmd.includes(searchTerm));
        if (matches.length > 0) {
          setCurrentCommand(matches[matches.length - 1]);
        }
      }
    }
  };


  const exitNano = () => {
    if (nanoFile.content !== (getNodeAtPath(currentPath + '/' + nanoFile.name)?.content || '')) {
      const shouldSave = window.confirm(
        language === 'ar' ? 
          'هناك تغييرات غير محفوظة. هل تريد الحفظ قبل الخروج؟' :
          'There are unsaved changes. Save before exit?'
      );
      
      if (shouldSave) {
        saveNanoFile();
      }
    }
    
    setIsNanoMode(false);
    setNanoFile({ name: '', content: '', isNew: false });
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const saveNanoFile = () => {
    const fullPath = currentPath + '/' + nanoFile.name;
    const node = getNodeAtPath(fullPath);
    
    if (node) {
      // Update existing file
      node.content = nanoFile.content;
    } else {
      // Create new file
      const pathParts = fullPath.split('/').filter(Boolean);
      const fileName = pathParts.pop()!;
      const dirPath = '/' + pathParts.join('/');
      const parentNode = getNodeAtPath(dirPath);
      
      if (parentNode && parentNode.type === 'directory') {
        parentNode.children = parentNode.children || {};
        parentNode.children[fileName] = {
          name: fileName,
          type: 'file',
          permissions: '-rw-r--r--',
          owner: environment.USER,
          modified: new Date(),
          size: nanoFile.content.length,
          content: nanoFile.content
        };
      }
    }
    
    // Show save confirmation
    setCommands(prev => [...prev, {
      input: '',
      output: language === 'ar' ? 
        `تم حفظ الملف: ${nanoFile.name}` :
        `File saved: ${nanoFile.name}`,
      timestamp: new Date()
    }]);
  };

  const handleCommand = async () => {
    if (!currentCommand.trim()) return;

    setEnvironment(prev => ({ ...prev, PWD: currentPath }));

    const output = await executeCommand(currentCommand);
    
    setCommands(prev => [...prev, {
      input: currentCommand,
      output,
      timestamp: new Date()
    }]);

    setCurrentCommand('');
    setHistoryIndex(-1);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const copyToClipboard = (text: string) => {
    const allContent = commands
      .filter(cmd => cmd.input || cmd.output)
      .map(cmd => {
        const prompt = cmd.input ? `${environment.USER}@collaction:${getDisplayPath()}$ ${cmd.input}` : '';
        return [prompt, cmd.output].filter(Boolean).join('\n');
      })
      .join('\n\n');
    
    navigator.clipboard.writeText(allContent).then(() => {
      setCommands(prev => [...prev, {
        input: '',
        output: language === 'ar' ? 
          '📋 تم نسخ محتوى التيرمينال إلى الحافظة' :
          '📋 Terminal content copied to clipboard',
        timestamp: new Date()
      }]);
    });
  };

  const getDisplayPath = () => {
    return currentPath === '/home/user' ? '~' : currentPath.replace('/home/user', '~');
  };

  const getPrompt = () => {
    const user = environment.USER;
    const host = 'collaction';
    const path = getDisplayPath();
    
    // Oh My Zsh style prompt with colors and git status
    const gitBranch = '(main)';
    const promptSymbol = '➜';
    
    return `${promptSymbol} ${user}@${host}:${path} ${gitBranch}`;
  };

  const handleNanoKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === 'x') {
      e.preventDefault();
      exitNano();
    } else if (e.ctrlKey && e.key === 'o') {
      e.preventDefault();
      saveNanoFile();
    }
  };

  return (
    <StarsLayout>
      <TransparentLayout>
        <div className="min-h-screen flex justify-center items-center text-green-400 font-mono">
          <div className={'transition-all duration-300 ' + (isMaximized ? 'fixed inset-0 z-50' : 'container mx-auto p-4')}>
            <div className={'bg-black border border-green-500 rounded-lg overflow-hidden shadow-2xl ' + (isMinimized ? 'h-12' : 'h-[700px]')}>
              {/* Terminal Header */}
              <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-green-500">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-semibold text-white">
                    {language === 'ar' ? 'تيرمينال Collaction الآمن مع Oh My Zsh' : 'Collaction Secure Terminal with Oh My Zsh'}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>{getPrompt()}</span>
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>{language === 'ar' ? 'آمن' : 'Secure'}</span>
                  </span>
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
                    title={language === 'ar' ? 'تصغير' : 'Minimize'}
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsMaximized(!isMaximized)}
                    className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
                    title={language === 'ar' ? 'تكبير' : 'Maximize'}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => copyToClipboard('')}
                    className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
                    title={language === 'ar' ? 'نسخ المحتوى' : 'Copy content'}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400"
                    title={language === 'ar' ? 'إغلاق' : 'Close'}
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
                              ('محرر النصوص - ' + nanoFile.name + ' ' + (nanoFile.isNew ? '(ملف جديد)' : '(معدّل)')) :
                              ('Text Editor - ' + nanoFile.name + ' ' + (nanoFile.isNew ? '(New File)' : '(Modified)'))
                            }
                          </span>
                          <span className="text-xs text-gray-300">
                            ^O:{language === 'ar' ? 'حفظ' : 'Save'} | ^X:{language === 'ar' ? 'خروج' : 'Exit'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Nano Content */}
                      <textarea
                        value={nanoFile.content}
                        onChange={(e) => setNanoFile(prev => ({ ...prev, content: e.target.value }))}
                        onKeyDown={handleNanoKeyDown}
                        className="flex-1 bg-black text-green-400 font-mono text-sm p-4 border-none outline-none resize-none leading-relaxed"
                        placeholder={language === 'ar' ? 'اكتب محتوى الملف هنا...' : 'Type file content here...'}
                        autoFocus
                        spellCheck={false}
                      />
                      
                      {/* Nano Footer */}
                      <div className="bg-gray-700 px-4 py-1 text-xs text-gray-300 border-t border-gray-600">
                        <div className="flex justify-between">
                          <span>
                            {language === 'ar' ? 
                              ('الأسطر: ' + nanoFile.content.split('\n').length + ' | الأحرف: ' + nanoFile.content.length + ' | المسار: ' + currentPath + '/' + nanoFile.name) :
                              ('Lines: ' + nanoFile.content.split('\n').length + ' | Chars: ' + nanoFile.content.length + ' | Path: ' + currentPath + '/' + nanoFile.name)
                            }
                          </span>
                          <span className="text-yellow-400">
                            {nanoFile.isNew ? 
                              (language === 'ar' ? 'ملف جديد' : 'New File') : 
                              (language === 'ar' ? 'محفوظ' : 'Saved')
                            }
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
                        style={{ scrollBehavior: 'smooth' }}
                      >
                        {commands.map((cmd, index) => (
                          <div key={index} className="space-y-1">
                            {cmd.input && (
                              <div className="flex items-center space-x-2">
                                <span className="text-cyan-400 text-xs">
                                  <span className="text-purple-400">➜</span> {environment.USER}@collaction:<span className="text-blue-400">{getDisplayPath()}</span> <span className="text-yellow-400">(main)</span>$
                                </span>
                                <span className="text-white">{cmd.input}</span>
                                <span className="text-gray-500 text-xs">
                                  [{cmd.timestamp.toLocaleTimeString()}]
                                </span>
                              </div>
                            )}
                            {cmd.output && (
                              <pre className="text-green-400 whitespace-pre-wrap font-mono ml-6 leading-relaxed">
                                {cmd.output}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Input Area */}
                      <div className="border-t border-green-500 p-4 bg-gray-900">
                        <div className="flex items-center space-x-2">
                          <span className="text-cyan-400 text-sm font-bold">
                            <span className="text-purple-400">➜</span> {environment.USER}@collaction:<span className="text-blue-400">{getDisplayPath()}</span> <span className="text-yellow-400">(main)</span>$
                          </span>
                          <input
                            ref={inputRef}
                            type="text"
                            value={currentCommand}
                            onChange={(e) => setCurrentCommand(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-transparent border-none outline-none text-white text-sm font-mono"
                            placeholder={language === 'ar' ? 'اكتب أمر... (Tab: إكمال، ↑↓: التاريخ، Ctrl+R: بحث)' : 'Type command... (Tab: complete, ↑↓: history, Ctrl+R: search)'}
                            autoComplete="off"
                            spellCheck={false}
                          />
                        </div>
                        
                        {/* Status Bar */}
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span>📂 {Object.keys(getNodeAtPath(currentPath)?.children || {}).length} items</span>
                            <span>📚 {commandHistory.length} commands</span>
                            <span>⏰ {new Date().toLocaleTimeString()}</span>
                            <span>🐚 {environment.SHELL.split('/').pop()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-green-400">●</span>
                            <span>{language === 'ar' ? 'متصل بأمان مع Oh My Zsh' : 'Securely connected with Oh My Zsh'}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </TransparentLayout>
    </StarsLayout>
  );
};

export default TerminalPage;
