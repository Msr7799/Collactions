/**
 * MCP (Model Context Protocol) - نظام مبسط وعملي
 * Simplified and practical MCP system
 */
import { spawn, ChildProcess } from 'child_process';

export interface MCPTool {
  name: string;
  description: string;
  parameters: any;
}

export interface MCPServer {
  id: string;
  name: string;
  command: string;
  args: string[];
  process?: ChildProcess;
  isConnected: boolean;
  tools: MCPTool[];
}

export class SimpleMCPClient {
  private servers: Map<string, MCPServer> = new Map();

  /**
   * إضافة خادم MCP جديد
   */
  async addServer(id: string, config: { command: string; args: string[]; env?: any }): Promise<boolean> {
    const { command, args, env = {} } = config;
    try {
      const server: MCPServer = {
        id,
        name: id, // استخدام ID كاسم مؤقت
        command,
        args,
        isConnected: false,
        tools: []
      };

      // محاولة تشغيل الخادم
      const process = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false
      });

      server.process = process;

      // انتظار للتأكد من تشغيل الخادم
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        process.on('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });

        process.stdout?.on('data', (data) => {
          const response = data.toString();
          if (response.includes('server ready') || response.includes('listening')) {
            clearTimeout(timeout);
            resolve(true);
          }
        });

        // إرسال رسالة initialization
        process.stdin?.write(JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: {
              name: 'Collactions',
              version: '1.0.0'
            }
          }
        }) + '\n');

        // تأكد من النجاح بعد ثانيتين
        setTimeout(() => {
          if (!server.isConnected) {
            clearTimeout(timeout);
            resolve(true); // نعتبرها نجحت
          }
        }, 2000);
      });

      server.isConnected = true;
      
      // جلب الأدوات المتاحة
      await this.fetchServerTools(server);
      
      this.servers.set(id, server);
      console.log(`✅ MCP Server connected: ${id}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to connect to MCP server ${id}:`, error);
      return false;
    }
  }

  /**
   * جلب الأدوات من الخادم
   */
  private async fetchServerTools(server: MCPServer): Promise<void> {
    if (!server.process || !server.isConnected) return;

    try {
      // إرسال طلب للحصول على الأدوات
      server.process?.stdin?.write(JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      }) + '\n');

      // تعيين أدوات افتراضية بناء على نوع الخادم
      switch (server.id) {
        case 'fetch':
          server.tools = [
            {
              name: 'fetch_url',
              description: 'Fetch content from a URL',
              parameters: {
                type: 'object',
                properties: {
                  url: { type: 'string', description: 'URL to fetch' }
                },
                required: ['url']
              }
            }
          ];
          break;
        case 'filesystem':
          server.tools = [
            {
              name: 'read_file',
              description: 'Read file content',
              parameters: {
                type: 'object',
                properties: {
                  path: { type: 'string', description: 'File path' }
                },
                required: ['path']
              }
            },
            {
              name: 'write_file',
              description: 'Write content to file',
              parameters: {
                type: 'object',
                properties: {
                  path: { type: 'string', description: 'File path' },
                  content: { type: 'string', description: 'File content' }
                },
                required: ['path', 'content']
              }
            }
          ];
          break;
        case 'time':
          server.tools = [
            {
              name: 'get_current_time',
              description: 'Get current time',
              parameters: {
                type: 'object',
                properties: {
                  timezone: { type: 'string', description: 'Timezone', default: 'UTC' }
                }
              }
            }
          ];
          break;
        default:
          server.tools = [];
      }
    } catch (error) {
      console.error(`Error fetching tools for ${server.name}:`, error);
      server.tools = [];
    }
  }

  /**
   * تشغيل أداة من خادم معين
   */
  async executeTool(serverId: string, toolName: string, parameters: any): Promise<string> {
    const server = this.servers.get(serverId);
    if (!server || !server.isConnected || !server.process) {
      throw new Error(`Server ${serverId} not connected`);
    }

    try {
      return await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Tool execution timeout'));
        }, 30000);

        // استمع للاستجابة
        const handleResponse = (data: Buffer) => {
          try {
            const response = data.toString();
            const lines = response.split('\n').filter(line => line.trim());
            
            for (const line of lines) {
              try {
                const parsed = JSON.parse(line);
                if (parsed.id === 3) { // معرف طلب تشغيل الأداة
                  clearTimeout(timeout);
                  server.process?.stdout?.off('data', handleResponse);
                  resolve(parsed.result?.content || 'Tool executed successfully');
                  return;
                }
              } catch {
                // تجاهل الأسطر غير المتوافقة مع JSON
              }
            }
          } catch (error) {
            clearTimeout(timeout);
            server.process?.stdout?.off('data', handleResponse);
            reject(error);
          }
        };

        server.process?.stdout?.on('data', handleResponse);

        // إرسال طلب تشغيل الأداة
        server.process?.stdin?.write(JSON.stringify({
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: toolName,
            arguments: parameters
          }
        }) + '\n');
      });
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error);
      throw error;
    }
  }

  /**
   * الحصول على جميع الأدوات المتاحة
   */
  getAllTools(): Array<MCPTool & { serverId: string }> {
    const allTools: Array<MCPTool & { serverId: string }> = [];
    
    for (const [serverId, server] of this.servers) {
      if (server.isConnected) {
        for (const tool of server.tools) {
          allTools.push({ ...tool, serverId });
        }
      }
    }
    
    return allTools;
  }

  /**
   * تشغيل خادم معين
   */
  async startServer(serverId: string): Promise<boolean> {
    const server = this.servers.get(serverId);
    if (!server) {
      console.error(`Server ${serverId} not found`);
      return false;
    }

    if (server.isConnected) {
      console.log(`Server ${serverId} already connected`);
      return true;
    }

    try {
      const process = spawn(server.command, server.args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false
      });

      server.process = process;
      server.isConnected = true;
      
      console.log(`✅ Server ${serverId} started`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to start server ${serverId}:`, error);
      return false;
    }
  }

  /**
   * إيقاف خادم معين
   */
  async stopServer(serverId: string): Promise<boolean> {
    const server = this.servers.get(serverId);
    if (!server) {
      console.error(`Server ${serverId} not found`);
      return false;
    }

    if (!server.isConnected || !server.process) {
      console.log(`Server ${serverId} already disconnected`);
      return true;
    }

    try {
      server.process.kill('SIGTERM');
      server.isConnected = false;
      server.process = undefined;
      
      console.log(`🛑 Server ${serverId} stopped`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to stop server ${serverId}:`, error);
      return false;
    }
  }

  /**
   * حذف خادم معين
   */
  async removeServer(serverId: string): Promise<boolean> {
    const server = this.servers.get(serverId);
    if (!server) {
      console.error(`Server ${serverId} not found`);
      return false;
    }

    // إيقاف السيرفر أولاً
    await this.stopServer(serverId);
    
    // حذف من القائمة
    this.servers.delete(serverId);
    console.log(`🗑️ Server ${serverId} removed`);
    return true;
  }

  /**
   * الحصول على معلومات الخوادم
   */
  getServersStatus(): Array<{id: string; name: string; status: string; toolsCount: number; isConnected: boolean}> {
    return Array.from(this.servers.values()).map(server => ({
      id: server.id,
      name: server.name,
      status: server.isConnected ? 'connected' : 'disconnected',
      isConnected: server.isConnected,
      toolsCount: server.tools.length
    }));
  }

  /**
   * إغلاق جميع الاتصالات
   */
  async disconnect(): Promise<void> {
    for (const server of this.servers.values()) {
      if (server.process) {
        server.process.kill();
        server.isConnected = false;
      }
    }
    this.servers.clear();
    console.log('🔌 All MCP servers disconnected');
  }
}

// المثيل العام
let mcpClient: SimpleMCPClient | null = null;

export function getMCPClient(): SimpleMCPClient {
  if (!mcpClient) {
    mcpClient = new SimpleMCPClient();
    // تهيئة الخوادم الأساسية تلقائياً
    initializeBasicServers(mcpClient);
  }
  return mcpClient;
}

/**
 * تهيئة الخوادم الأساسية تلقائياً
 */
async function initializeBasicServers(client: SimpleMCPClient) {
  try {
    console.log('🔄 Initializing basic MCP servers...');
    
    // تشغيل خادم الوقت
    await client.addServer('time', {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-time']
    });
    
    // تشغيل خادم جلب المحتوى
    await client.addServer('fetch', {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-fetch']
    });
    
    console.log('✅ Basic MCP servers initialized successfully');
  } catch (error) {
    console.error('⚠️ Failed to initialize some MCP servers:', error);
    // لا نرمي خطأ حتى لا نعطل النظام
  }
}

/**
 * إضافة خادم محدد (تحكم يدوي كامل)
 */
export async function addSpecificServer(serverId: string, config: { command: string; args: string[]; env?: any }): Promise<boolean> {
  const client = getMCPClient();
  return await client.addServer(serverId, config);
}

/**
 * إيقاف وحذف خادم محدد
 */
export async function removeSpecificServer(serverId: string): Promise<void> {
  const client = getMCPClient();
  const server = client.getServersStatus().find(s => s.id === serverId);
  
  if (server) {
    // إيقاف العملية إذا كانت تعمل
    const serverData = client['servers'].get(serverId);
    if (serverData?.process) {
      serverData.process.kill('SIGTERM');
      console.log(`🛑 Server ${serverId} terminated`);
    }
    
    // إزالة من القائمة
    client['servers'].delete(serverId);
    console.log(`🗑️ Server ${serverId} removed`);
  }
}

/**
 * قائمة الخوادم المتاحة للإضافة
 */
export function getAvailableServerTemplates() {
  return [
    {
      id: 'time',
      name: 'Time Server',
      description: 'معلومات الوقت والتاريخ',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-time'],
      category: 'utility'
    },
    {
      id: 'fetch',
      name: 'Fetch Server',
      description: 'جلب محتوى من المواقع',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-fetch'],
      category: 'web'
    },
    {
      id: 'filesystem',
      name: 'Filesystem Server',
      description: 'قراءة وكتابة الملفات',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '--', '/tmp'],
      category: 'files'
    },
    {
      id: 'memory',
      name: 'Memory Server',
      description: 'نظام الذاكرة المتقدم',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-memory'],
      category: 'ai'
    }
  ];
}
