// Service for managing user's MCP servers persistence
// خدمة إدارة استمرارية خوادم MCP للمستخدم

export interface UserMCPServer {
  name: string;
  command: string;
  args: string[];
  env: Record<string, string>;
  description?: string;
  status?: 'connected' | 'disconnected' | 'connecting';
  tools?: any[];
  prompts?: any[];
  resources?: any[];
}

export interface UserMCPResponse {
  success: boolean;
  servers?: UserMCPServer[];
  server?: UserMCPServer;
  message: string;
  error?: string;
}

class UserMCPService {
  private readonly baseUrl = '/api/user/mcp-servers';

  /**
   * Load user's saved MCP servers
   * تحميل خوادم MCP المحفوظة للمستخدم
   */
  async loadUserServers(): Promise<UserMCPServer[]> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: UserMCPResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load servers | فشل في تحميل الخوادم');
      }

      return data.servers || [];
    } catch (error) {
      console.error('Error loading user servers:', error);
      // Don't throw error for unauthenticated users
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Save all user's MCP servers
   * حفظ جميع خوادم MCP للمستخدم
   */
  async saveUserServers(servers: UserMCPServer[]): Promise<UserMCPResponse> {
    try {
      // Validate input
      if (!Array.isArray(servers)) {
        throw new Error('Servers must be an array | يجب أن تكون الخوادم مصفوفة');
      }

      // Clean and validate server data
      const cleanedServers = servers.map(server => ({
        name: server.name || '',
        command: server.command || '',
        args: Array.isArray(server.args) ? server.args : [],
        env: server.env && typeof server.env === 'object' ? server.env : {},
        description: server.description || '',
        status: server.status || 'disconnected',
        tools: Array.isArray(server.tools) ? server.tools : [],
        prompts: Array.isArray(server.prompts) ? server.prompts : [],
        resources: Array.isArray(server.resources) ? server.resources : [],
      }));

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ servers: cleanedServers }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: UserMCPResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving user servers:', error);
      throw error;
    }
  }

  /**
   * Add a new server to user's saved servers
   * إضافة خادم جديد لخوادم المستخدم المحفوظة
   */
  async addServer(serverData: UserMCPServer): Promise<UserMCPResponse> {
    try {
      // First, load existing servers
      const existingServers = await this.loadUserServers();
      
      // Check if server name already exists
      const nameExists = existingServers.some(s => s.name === serverData.name);
      if (nameExists) {
        throw new Error(`Server "${serverData.name}" already exists | الخادم "${serverData.name}" موجود بالفعل`);
      }

      // Add new server
      const updatedServers = [...existingServers, serverData];
      
      return await this.saveUserServers(updatedServers);
    } catch (error) {
      console.error('Error adding server:', error);
      throw error;
    }
  }

  /**
   * Update an existing server
   * تحديث خادم موجود
   */
  async updateServer(serverName: string, serverData: Partial<UserMCPServer>): Promise<UserMCPResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serverName, serverData }),
      });

      const data: UserMCPResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update server | فشل في تحديث الخادم');
      }

      return data;
    } catch (error) {
      console.error('Error updating server:', error);
      throw error;
    }
  }

  /**
   * Delete a server from user's saved servers
   * حذف خادم من خوادم المستخدم المحفوظة
   */
  async deleteServer(serverName: string): Promise<UserMCPResponse> {
    try {
      const response = await fetch(`${this.baseUrl}?name=${encodeURIComponent(serverName)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: UserMCPResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete server | فشل في حذف الخادم');
      }

      return data;
    } catch (error) {
      console.error('Error deleting server:', error);
      throw error;
    }
  }

  /**
   * Sync local MCP servers with user's saved servers
   * مزامنة خوادم MCP المحلية مع خوادم المستخدم المحفوظة
   */
  async syncServers(localServers: any[]): Promise<UserMCPServer[]> {
    try {
      // Validate input
      if (!Array.isArray(localServers)) {
        console.warn('syncServers: localServers is not an array', localServers);
        return [];
      }

      // Convert local servers to UserMCPServer format with validation
      const formattedServers: UserMCPServer[] = localServers
        .filter(server => server && typeof server === 'object' && server.name)
        .map(server => ({
          name: String(server.name || ''),
          command: String(server.command || ''),
          args: Array.isArray(server.args) ? server.args.map(String) : [],
          env: server.env && typeof server.env === 'object' ? server.env : {},
          description: server.description ? String(server.description) : undefined,
          status: ['connected', 'disconnected', 'connecting'].includes(server.status) 
            ? server.status : 'disconnected',
          tools: Array.isArray(server.tools) ? server.tools : [],
          prompts: Array.isArray(server.prompts) ? server.prompts : [],
          resources: Array.isArray(server.resources) ? server.resources : [],
        }));

      if (formattedServers.length === 0) {
        console.log('No valid servers to sync');
        return [];
      }

      await this.saveUserServers(formattedServers);
      return formattedServers;
    } catch (error) {
      console.error('Error syncing servers:', error);
      // Don't throw error - just log it
      return [];
    }
  }

  /**
   * Check if user is authenticated
   * التحقق من تسجيل دخول المستخدم
   */
  async isUserAuthenticated(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.status !== 401;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const userMCPService = new UserMCPService();
export default userMCPService;
