import { useState, useEffect, useRef, useCallback } from 'react';

// Improved TypeScript interfaces
export interface MCPTool {
  id: string;
  name: string;
  description: string;
  parameters?: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface MCPServer {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  isConnected: boolean;
  toolsCount: number;
  tools: MCPTool[];
  category?: string;
  lastError?: string;
}

export interface MCPServerTemplate {
  id: string;
  name: string;
  description: string;
  command: string;
  args: string[];
  category: string;
}

interface UseMcpServersOptions {
  autoConnect?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

interface UseMcpServersReturn {
  servers: MCPServer[];
  isLoading: boolean;
  error: string | null;
  addServer: (template: MCPServerTemplate) => Promise<boolean>;
  removeServer: (serverId: string) => Promise<boolean>;
  toggleServer: (serverId: string) => Promise<boolean>;
  refreshServers: () => Promise<void>;
  serverOperationInProgress: string | null;
}

/**
 * Custom hook for managing MCP servers
 * Handles connection, status, tools, and lifecycle management
 */
export function useMcpServers(options: UseMcpServersOptions = {}): UseMcpServersReturn {
  const {
    autoConnect = true,
    retryAttempts = 3,
    retryDelay = 2000
  } = options;

  // State management
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [serverOperationInProgress, setServerOperationInProgress] = useState<string | null>(null);

  // Refs for preventing race conditions
  const mountedRef = useRef(true);
  const operationLockRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Safe state update helpers that check if component is still mounted
   */
  const safeSetServers = useCallback((value: MCPServer[] | ((prev: MCPServer[]) => MCPServer[])) => {
    if (mountedRef.current) {
      setServers(value);
    }
  }, []);

  const safeSetIsLoading = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    if (mountedRef.current) {
      setIsLoading(value);
    }
  }, []);

  const safeSetError = useCallback((value: string | null | ((prev: string | null) => string | null)) => {
    if (mountedRef.current) {
      setError(value);
    }
  }, []);

  /**
   * Fetch MCP servers status with error handling and retries
   */
  const fetchMCPStatus = useCallback(async (attempt = 0): Promise<MCPServer[]> => {
    try {
      const response = await fetch('/api/mcp/servers', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch MCP servers');
      }

      return data.activeServers || [];
    } catch (fetchError) {
      console.error(`MCP fetch attempt ${attempt + 1} failed:`, fetchError);
      
      // Retry logic
      if (attempt < retryAttempts - 1) {
        console.log(`Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return fetchMCPStatus(attempt + 1);
      }
      
      throw fetchError;
    }
  }, [retryAttempts, retryDelay]);

  /**
   * Load MCP servers with comprehensive error handling
   */
  const loadMCPStatus = useCallback(async () => {
    if (operationLockRef.current) {
      console.warn('MCP operation already in progress, skipping load');
      return;
    }

    operationLockRef.current = true;
    safeSetIsLoading(true);
    safeSetError(null);

    try {
      const fetchedServers = await fetchMCPStatus();
      
      if (mountedRef.current) {
        safeSetServers(fetchedServers);
        console.log(`✅ MCP servers loaded: ${fetchedServers.length} servers`);
      }
    } catch (loadError) {
      const errorMessage = loadError instanceof Error ? loadError.message : String(loadError);
      console.error('❌ Failed to load MCP servers:', errorMessage);
      safeSetError(errorMessage);
    } finally {
      operationLockRef.current = false;
      safeSetIsLoading(false);
    }
  }, [fetchMCPStatus, safeSetIsLoading, safeSetError, safeSetServers]);

  /**
   * Add a new MCP server
   */
  const addServer = useCallback(async (template: MCPServerTemplate): Promise<boolean> => {
    if (serverOperationInProgress || operationLockRef.current) {
      console.warn('Server operation already in progress, ignoring add request');
      return false;
    }

    setServerOperationInProgress('add');
    operationLockRef.current = true;

    try {
      const response = await fetch('/api/mcp/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: template.name,
          command: template.command,
          args: template.args,
          description: template.description,
          category: template.category
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to add server: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Server addition failed');
      }

      // Refresh servers list after successful addition
      await loadMCPStatus();
      return true;

    } catch (addError) {
      const errorMessage = addError instanceof Error ? addError.message : String(addError);
      console.error('❌ Failed to add MCP server:', errorMessage);
      safeSetError(errorMessage);
      return false;
    } finally {
      operationLockRef.current = false;
      setServerOperationInProgress(null);
    }
  }, [serverOperationInProgress, loadMCPStatus]);

  /**
   * Remove an MCP server
   */
  const removeServer = useCallback(async (serverId: string): Promise<boolean> => {
    if (serverOperationInProgress || operationLockRef.current) {
      console.warn('Server operation already in progress, ignoring remove request');
      return false;
    }

    setServerOperationInProgress('remove');
    operationLockRef.current = true;

    try {
      const response = await fetch(`/api/mcp/servers/${encodeURIComponent(serverId)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Failed to remove server: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Server removal failed');
      }

      // Refresh servers list after successful removal
      await loadMCPStatus();
      return true;

    } catch (removeError) {
      const errorMessage = removeError instanceof Error ? removeError.message : String(removeError);
      console.error('❌ Failed to remove MCP server:', errorMessage);
      safeSetError(errorMessage);
      return false;
    } finally {
      operationLockRef.current = false;
      setServerOperationInProgress(null);
    }
  }, [serverOperationInProgress, loadMCPStatus]);

  /**
   * Toggle MCP server connection
   */
  const toggleServer = useCallback(async (serverId: string): Promise<boolean> => {
    if (serverOperationInProgress || operationLockRef.current) {
      console.warn('Server operation already in progress, ignoring toggle request');
      return false;
    }

    setServerOperationInProgress('toggle');
    operationLockRef.current = true;

    try {
      const response = await fetch('/api/mcp/servers/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId })
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle server: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Server toggle failed');
      }

      // Refresh servers list after successful toggle
      await loadMCPStatus();
      return true;

    } catch (toggleError) {
      const errorMessage = toggleError instanceof Error ? toggleError.message : String(toggleError);
      console.error('❌ Failed to toggle MCP server:', errorMessage);
      safeSetError(errorMessage);
      return false;
    } finally {
      operationLockRef.current = false;
      setServerOperationInProgress(null);
    }
  }, [serverOperationInProgress, loadMCPStatus]);

  /**
   * Refresh servers list
   */
  const refreshServers = useCallback(async (): Promise<void> => {
    await loadMCPStatus();
  }, [loadMCPStatus]);

  // Auto-load MCP servers on mount
  useEffect(() => {
    if (autoConnect) {
      loadMCPStatus();
    }
  }, [autoConnect, loadMCPStatus]);

  return {
    servers,
    isLoading,
    error,
    addServer,
    removeServer,
    toggleServer,
    refreshServers,
    serverOperationInProgress
  };
}
