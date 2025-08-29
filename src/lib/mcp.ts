// MCP (Model Context Protocol) Manager
export interface MCPServer {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error' | 'connected';
  capabilities: string[];
  tools?: any[];
  prompts?: MCPPrompt[];
  resources?: any[];
}

export interface MCPPrompt {
  id: string;
  title: string;
  name: string;
  description: string;
  category: string;
  template: string;
  variables?: string[];
}

export class MCPManager {
  private servers: MCPServer[] = [];
  private prompts: MCPPrompt[] = [];

  constructor() {
    this.initializeDefaultPrompts();
  }

  private initializeDefaultPrompts(): void {
    this.prompts = [
      {
        id: 'code-review',
        title: 'Code Review / مراجعة الكود',
        name: 'Code Review',
        description: 'Review code for best practices / مراجعة الكود لأفضل الممارسات',
        category: 'development',
        template: 'Please review this code and provide feedback on:\n1. Code quality\n2. Performance\n3. Security\n4. Best practices\n\nCode:\n{code}'
      },
      {
        id: 'bug-fix',
        title: 'Bug Analysis / تحليل الأخطاء',
        name: 'Bug Analysis',
        description: 'Analyze and fix bugs / تحليل وإصلاح الأخطاء',
        category: 'development',
        template: 'I have encountered a bug. Please help me analyze and fix it:\n\nError: {error}\nCode: {code}\nExpected behavior: {expected}'
      },
      {
        id: 'api-design',
        title: 'API Design / تصميم API',
        name: 'API Design',
        description: 'Design REST API endpoints / تصميم نقاط API REST',
        category: 'architecture',
        template: 'Help me design a REST API for: {feature}\n\nRequirements:\n- {requirements}\n\nPlease provide endpoint structure, methods, and response formats.'
      }
    ];
  }

  getServers(): MCPServer[] {
    return this.servers;
  }

  getPrompts(): MCPPrompt[] {
    return this.prompts;
  }

  getAllPrompts(): MCPPrompt[] {
    return this.prompts;
  }

  getPromptsByCategory(category: string): MCPPrompt[] {
    return this.prompts.filter(prompt => prompt.category === category);
  }

  async addServer(serverConfig: any): Promise<MCPServer | null> {
    try {
      const timestamp = Date.now();
      const uniqueId = `server-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
      const defaultName = `Unknown Server ${timestamp}`;
      
      const newServer: MCPServer = {
        id: serverConfig.name || uniqueId,
        name: serverConfig.name || defaultName,
        description: serverConfig.description || 'MCP Server',
        status: 'active',
        capabilities: serverConfig.capabilities || [],
        tools: serverConfig.tools || [],
        prompts: serverConfig.prompts || [],
        resources: serverConfig.resources || []
      };
      
      this.servers.push(newServer);
      
      // التحقق من الحالة الفعلية | Check actual status
      await this.checkServerRealStatus(newServer.id);
      
      return newServer;
    } catch (error) {
      console.error('Failed to add server:', error);
      return null;
    }
  }

  /**
   * التحقق من الحالة الفعلية للخادم | Check real server status
   */
  async checkServerRealStatus(serverId: string): Promise<void> {
    try {
      const response = await fetch('/api/chat/mcp', {
        method: 'GET'
      });
      
      if (response.ok) {
        const data = await response.json();
        const server = this.servers.find(s => s.id === serverId);
        
        if (server) {
          // تحديث الحالة بناءً على الاستجابة الفعلية | Update status based on actual response
          if (data.connectedClients?.includes('sequential-thinking') && serverId === 'sequential-thinking') {
            server.status = 'connected';
          } else {
            server.status = 'inactive';
          }
        }
      }
    } catch (error) {
      console.error('Failed to check server status:', error);
      const server = this.servers.find(s => s.id === serverId);
      if (server) {
        server.status = 'error';
      }
    }
  }

  /**
   * تحديث حالة جميع الخوادم | Update all servers status
   */
  async updateAllServersStatus(): Promise<void> {
    for (const server of this.servers) {
      await this.checkServerRealStatus(server.id);
    }
  }

  removeServer(serverId: string): void {
    this.servers = this.servers.filter(server => server.id !== serverId);
  }

  connectServer(serverId: string): void {
    const server = this.servers.find(s => s.id === serverId);
    if (server) {
      server.status = 'connected';
    }
  }

  disconnectServer(serverId: string): void {
    const server = this.servers.find(s => s.id === serverId);
    if (server) {
      server.status = 'inactive';
    }
  }

  addPrompt(prompt: MCPPrompt): void {
    this.prompts.push(prompt);
  }

  removePrompt(promptId: string): void {
    this.prompts = this.prompts.filter(prompt => prompt.id !== promptId);
  }

  getPromptTemplate(promptId: string): string | null {
    const prompt = this.prompts.find(p => p.id === promptId);
    return prompt ? prompt.template : null;
  }
}

// Singleton instance
let mcpManagerInstance: MCPManager | null = null;

export function getMCPManager(): MCPManager {
  if (!mcpManagerInstance) {
    mcpManagerInstance = new MCPManager();
  }
  return mcpManagerInstance;
}