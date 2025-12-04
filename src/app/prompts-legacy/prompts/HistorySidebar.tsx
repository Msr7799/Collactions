'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  MessageSquare, 
  Trash2, 
  Plus,
  Calendar,
  Clock,
  Search,
  MoreVertical,
  Edit3
} from 'lucide-react';
import { ChatSession, chatStorage } from './chatStorage';
import { AIModel } from '@/lib/models';

interface HistorySidebarProps {
  isVisible: boolean;
  onClose: () => void;
  language: 'ar' | 'en';
  currentChatSession: ChatSession | null;
  onChatSelect: (sessionId: string) => void;
  onChatDelete: (sessionId: string) => void;
  onNewChat: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isVisible,
  onClose,
  language,
  currentChatSession,
  onChatSelect,
  onChatDelete,
  onNewChat
}) => {
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Load chat history
  const loadChatHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const sessions = await chatStorage.listSessions();
      // Limit to 50 chats and sort by updated date
      const sortedSessions = sessions
        .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
        .slice(0, 50);
      setChatHistory(sortedSessions);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading chat history:', error);
      }
      setChatHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load chats on mount and when sidebar becomes visible
  useEffect(() => {
    if (isVisible) {
      loadChatHistory();
    }
  }, [isVisible, loadChatHistory]);

  // Filter chats based on search term
  const filteredChats = chatHistory.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (chat.messages && chat.messages.some(msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return language === 'ar' ? 'اليوم' : 'Today';
    } else if (days === 1) {
      return language === 'ar' ? 'أمس' : 'Yesterday';
    } else if (days < 7) {
      return language === 'ar' ? `${days} أيام` : `${days} days ago`;
    } else {
      return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');
    }
  };

  // Handle chat selection
  const handleChatSelect = useCallback((sessionId: string) => {
    onChatSelect(sessionId);
    setActiveMenuId(null);
  }, [onChatSelect]);

  // Handle chat deletion with confirmation
  const handleChatDelete = useCallback(async (sessionId: string, chatTitle: string) => {
    const confirmMessage = language === 'ar' 
      ? `هل أنت متأكد من حذف المحادثة "${chatTitle}"؟`
      : `Are you sure you want to delete "${chatTitle}"?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await onChatDelete(sessionId);
        await loadChatHistory(); // Refresh the list
        setActiveMenuId(null);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error deleting chat:', error);
        }
      }
    }
  }, [onChatDelete, loadChatHistory, language]);

  // Handle new chat
  const handleNewChat = useCallback(() => {
    onNewChat();
    setActiveMenuId(null);
  }, [onNewChat]);

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full w-80 lg:w-96 bg-background border-l border-border z-50
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0' : 'translate-x-full'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-4 bg-muted/30 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg lg:text-xl font-bold text-foreground flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-primary" />
              {language === 'ar' ? 'تاريخ المحادثات' : 'Chat History'}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
              title={language === 'ar' ? 'إغلاق' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="w-full p-3 bg-primary/90 hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors flex items-center justify-center"
            title={language === 'ar' ? 'محادثة جديدة' : 'New Chat'}
          >
            <Plus className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'محادثة جديدة' : 'New Chat'}
          </button>

          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={language === 'ar' ? 'البحث في المحادثات...' : 'Search chats...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground text-sm">
                {searchTerm 
                  ? (language === 'ar' ? 'لا توجد نتائج' : 'No results found')
                  : (language === 'ar' ? 'لا توجد محادثات' : 'No chats yet')
                }
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`
                    relative group p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200
                    ${currentChatSession?.id === chat.id 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'hover:bg-muted/50'
                    }
                  `}
                  onClick={() => handleChatSelect(chat.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Chat Title */}
                      <h3 className={`
                        text-sm font-medium truncate
                        ${currentChatSession?.id === chat.id 
                          ? 'text-primary-hover' 
                          : 'text-foreground'
                        }
                      `}>
                        {chat.title}
                      </h3>

                      {/* Chat Info */}
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(chat.updatedAt || chat.createdAt)}
                        <span className="mx-2">•</span>
                        <span>{chat.messages?.length || 0} {language === 'ar' ? 'رسالة' : 'messages'}</span>
                      </div>

                      {/* Last Message Preview */}
                      {chat.messages && chat.messages.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {chat.messages[chat.messages.length - 1]?.content?.slice(0, 60) || ''}
                          {(chat.messages[chat.messages.length - 1]?.content?.length || 0) > 60 ? '...' : ''}
                        </p>
                      )}
                    </div>

                    {/* Menu Button */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === chat.id ? null : chat.id);
                        }}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === chat.id && (
                        <div className="absolute right-0 top-full mt-1 bg-background border border-border rounded-md shadow-lg z-10 min-w-[120px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChatDelete(chat.id, chat.title);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-muted transition-colors flex items-center"
                          >
                            <Trash2 className="w-3 h-3 text-danger mr-2" />
                            {language === 'ar' ? 'حذف' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            {language === 'ar' 
              ? `${filteredChats.length} من أصل 50 محادثة`
              : `${filteredChats.length} of 50 chats`
            }
          </p>
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;
