'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo, memo } from 'react';
import {
    FileText,
    Copy,
    Download,
    Maximize2,
    Minimize2,
    Check,
    Eye,
    EyeOff,
    Edit3,
    Save,
    XCircle,
    Code
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Enhanced CodeBlock Component
interface CodeBlockProps {
    code: string;
    language: string;
    onCodeEdit?: (originalCode: string, editedCode: string) => void;
    onPreviewHtml?: (code: string) => void;
}

// Message Content Renderer interface
interface MessageContentRendererProps {
    content: string;
}

// Type for timeout references
type TimeoutRef = ReturnType<typeof setTimeout>;

// Format code with Prettier (lazy-loaded)
const formatCode = async (code: string, language: string): Promise<string> => {
    try {
        const langLower = language.toLowerCase();

        // Dynamic imports to reduce bundle size
        const prettierMod = await import('prettier/standalone');
        const prettier = (prettierMod && (prettierMod as any).default) ? (prettierMod as any).default : prettierMod;
        let parser: string;
        let plugins: any[] = [];

        switch (langLower) {
            case 'javascript':
            case 'js':
            case 'jsx':
                parser = 'babel';
                const parserBabel = await import('prettier/plugins/babel');
                const parserEstree = await import('prettier/plugins/estree');
                plugins = [
                    (parserBabel as any).default || parserBabel, 
                    (parserEstree as any).default || parserEstree
                ];
                break;
            case 'typescript':
            case 'ts':
            case 'tsx':
                parser = 'typescript';
                const parserTypeScript = await import('prettier/plugins/typescript');
                const parserEstreeTS = await import('prettier/plugins/estree');
                plugins = [
                    (parserTypeScript as any).default || parserTypeScript, 
                    (parserEstreeTS as any).default || parserEstreeTS
                ];
                break;
            case 'json':
                parser = 'json';
                const parserBabelJSON = await import('prettier/plugins/babel');
                const parserEstreeJSON = await import('prettier/plugins/estree');
                plugins = [
                    (parserBabelJSON as any).default || parserBabelJSON, 
                    (parserEstreeJSON as any).default || parserEstreeJSON
                ];
                break;
            case 'html':
            case 'htm':
                parser = 'html';
                const parserHtml = await import('prettier/plugins/html');
                plugins = [(parserHtml as any).default || parserHtml];
                break;
            case 'css':
            case 'scss':
            case 'less':
                parser = 'css';
                const parserCss = await import('prettier/plugins/postcss');
                plugins = [(parserCss as any).default || parserCss];
                break;
            case 'markdown':
            case 'md':
                parser = 'markdown';
                const parserMarkdown = await import('prettier/plugins/markdown');
                plugins = [(parserMarkdown as any).default || parserMarkdown];
                break;
            default:
                return code; // Return original code if no parser available
        }

        const formatted = await prettier.format(code, {
            parser,
            plugins,
            semi: true,
            singleQuote: true,
            tabWidth: 2,
            trailingComma: 'es5' as const,
            printWidth: 80,
        });

        return formatted;
    } catch (error) {
        console.warn('Failed to format code:', error);
        return code; // Return original code on error
    }
};

// Simple syntax highlighting - Fixed version
const highlightCode = (line: string, language: string): React.ReactNode => {
    try {
        const lang = language.toLowerCase();
        
        if (lang === 'python' || lang === 'py') {
            return highlightPythonLine(line);
        } else if (lang === 'javascript' || lang === 'js') {
            return highlightJavaScript(line);
        } else if (lang === 'json') {
            return highlightJSON(line);
        }

        return React.createElement('span', { style: { color: 'var(--syntax-variable)' } }, line);
    } catch (error) {
        console.warn('Highlighting failed for line:', line, error);
        return React.createElement('span', { style: { color: 'var(--syntax-variable)' } }, line);
    }
};

const highlightPythonLine = (line: string): React.ReactNode => {
    try {
        // Check if line is a comment first
        if (line.trim().startsWith('#')) {
            return React.createElement('span', { 
                style: { 
                    color: 'var(--syntax-comment)',
                    fontStyle: 'italic' 
                } 
            }, line);
        }

        // Handle string literals first to avoid conflicts
        const stringRegex = /(['"])((?:\\.|(?!\1)[^\\])*)\1/g;
        if (stringRegex.test(line)) {
            const parts = [];
            let lastIndex = 0;
            let match;
            
            stringRegex.lastIndex = 0;
            while ((match = stringRegex.exec(line)) !== null) {
                // Add text before string
                if (match.index > lastIndex) {
                    const beforeString = line.substring(lastIndex, match.index);
                    parts.push(highlightKeywordsInText(beforeString));
                }
                
                // Add string
                parts.push(React.createElement('span', { 
                    key: `str-${match.index}`,
                    style: { color: 'var(--syntax-string)' } 
                }, match[0]));
                
                lastIndex = match.index + match[0].length;
            }
            
            // Add remaining text
            if (lastIndex < line.length) {
                const remaining = line.substring(lastIndex);
                parts.push(highlightKeywordsInText(remaining));
            }
            
            return React.createElement('span', { style: { color: 'var(--syntax-variable)' } }, ...parts);
        }
        
        // No strings found, just highlight keywords
        return highlightKeywordsInText(line);
        
    } catch (error) {
        console.warn('Python highlighting failed:', error);
        return React.createElement('span', { style: { color: 'var(--syntax-variable)' } }, line);
    }
};

const highlightKeywordsInText = (text: string): React.ReactNode => {
    const keywords = /\b(def|class|if|else|elif|for|while|return|import|from|try|except|finally|with|async|await|yield|True|False|None|and|or|not|is|in|as|pass|break|continue|lambda|global|nonlocal)\b/g;
    
    const parts = text.split(keywords);
    const elements = [];
    
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part) continue;
        
        if (keywords.test(part)) {
            elements.push(React.createElement('span', { 
                key: i,
                style: { 
                    color: 'var(--syntax-keyword)',
                    fontWeight: 'bold' 
                } 
            }, part));
        } else {
            elements.push(part);
        }
        
        // Reset regex
        keywords.lastIndex = 0;
    }
    
    return elements.length > 1 
        ? React.createElement('span', { style: { color: 'var(--syntax-variable)' } }, ...elements)
        : React.createElement('span', { style: { color: 'var(--syntax-variable)' } }, text);
};

const highlightJavaScript = (line: string): React.ReactNode => {
    return React.createElement('span', { style: { color: 'var(--syntax-variable)' } }, line);
};

const highlightJSON = (line: string): React.ReactNode => {
    return React.createElement('span', { style: { color: 'var(--syntax-variable)' } }, line);
};

// Message Content Renderer with CodeBlock integration
const MessageContentRenderer: React.FC<MessageContentRendererProps> = memo(({ content }) => {
    const parseContent = useCallback((text: string) => {
        const parts: { type: 'text' | 'code'; content: string; language?: string }[] = [];
        const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
        let lastIndex = 0;
        let match;

        while ((match = codeBlockRegex.exec(text)) !== null) {
            // Add text before code block
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: text.slice(lastIndex, match.index)
                });
            }

            // Add code block with debug logging
            const language = match[1] || 'text';
            const codeContent = match[2].trim();

            console.log('Code block detected:', { language, contentLength: codeContent.length });

            parts.push({
                type: 'code',
                content: codeContent,
                language: language
            });

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < text.length) {
            parts.push({
                type: 'text',
                content: text.slice(lastIndex)
            });
        }

        return parts.length > 0 ? parts : [{ type: 'text' as const, content: text }];
    }, []);

    const parts = parseContent(content);

    return React.createElement('div', null,
        parts.map((part, index) =>
            React.createElement('div', { key: index },
                part.type === 'code' 
                    ? React.createElement(CodeBlock, {
                        code: part.content,
                        language: part.language || 'text'
                    })
                    : React.createElement('div', { 
                        className: 'whitespace-pre-wrap' 
                    }, part.content)
            )
        )
    );
});

MessageContentRenderer.displayName = 'MessageContentRenderer';

const CodeBlock: React.FC<CodeBlockProps> = memo(({ code, language, onCodeEdit, onPreviewHtml }) => {
    const [showCopySuccess, setShowCopySuccess] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedCode, setEditedCode] = useState(code);
    const [formatError, setFormatError] = useState<string>('');
    const { language: currentLanguage } = useLanguage();

    // Fixed timeout refs with browser-compatible types
    const localTimeoutRefs = useRef<{
        copySuccess?: TimeoutRef;
        urlCleanup?: TimeoutRef[];
    }>({ urlCleanup: [] });

    // URL refs for proper cleanup
    const urlRefs = useRef<string[]>([]);

    // Cleanup timeouts and URLs on unmount
    useEffect(() => {
        return () => {
            // Clear timeouts
            if (localTimeoutRefs.current.copySuccess) {
                clearTimeout(localTimeoutRefs.current.copySuccess);
            }
            localTimeoutRefs.current.urlCleanup?.forEach(timeout => clearTimeout(timeout));
            
            // Revoke any lingering URLs
            urlRefs.current.forEach(url => {
                try {
                    URL.revokeObjectURL(url);
                } catch (error) {
                    console.warn('Failed to revoke URL:', error);
                }
            });
            urlRefs.current = [];
        };
    }, []);

    // Sync editedCode when code prop changes (unless editing)
    useEffect(() => {
        if (!isEditing) {
            setEditedCode(code);
        }
    }, [code, isEditing]);

    const lines = code.split('\n');
    const shouldTruncate = lines.length > 20;

    // Memoized highlighted lines for better performance
    const highlightedLines = useMemo(() => 
        lines.map(line => highlightCode(line, language)), 
        [code, language]
    );

    // Function to open HTML in new tab with proper cleanup
    const openHtmlInNewTab = useCallback((htmlCode: string) => {
        const blob = new Blob([htmlCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        urlRefs.current.push(url);
        
        const newTab = window.open(url, '_blank');
        if (newTab) {
            try {
                newTab.opener = null; // Security: prevent reverse tabnabbing
            } catch (error) {
                console.warn('Could not set opener to null:', error);
            }
        }

        // Cleanup URL after delay
        const cleanupTimeout = setTimeout(() => {
            try {
                URL.revokeObjectURL(url);
                urlRefs.current = urlRefs.current.filter(u => u !== url);
            } catch (error) {
                console.warn('Failed to revoke HTML blob URL:', error);
            }
        }, 5000);

        localTimeoutRefs.current.urlCleanup?.push(cleanupTimeout);
    }, []);

    const copyCode = useCallback(async () => {
        const codeToCopy = isEditing ? editedCode : code;

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

        const success = await copyToClipboard(codeToCopy);
        if (success) {
            setShowCopySuccess(true);
            // Clear previous timeout if exists
            if (localTimeoutRefs.current.copySuccess) {
                clearTimeout(localTimeoutRefs.current.copySuccess);
            }
            localTimeoutRefs.current.copySuccess = setTimeout(() => setShowCopySuccess(false), 2000);
        }
    }, [isEditing, editedCode, code]);

    const formatCodeHandler = useCallback(async () => {
        const codeToFormat = isEditing ? editedCode : code;
        setFormatError(''); // Clear previous errors
        
        try {
            const formatted = await formatCode(codeToFormat, language);
            if (isEditing) {
                setEditedCode(formatted);
            } else {
                setEditedCode(formatted);
                setIsEditing(true);
            }
        } catch (error) {
            console.error('Failed to format code:', error);
            const errorMessage = currentLanguage === 'ar' 
                ? 'فشل في تنسيق الكود. تحقق من صحة الكود.' 
                : 'Failed to format code. Please check your syntax.';
            setFormatError(errorMessage);
            
            // Clear error after 5 seconds
            setTimeout(() => setFormatError(''), 5000);
        }
    }, [isEditing, editedCode, code, language, currentLanguage]);

    const downloadCode = useCallback(() => {
        const codeToCopy = isEditing ? editedCode : code;
        const fileExtension = getFileExtension(language);
        const fileName = `code.${fileExtension}`;

        const blob = new Blob([codeToCopy], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        urlRefs.current.push(url);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup URL to prevent memory leak
        const cleanupTimeout = setTimeout(() => {
            try {
                URL.revokeObjectURL(url);
                urlRefs.current = urlRefs.current.filter(u => u !== url);
            } catch (error) {
                console.warn('Failed to revoke download URL:', error);
            }
        }, 1000);

        localTimeoutRefs.current.urlCleanup?.push(cleanupTimeout);
    }, [isEditing, editedCode, code, language]);

    const getFileExtension = useCallback((lang: string) => {
        const extensions: { [key: string]: string } = {
            javascript: 'js',
            typescript: 'ts',
            python: 'py',
            java: 'java',
            cpp: 'cpp',
            c: 'c',
            csharp: 'cs',
            php: 'php',
            ruby: 'rb',
            go: 'go',
            rust: 'rs',
            kotlin: 'kt',
            swift: 'swift',
            html: 'html',
            css: 'css',
            scss: 'scss',
            json: 'json',
            xml: 'xml',
            yaml: 'yml',
            markdown: 'md',
            bash: 'sh',
            powershell: 'ps1',
            sql: 'sql',
            r: 'r',
            matlab: 'm',
            jsx: 'jsx',
            tsx: 'tsx'
        };
        return extensions[lang.toLowerCase()] || 'txt';
    }, []);

    // Handle keyboard shortcuts in edit mode with macOS support
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isEditing) {
            e.preventDefault();
            if (onCodeEdit) {
                onCodeEdit(code, editedCode);
            }
            setIsEditing(false);
        }
        if (e.key === 'Escape' && isEditing) {
            setIsEditing(false);
            setEditedCode(code);
        }
    }, [isEditing, code, editedCode, onCodeEdit]);

    // Language display name with icons and colors
    const getLanguageDisplayName = useCallback((lang: string) => {
        const langMap: Record<string, { name: string; icon: string; color: string }> = {
            javascript: { name: 'JavaScript', icon: '⚡', color: '#f7df1e' },
            jsx: { name: 'React JSX', icon: '⚛️', color: '#61dafb' },
            tsx: { name: 'React TSX', icon: '⚛️', color: '#61dafb' },
            typescript: { name: 'TypeScript', icon: '🔷', color: '#3178c6' },
            json: { name: 'JSON', icon: '📄', color: '#00d2ff' },
            csv: { name: 'CSV', icon: '📊', color: '#00c851' },
            md: { name: 'Markdown', icon: '📝', color: '#083fa1' },
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
    }, []);

    const langInfo = getLanguageDisplayName(language);

    return React.createElement('div', { 
        className: `relative group my-6 rounded-lg overflow-hidden shadow-2xl ${isFullscreen ? 'fixed inset-4 z-50' : ''}`,
        style: { 
            backgroundColor: 'var(--codeblock-bg)', 
            border: '1px solid var(--codeblock-border)' 
        }
    },
        React.createElement('div', { 
            className: 'flex items-center justify-between px-4 py-3 border-b',
            style: { 
                backgroundColor: 'var(--codeblock-header-bg)', 
                borderBottomColor: 'var(--codeblock-border)' 
            }
        },
            React.createElement('div', { 
                className: 'flex items-center space-x-3'
            },
                React.createElement('div', { 
                    className: 'flex space-x-1.5'
                },
                    React.createElement('div', { 
                        className: 'w-3 h-3 rounded-full bg-red-500'
                    }),
                    React.createElement('div', { 
                        className: 'w-3 h-3 rounded-full bg-yellow-500'
                    }),
                    React.createElement('div', { 
                        className: 'w-3 h-3 rounded-full bg-green-500'
                    })
                ),
                
                React.createElement('div', { 
                    className: 'flex items-center space-x-2'
                },
                    React.createElement('div', { 
                        className: 'flex items-center space-x-2 bg-background  px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-700'
                    },
                        React.createElement('span', { 
                            className: 'text-sm'
                        }, langInfo.icon),
                        React.createElement(FileText, { 
                            className: 'w-4 h-4', 
                            style: { color: langInfo.color } 
                        }),
                        React.createElement('span', { 
                            className: 'text-sm font-medium text-foreground'
                        }, langInfo.name)
                    ),
                    lines.length > 1 && React.createElement('div', { 
                        className: 'text-s text-[#f5f5f5] bg-background dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700'
                    }, `${lines.length} lines`)
                )
            ),
            React.createElement('div', { 
                className: 'flex items-center space-x-2'
            },
                (language.toLowerCase() === 'html' ||
                language.toLowerCase() === 'htm' ||
                code.trim().toLowerCase().startsWith('<!doctype') ||
                code.trim().toLowerCase().startsWith('<html')) && React.createElement('button', { 
                    onClick: () => openHtmlInNewTab(code),
                    className: 'ml-4 flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-foreground rounded-md transition-colors',
                    title: currentLanguage === 'ar' ? 'فتح في تاب جديد' : 'Open in new tab',
                    'aria-label': currentLanguage === 'ar' ? 'معاينة HTML في تاب جديد' : 'Preview HTML in new tab'
                },
                    React.createElement(Eye, { 
                        className: 'w-4 h-4'
                    }),
                    React.createElement('span', { 
                        className: 'text-sm font-medium'
                    }, currentLanguage === 'ar' ? 'معاينة' : 'Preview')
                ),
                shouldTruncate && React.createElement('button', { 
                    onClick: () => setIsExpanded(!isExpanded),
                    className: 'p-2 text-gray-400 hover:text-foreground hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105',
                    title: isExpanded ? (currentLanguage === 'ar' ? 'إخفاء' : 'Hide') : (currentLanguage === 'ar' ? 'عرض الكامل' : 'Expand'),
                    'aria-label': isExpanded ? (currentLanguage === 'ar' ? 'إخفاء الكود الإضافي' : 'Hide additional code') : (currentLanguage === 'ar' ? 'عرض كامل الكود' : 'Show full code')
                },
                    isExpanded ? React.createElement(EyeOff, { 
                        className: 'w-4 h-4'
                    }) : React.createElement(Eye, { 
                        className: 'w-4 h-4'
                    })
                ),
                React.createElement('button', { 
                    onClick: () => setIsFullscreen(!isFullscreen),
                    className: 'p-2 text-gray-400 hover:text-foreground hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105',
                    title: isFullscreen ? (currentLanguage === 'ar' ? 'تصغير' : 'Minimize') : (currentLanguage === 'ar' ? 'ملء الشاشة' : 'Fullscreen'),
                    'aria-label': isFullscreen ? (currentLanguage === 'ar' ? 'تصغير النافذة' : 'Minimize window') : (currentLanguage === 'ar' ? 'ملء الشاشة' : 'Open in fullscreen')
                },
                    isFullscreen ? React.createElement(Minimize2, { 
                        className: 'w-4 h-4'
                    }) : React.createElement(Maximize2, { 
                        className: 'w-4 h-4'
                    })
                ),
                !isEditing ? React.createElement('button', { 
                    onClick: () => {
                        setIsEditing(true);
                        setEditedCode(code);
                    },
                    className: 'p-1 transition-colors',
                    style: {
                        color: 'var(--codeblock-text-muted)'
                    },
                    title: currentLanguage === 'ar' ? 'تحرير الكود' : 'Edit code',
                    'aria-label': currentLanguage === 'ar' ? 'تحرير الكود' : 'Edit code'
                },
                    React.createElement(Edit3, { 
                        className: 'w-4 h-4'
                    })
                ) : React.createElement('div', { 
                    className: 'flex items-center space-x-1'
                },
                    React.createElement('button', { 
                        onClick: () => {
                            if (onCodeEdit) {
                                onCodeEdit(code, editedCode);
                            }
                            setIsEditing(false);
                        },
                        className: 'p-1 text-gray-400 hover:text-green-400 transition-colors',
                        title: currentLanguage === 'ar' ? 'حفظ التغييرات' : 'Save changes',
                        'aria-label': currentLanguage === 'ar' ? 'حفظ التغييرات' : 'Save changes'
                    },
                        React.createElement(Save, { 
                            className: 'w-4 h-4'
                        })
                    ),
                    React.createElement('button', { 
                        onClick: () => {
                            setIsEditing(false);
                            setEditedCode(code);
                        },
                        className: 'p-1 text-gray-400 hover:text-red-400 transition-colors',
                        title: currentLanguage === 'ar' ? 'إلغاء التحرير' : 'Cancel editing',
                        'aria-label': currentLanguage === 'ar' ? 'إلغاء التحرير' : 'Cancel editing'
                    },
                        React.createElement(XCircle, { 
                            className: 'w-4 h-4'
                        })
                    )
                ),
                React.createElement('button', { 
                    onClick: copyCode,
                    className: 'flex items-center space-x-1 px-2 py-1 text-gray-400 hover:text-gray-200 transition-colors',
                    title: currentLanguage === 'ar' ? 'نسخ الكود' : 'Copy code',
                    'aria-label': currentLanguage === 'ar' ? 'نسخ الكود إلى الحافظة' : 'Copy code to clipboard'
                },
                    showCopySuccess ? React.createElement(Check, { 
                        className: 'w-4 h-4 text-green-400'
                    }) : React.createElement(Copy, { 
                        className: 'w-4 h-4'
                    })
                ),
                React.createElement('button', { 
                    onClick: downloadCode,
                    className: 'flex items-center space-x-1 px-2 py-1 text-gray-400 hover:text-gray-200 transition-colors',
                    title: currentLanguage === 'ar' ? 'تحميل الكود' : 'Download code',
                    'aria-label': currentLanguage === 'ar' ? 'تحميل الكود كملف' : 'Download code as file'
                },
                    React.createElement(Download, { 
                        className: 'w-4 h-4'
                    })
                )
            )
        ),
        React.createElement('div', { 
            className: `relative  ${shouldTruncate && !isExpanded && !isFullscreen ? 'overflow-hidden' : 'overflow-auto'}`
        },
            isEditing ? React.createElement('div', { 
                className: 'p-4'
            },
                React.createElement('textarea', { 
                    value: editedCode,
                    onChange: (e) => setEditedCode((e.target as HTMLTextAreaElement).value),
                    onKeyDown: handleKeyDown,
                    className: 'w-full h-64 text-sm font-mono rounded p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    style: {
                        backgroundColor: 'var(--codeblock-editor-bg)',
                        color: 'var(--codeblock-text)',
                        borderColor: 'var(--codeblock-border)'
                    },
                    placeholder: currentLanguage === 'ar' ? 'قم بتحرير الكود هنا...' : 'Edit your code here...',
                    autoFocus: true,
                    'aria-label': currentLanguage === 'ar' ? 'محرر الكود' : 'Code editor'
                }),
                React.createElement('div', { 
                    className: 'mt-2 text-xs text-gray-400 flex items-center justify-between'
                },
                    React.createElement('span', null,
                        currentLanguage === 'ar'
                            ? `${editedCode.length} حرف`
                            : `${editedCode.length} characters`
                    ),
                    React.createElement('span', null,
                        currentLanguage === 'ar'
                            ? 'استخدم Ctrl+Enter للحفظ السريع'
                            : 'Use Ctrl+Enter for quick save'
                    )
                )
            ) :
                // عرض الكود كاملاً عند التوسع
                React.createElement('div', { 
                    className: 'p-5'
                },
                    React.createElement('pre', { 
                        className: 'text-sm font-mono leading-relaxed'
                    },
                        React.createElement('code', null,
                            (shouldTruncate && !isExpanded && !isFullscreen ? highlightedLines.slice(0, 20) : highlightedLines).map((highlightedLine, index) =>
                                React.createElement('div', { 
                                    key: index,
                                    className: 'codeblock-line flex items-start transition-colors duration-150 group/line',
                    style: {
                        ':hover': {
                            backgroundColor: 'var(--codeblock-button-hover)'
                        }
                    }
                                },
                                    React.createElement('span', { 
                                        className: 'codeblock-line-number text-xs mr-4 mt-0.5 select-none min-w-[3rem] text-right font-medium',
                                        style: { color: 'var(--codeblock-text-muted)' }
                                    }, `${String(index + 1).padStart(3, ' ')}`),
                                    React.createElement('span', { 
                                        className: 'flex-1',
                                        style: { color: 'var(--codeblock-text)' }
                                    }, highlightedLine)
                                )
                            )
                        )
                    ),
                    showCopySuccess && React.createElement('div', { 
                        className: 'absolute top-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium animate-pulse shadow-lg'
                    },
                        React.createElement('div', { 
                            className: 'flex items-center space-x-2'
                        },
                            React.createElement(Check, { 
                                className: 'w-4 h-4'
                            }),
                            React.createElement('span', null,
                                currentLanguage === 'ar' ? 'تم النسخ!' : 'Copied!'
                            )
                        )
                    ),
                    formatError && React.createElement('div', { 
                        className: 'absolute top-5 right-5 px-4 py-2 rounded-lg text-sm font-medium shadow-lg',
                        style: { 
                            backgroundColor: 'var(--danger)', 
                            color: 'var(--codeblock-bg)' 
                        }
                    },
                        React.createElement('div', { 
                            className: 'flex items-center space-x-2'
                        },
                            React.createElement(XCircle, { 
                                className: 'w-4 h-4'
                            }),
                            React.createElement('span', null, formatError)
                        )
                    ),
                    shouldTruncate && !isExpanded && !isFullscreen && React.createElement('div', { 
                        className: 'absolute bottom-0 left-0 right-0 h-20  bg-gradient-to-t from-black via-black/95 to-transparent flex items-end justify-center pb-4'
                    },
                        React.createElement('button', { 
                            onClick: () => setIsExpanded(true),
                            className: 'px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-[#f5f5f5] text-sm rounded-lg transition-all duration-200 shadow-lg transform hover:scale-105 font-medium',
                            'aria-label': currentLanguage === 'ar' ? `عرض ${lines.length} سطر إضافي` : `Show ${lines.length} more lines`
                        },
                            React.createElement('div', { 
                                className: 'flex items-center space-x-2'
                            },
                                React.createElement(Eye, { 
                                    className: 'w-4 h-4'
                                }),
                                React.createElement('span', null,
                                    currentLanguage === 'ar'
                                        ? `عرض ${lines.length - 20} سطر إضافي`
                                        : `Show ${lines.length - 20} more lines`
                                )
                            )
                        )
                    )
                )
        )
    );
});

CodeBlock.displayName = 'CodeBlock';

export default CodeBlock;
export { MessageContentRenderer };
export type { CodeBlockProps, MessageContentRendererProps };