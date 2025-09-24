'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Server, 
  Settings, 
  Power, 
  PowerOff, 
  RefreshCw, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader,
  Edit3,
  Download,
  Upload,
  X
} from 'lucide-react';

interface MCPTool {
  name: string;
  description: string;
}

interface MCPServer {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  isConnected: boolean;
  toolsCount: number;
  tools: MCPTool[];
  category?: string;
  command?: string;
  args?: string[];
}

interface MCPManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MCPManager: React.FC<MCPManagerProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedServers, setExpandedServers] = useState<Set<string>>(new Set());
  const [configView, setConfigView] = useState<'ui' | 'raw'>('ui');
  const [rawConfig, setRawConfig] = useState<string>('');
  
  // Server management states
  const [newServerForm, setNewServerForm] = useState({
    id: '',
    name: '',
    description: '',
    command: 'npx',
    args: '',
    category: 'utility'
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // Load servers on mount
  useEffect(() => {
    if (isOpen) {
      loadServers();
    }
  }, [isOpen]);

  const loadServers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/mcp/servers', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setServers(data.activeServers || []);
      } else {
        throw new Error(data.error || 'Failed to load servers');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to load MCP servers:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleServer = useCallback(async (serverId: string) => {
    try {
      const server = servers.find(s => s.id === serverId);
      if (!server) return;

      const action = server.isConnected ? 'disconnect' : 'connect';
      
      const response = await fetch('/api/mcp/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId, action })
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh servers after toggle
        setTimeout(() => loadServers(), 1000);
      } else {
        throw new Error(result.error || 'Toggle failed');
      }
    } catch (err) {
      console.error('Failed to toggle server:', err);
      setError(err instanceof Error ? err.message : 'Toggle failed');
    }
  }, [servers, loadServers]);

  const removeServer = useCallback(async (serverId: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الخادم؟' : 'Are you sure you want to remove this server?')) {
      return;
    }

    try {
      const response = await fetch('/api/mcp/servers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId })
      });

      const result = await response.json();
      
      if (result.success) {
        loadServers();
      } else {
        throw new Error(result.error || 'Remove failed');
      }
    } catch (err) {
      console.error('Failed to remove server:', err);
      setError(err instanceof Error ? err.message : 'Remove failed');
    }
  }, [language, loadServers]);

  const addServer = useCallback(async () => {
    try {
      if (!newServerForm.id || !newServerForm.name || !newServerForm.args) {
        setError(language === 'ar' ? 'جميع الحقول مطلوبة' : 'All fields are required');
        return;
      }

      const args = newServerForm.args.split(',').map(arg => arg.trim()).filter(arg => arg);
      
      const response = await fetch('/api/mcp/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverId: newServerForm.id,
          name: newServerForm.name,
          command: newServerForm.command,
          args: args,
          description: newServerForm.description,
          category: newServerForm.category
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setNewServerForm({
          id: '',
          name: '',
          description: '',
          command: 'npx',
          args: '',
          category: 'utility'
        });
        setShowAddForm(false);
        loadServers();
      } else {
        throw new Error(result.error || 'Add server failed');
      }
    } catch (err) {
      console.error('Failed to add server:', err);
      setError(err instanceof Error ? err.message : 'Add server failed');
    }
  }, [newServerForm, language, loadServers]);

  const toggleServerExpansion = useCallback((serverId: string) => {
    setExpandedServers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serverId)) {
        newSet.delete(serverId);
      } else {
        newSet.add(serverId);
      }
      return newSet;
    });
  }, []);

  const loadRawConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/mcp/config');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.content) {
          setRawConfig(data.content);
        } else {
          setError('Failed to load configuration');
        }
      } else {
        setError('Configuration file not found');
      }
    } catch (err) {
      console.error('Failed to load raw config:', err);
      setError('Failed to load configuration');
    }
  }, []);

  useEffect(() => {
    if (configView === 'raw') {
      loadRawConfig();
    }
  }, [configView, loadRawConfig]);

  const saveRawConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/mcp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: rawConfig })
      });

      const data = await response.json();
      
      if (data.success) {
        setError(null);
        // Optionally refresh servers list
        setTimeout(() => loadServers(), 1000);
      } else {
        setError(data.error || 'Failed to save configuration');
      }
    } catch (err) {
      console.error('Failed to save raw config:', err);
      setError('Failed to save configuration');
    }
  }, [rawConfig, loadServers]);

  if (!isOpen) return null;

  const totalTools = servers.reduce((sum, server) => sum + (server.toolsCount || 0), 0);
  const connectedServers = servers.filter(s => s.isConnected).length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg-card border border-border rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">
              {language === 'ar' ? 'إدارة خوادم MCP' : 'Manage MCP servers'}
            </h2>
            <span className="text-sm text-muted bg-bg-dark px-2 py-1 rounded">
              {totalTools} / 100 {language === 'ar' ? 'أداة' : 'tools'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfigView(configView === 'ui' ? 'raw' : 'ui')}
              className="px-3 py-1.5 text-sm bg-bg-dark hover:bg-primary/20 border border-border rounded transition-colors"
            >
              {configView === 'ui' 
                ? (language === 'ar' ? 'عرض التكوين' : 'View raw config')
                : (language === 'ar' ? 'عرض الواجهة' : 'View UI')
              }
            </button>
            
            <button
              onClick={loadServers}
              disabled={isLoading}
              className="p-1.5 hover:bg-primary/20 rounded transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-primary/20 rounded transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Warning Banner */}
        {totalTools > 50 && (
          <div className="bg-yellow-900/20 border-b border-yellow-700/30 p-3">
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>
                {language === 'ar' 
                  ? 'تحذير: للحصول على الأداء الأمثل، نوصي بتفعيل ما يصل إلى 50 أداة.'
                  : 'Warning: To optimize performance, we recommend that up to 50 tools are enabled.'
                }
              </span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border-b border-red-700/30 p-3">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {configView === 'ui' ? (
            <div className="h-full overflow-y-auto">
              
              {/* Add Server Button */}
              <div className="p-4 border-b border-border">
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-2 px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'ar' ? 'إضافة خادم جديد' : 'Add New Server'}
                </button>
              </div>

              {/* Add Server Form */}
              {showAddForm && (
                <div className="p-4 border-b border-border bg-bg-dark/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {language === 'ar' ? 'معرف الخادم' : 'Server ID'}
                      </label>
                      <input
                        type="text"
                        value={newServerForm.id}
                        onChange={(e) => setNewServerForm(prev => ({...prev, id: e.target.value}))}
                        className="w-full px-3 py-2 bg-bg-card border border-border rounded focus:outline-none focus:border-primary"
                        placeholder="e.g., my-custom-server"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {language === 'ar' ? 'اسم الخادم' : 'Server Name'}
                      </label>
                      <input
                        type="text"
                        value={newServerForm.name}
                        onChange={(e) => setNewServerForm(prev => ({...prev, name: e.target.value}))}
                        className="w-full px-3 py-2 bg-bg-card border border-border rounded focus:outline-none focus:border-primary"
                        placeholder="My Custom Server"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {language === 'ar' ? 'الأوامر (مفصولة بفاصلة)' : 'Args (comma separated)'}
                      </label>
                      <input
                        type="text"
                        value={newServerForm.args}
                        onChange={(e) => setNewServerForm(prev => ({...prev, args: e.target.value}))}
                        className="w-full px-3 py-2 bg-bg-card border border-border rounded focus:outline-none focus:border-primary"
                        placeholder="-y, @my/package-name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {language === 'ar' ? 'الفئة' : 'Category'}
                      </label>
                      <select
                        value={newServerForm.category}
                        onChange={(e) => setNewServerForm(prev => ({...prev, category: e.target.value}))}
                        className="w-full px-3 py-2 bg-bg-card border border-border rounded focus:outline-none focus:border-primary"
                      >
                        <option value="utility">Utility</option>
                        <option value="ai">AI</option>
                        <option value="web">Web</option>
                        <option value="files">Files</option>
                        <option value="development">Development</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        {language === 'ar' ? 'الوصف' : 'Description'}
                      </label>
                      <input
                        type="text"
                        value={newServerForm.description}
                        onChange={(e) => setNewServerForm(prev => ({...prev, description: e.target.value}))}
                        className="w-full px-3 py-2 bg-bg-card border border-border rounded focus:outline-none focus:border-primary"
                        placeholder="Description of server functionality"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={addServer}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
                    >
                      {language === 'ar' ? 'إضافة' : 'Add'}
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                    >
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              )}

              {/* Servers List */}
              <div className="divide-y divide-border">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-muted">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
                  </div>
                ) : servers.length === 0 ? (
                  <div className="p-8 text-center text-muted">
                    <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{language === 'ar' ? 'لا توجد خوادم مكونة' : 'No servers configured'}</p>
                  </div>
                ) : (
                  servers.map((server) => (
                    <div key={server.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={() => toggleServerExpansion(server.id)}
                            className="p-1 hover:bg-primary/20 rounded transition-colors"
                          >
                            {expandedServers.has(server.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{server.name}</h3>
                              {server.isConnected ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <p className="text-sm text-muted">
                              {server.toolsCount || 0} / {server.toolsCount || 0} {language === 'ar' ? 'أداة' : 'tools'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Configure Button */}
                          <button className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white text-xs rounded transition-colors">
                            {language === 'ar' ? 'تكوين' : 'Configure'}
                          </button>
                          
                          {/* Toggle Button */}
                          <button
                            onClick={() => toggleServer(server.id)}
                            className={`p-1.5 rounded transition-colors ${
                              server.isConnected
                                ? 'text-green-500 hover:bg-green-500/20'
                                : 'text-gray-500 hover:bg-gray-500/20'
                            }`}
                          >
                            {server.isConnected ? (
                              <Power className="w-4 h-4" />
                            ) : (
                              <PowerOff className="w-4 h-4" />
                            )}
                          </button>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => removeServer(server.id)}
                            className="p-1.5 text-red-500 hover:bg-red-500/20 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Enabled Toggle */}
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-sm text-muted">
                            {language === 'ar' ? 'مُفعل' : 'Enabled'}
                          </span>
                          <button
                            onClick={() => toggleServer(server.id)}
                            className={`w-10 h-6 rounded-full transition-colors ${
                              server.isConnected ? 'bg-green-600' : 'bg-gray-600'
                            }`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                              server.isConnected ? 'translate-x-5' : 'translate-x-1'
                            }`}></div>
                          </button>
                        </div>
                      </div>
                      
                      {/* Expanded Tools */}
                      {expandedServers.has(server.id) && (
                        <div className="mt-3 ml-7 p-3 bg-bg-dark/30 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-teal-400" />
                            <span className="text-sm font-medium">
                              {language === 'ar' ? 'جميع الأدوات' : 'All Tools'} ({server.toolsCount || 0})
                            </span>
                          </div>
                          
                          {server.tools && server.tools.length > 0 ? (
                            <div className="space-y-2">
                              {server.tools.map((tool, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 text-teal-400 mt-0.5" />
                                  <div>
                                    <div className="font-mono text-sm text-primary">{tool.name}</div>
                                    <div className="text-xs text-muted">{tool.description}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted">
                              {language === 'ar' ? 'لا توجد أدوات متاحة' : 'No tools available'}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Raw Config View */
            <div className="h-full p-4">
              <div className="h-full bg-bg-dark rounded border border-border">
                <div className="p-3 border-b border-border flex justify-between items-center">
                  <span className="text-sm font-medium">mcp-servers.json</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={saveRawConfig}
                      className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
                      title={language === 'ar' ? 'حفظ التكوين' : 'Save Config'}
                    >
                      {language === 'ar' ? 'حفظ' : 'Save'}
                    </button>
                    <button className="p-1.5 hover:bg-primary/20 rounded transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-primary/20 rounded transition-colors">
                      <Upload className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <textarea
                  value={rawConfig}
                  onChange={(e) => setRawConfig(e.target.value)}
                  className="w-full h-full p-4 bg-transparent border-none outline-none font-mono text-sm resize-none"
                  style={{ minHeight: '400px' }}
                  placeholder={language === 'ar' ? 'جاري تحميل التكوين...' : 'Loading configuration...'}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCPManager;
