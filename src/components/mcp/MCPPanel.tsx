'use client';

import React, { useState, useEffect } from 'react';
import { Server, Plus, Trash2, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface MCPServer {
  id: string;
  name: string;
  description: string;
  isConnected: boolean;
  toolsCount: number;
  category?: string;
}

interface MCPServerTemplate {
  id: string;
  name: string;
  description: string;
  command: string;
  args: string[];
  category: string;
}

interface MCPPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const MCPPanel: React.FC<MCPPanelProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);
  const [serverTemplates, setServerTemplates] = useState<MCPServerTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<MCPServerTemplate | null>(null);

  // Load MCP status and templates
  const loadMCPStatus = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/mcp/status');
      const data = await response.json();
      
      if (data.success) {
        setMcpServers(data.activeServers || []);
        setServerTemplates(data.serverTemplates || []);
      } else {
        setError(data.error || 'Failed to load MCP status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load MCP status');
    } finally {
      setIsLoading(false);
    }
  };

  // Add server
  const addServer = async (template: MCPServerTemplate) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/mcp/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverId: template.id,
          name: template.name,
          command: template.command,
          args: template.args
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadMCPStatus(); // Refresh the list
        setSelectedTemplate(null);
      } else {
        setError(data.error || 'Failed to add server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add server');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove server
  const removeServer = async (serverId: string) => {
    if (!confirm(language === 'ar' ? 
      `هل أنت متأكد من حذف الخادم ${serverId}؟` : 
      `Are you sure you want to remove server ${serverId}?`
    )) {
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/mcp/servers?id=${serverId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        await loadMCPStatus(); // Refresh the list
      } else {
        setError(data.error || 'Failed to remove server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMCPStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center">
              <Server className="w-6 h-6 mr-2" />
              {language === 'ar' ? 'تحكم خوادم MCP' : 'MCP Server Control'}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={loadMCPStatus}
                disabled={isLoading}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 max-h-[calc(90vh-80px)] overflow-y-auto">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {/* Active Servers */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              {language === 'ar' ? 'الخوادم النشطة' : 'Active Servers'}
              <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                {mcpServers.length}
              </span>
            </h3>
            
            {mcpServers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Server className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{language === 'ar' ? 'لا توجد خوادم نشطة' : 'No active servers'}</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {mcpServers.map((server) => (
                  <div key={server.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {server.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {server.description}
                        </p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            server.isConnected 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {server.isConnected ? '🟢 متصل' : '🔴 غير متصل'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {language === 'ar' ? `أدوات: ${server.toolsCount}` : `Tools: ${server.toolsCount}`}
                          </span>
                          {server.category && (
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                              {server.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeServer(server.id)}
                        disabled={isLoading}
                        className="ml-4 p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title={language === 'ar' ? 'حذف الخادم' : 'Remove Server'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Templates */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-blue-500" />
              {language === 'ar' ? 'قوالب الخوادم المتاحة' : 'Available Server Templates'}
            </h3>
            
            <div className="grid gap-3">
              {serverTemplates.map((template) => {
                const isActive = mcpServers.some(s => s.id === template.id);
                return (
                  <div
                    key={template.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                        : isActive
                        ? 'border-green-300 bg-green-50 dark:bg-green-900 opacity-60'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50 dark:bg-gray-700'
                    }`}
                    onClick={() => !isActive && setSelectedTemplate(template)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                          {template.name}
                          {isActive && (
                            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">
                              {language === 'ar' ? 'مضاف' : 'Added'}
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {template.description}
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                            {template.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {template.command}
                          </span>
                        </div>
                      </div>
                      {!isActive && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addServer(template);
                          }}
                          disabled={isLoading}
                          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {language === 'ar' ? 'إضافة' : 'Add'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Template Action */}
          {selectedTemplate && !mcpServers.some(s => s.id === selectedTemplate.id) && (
            <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    {language === 'ar' ? 'القالب المحدد:' : 'Selected Template:'} {selectedTemplate.name}
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {language === 'ar' ? 'جاهز للإضافة' : 'Ready to add'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-200 rounded transition-colors"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    onClick={() => addServer(selectedTemplate)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? '...' : (language === 'ar' ? '✅ إضافة' : '✅ Add')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCPPanel;
