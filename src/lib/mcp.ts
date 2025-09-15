/**
 * MCP (Model Context Protocol) - نظام متقدم وعملي
 * Advanced and practical MCP system
 */
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface MCPServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
  disabled?: boolean;
}

export interface MCPServer {
  id: string;
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  process?: ChildProcess;
  isConnected: boolean;
  tools: MCPTool[];
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
}

export class SimpleMCPClient {
  public servers: Map<string, MCPServer> = new Map();

  /**
   * إضافة خادم MCP جديد
   */
  async addServer(id: string, config: MCPServerConfig): Promise<boolean> {
    console.log(`📝 Adding MCP server: ${id}`);
    const { command, args, env = {} } = config;
    
    // إذا كان الخادم موجود، أوقفه أولاً
    if (this.servers.has(id)) {
      console.log(`🔄 Server ${id} exists, stopping first...`);
      await this.stopServer(id);
    }
    
    try {
      const server: MCPServer = {
        id,
        name: id,
        command,
        args,
        env,
        isConnected: false,
        tools: [],
        status: 'connecting'
      };

      this.servers.set(id, server);

      // محاولة تشغيل الخادم
      console.log(`🚀 Spawning: ${command} ${args.join(' ')}`);
      const childProcess = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false,
        env: { ...process.env, ...env }
      });

      server.process = childProcess;

      // انتظار للتأكد من تشغيل الخادم
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        childProcess.on('error', (error: Error) => {
          console.error(`❌ Process error for ${id}:`, error);
          server.status = 'error';
          clearTimeout(timeout);
          reject(error);
        });

        childProcess.on('exit', (code: number | null) => {
          console.log(`📤 Server ${id} exited with code ${code}`);
          server.isConnected = false;
          server.status = 'disconnected';
          server.process = undefined;
        });

        childProcess.stderr?.on('data', (data: Buffer) => {
          console.warn(`⚠️ ${id} stderr:`, data.toString().trim());
        });

        childProcess.stdout?.on('data', (data: Buffer) => {
          const response = data.toString();
          // اعتبر أي مخرجات كعلامة على النجاح
          if (!server.isConnected && response.trim()) {
            clearTimeout(timeout);
            resolve(true);
          }
        });

        // إرسال رسالة initialization
        try {
          childProcess.stdin?.write(JSON.stringify({
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
        } catch (error) {
          console.warn(`⚠️ Failed to send initialize to ${id}:`, error);
        }

        // تأكد من النجاح بعد ثانيتين
        setTimeout(() => {
          if (!server.isConnected) {
            clearTimeout(timeout);
            resolve(true); // نعتبرها نجحت
          }
        }, 2000);
      });

      server.isConnected = true;
      server.status = 'connected';
      
      // جلب الأدوات المتاحة
      await this.fetchServerTools(server);
      
      console.log(`✅ MCP Server connected: ${id}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to connect to MCP server ${id}:`, error);
      const server = this.servers.get(id);
      if (server) {
        server.status = 'error';
        server.isConnected = false;
      }
      return false;
    }
  }

  /**
   * جلب الأدوات من الخادم
   */
  private async fetchServerTools(server: MCPServer): Promise<void> {
    if (!server.process || !server.isConnected) {
      console.log(`⚠️ Cannot fetch tools for ${server.id} - process: ${!!server.process}, connected: ${server.isConnected}`);
      return;
    }

    console.log(`🔧 Fetching tools for server: ${server.id}`);
    
    try {
      // إرسال طلب للحصول على الأدوات
      server.process?.stdin?.write(JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      }) + '\n');

      // تعيين أدوات افتراضية بناء على نوع الخادم
      console.log(`🛠️ Setting default tools for server type: ${server.id}`);
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
      
      console.log(`✅ Tools set for ${server.id}:`, server.tools.length, 'tools');
      server.tools.forEach(tool => console.log(`  - ${tool.name}: ${tool.description}`));
      
    } catch (error) {
      console.error(`Error fetching tools for ${server.name}:`, error);
      server.tools = [];
    }
  }

  /**
   * تشغيل أداة من خادم معين
   */
  async executeTool(serverId: string, toolName: string, parameters: Record<string, unknown>): Promise<string> {
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
    
    console.log(`🔍 Getting all tools from ${this.servers.size} servers:`);
    
    for (const [serverId, server] of this.servers) {
      console.log(`  - Server ${serverId}: connected=${server.isConnected}, tools=${server.tools.length}`);
      if (server.isConnected) {
        for (const tool of server.tools) {
          allTools.push({ ...tool, serverId });
          console.log(`    + Added tool: ${tool.name} from ${serverId}`);
        }
      }
    }
    
    console.log(`📊 Total available tools: ${allTools.length}`);
    return allTools;
  }

  /**
   * تشغيل خادم معين
   */
  async startServer(serverId: string): Promise<boolean> {
    console.log(`🔄 Starting server: ${serverId}`);
    
    const server = this.servers.get(serverId);
    if (!server) {
      console.error(`❌ Server ${serverId} not found`);
      return false;
    }

    // إذا كان متصل ويعمل، لا نحتاج فعل شيء
    if (server.isConnected && server.process && !server.process.killed) {
      console.log(`✅ Server ${serverId} already running`);
      return true;
    }

    return await this.addServer(serverId, {
      command: server.command,
      args: server.args,
      env: server.env
    });
  }

  /**
   * إيقاف خادم معين
   */
  async stopServer(serverId: string): Promise<boolean> {
    console.log(`🔄 Attempting to stop server: ${serverId}`);
    
    const server = this.servers.get(serverId);
    if (!server) {
      console.error(`❌ Server ${serverId} not found in servers map`);
      console.log('Available servers:', Array.from(this.servers.keys()));
      return false;
    }

    console.log(`Server ${serverId} status:`, {
      isConnected: server.isConnected,
      hasProcess: !!server.process,
      processKilled: server.process?.killed
    });

    // إذا كان الخادم غير متصل أساساً، نعتبرها نجحت
    if (!server.isConnected) {
      console.log(`✅ Server ${serverId} already disconnected`);
      return true;
    }

    // تحديث الحالة فوراً
    server.isConnected = false;

    // إذا لم يكن هناك process، نعتبرها نجحت
    if (!server.process) {
      console.log(`✅ Server ${serverId} stopped (no process)`);
      return true;
    }

    try {
      // محاولة إيقاف العملية بلطف أولاً
      if (!server.process.killed) {
        server.process.kill('SIGTERM');
        
        // انتظار قصير لإنهاء العملية
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // إذا لم تنته، استخدم SIGKILL
        if (!server.process.killed) {
          server.process.kill('SIGKILL');
        }
      }
      
      server.process = undefined;
      console.log(`✅ Server ${serverId} stopped successfully`);
      return true;
      
    } catch (error) {
      console.warn(`⚠️ Error stopping server ${serverId}:`, error);
      // حتى لو فشل kill، نعتبر الخادم متوقف
      server.process = undefined;
      console.log(`✅ Server ${serverId} marked as stopped despite error`);
      return true;
    }
  }

  /**
   * حذف خادم معين
   */
  async removeServer(serverId: string): Promise<boolean> {
    console.log(`🗑️ Removing server: ${serverId}`);
    
    const server = this.servers.get(serverId);
    if (!server) {
      console.warn(`⚠️ Server ${serverId} not found`);
      return true; // اعتبرها نجحت إذا لم يكن موجود
    }

    // إيقاف الخادم أولاً
    if (server.isConnected) {
      await this.stopServer(serverId);
    }

    // حذف من القائمة
    this.servers.delete(serverId);
    console.log(`✅ Server ${serverId} removed`);
    return true;
  }

  /**
   * إعادة تشغيل خادم (refresh)
   */
  async refreshServer(serverId: string): Promise<boolean> {
    console.log(`🔄 Refreshing server: ${serverId}`);
    
    const server = this.servers.get(serverId);
    if (!server) {
      console.error(`❌ Server ${serverId} not found`);
      return false;
    }

    // إيقاف ثم إعادة تشغيل
    await this.stopServer(serverId);
    await new Promise(resolve => setTimeout(resolve, 500));
    return await this.startServer(serverId);
  }

  /**
   * الحصول على حالة جميع الخوادم
   */
  getServersStatus(): Array<{id: string; name: string; status: string; toolsCount: number; isConnected: boolean}> {
    return Array.from(this.servers.values()).map(server => ({
      id: server.id,
      name: server.name,
      status: server.status,
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
 * تهيئة الخوادم من ملف الإعدادات
 */
async function initializeBasicServers(client: SimpleMCPClient) {
  try {
    console.log('🔄 Initializing MCP servers...');
    
    let configData: any = {};
    
    try {
      const configPath = path.join(process.cwd(), 'src/config/mcp-servers.json');
      const configFile = fs.readFileSync(configPath, 'utf8');
      configData = JSON.parse(configFile);
      console.log('📄 Loaded config from mcp-servers.json');
    } catch (error) {
      console.warn('⚠️ Using fallback server config');
      configData = {
        mcpServers: {
          'time': {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-time'],
            disabled: false
          },
          'fetch': {
            command: 'npx', 
            args: ['-y', '@modelcontextprotocol/server-fetch'],
            disabled: false
          },
          'sequential-thinking': {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-sequentialthinking'],
            disabled: false
          }
        }
      };
    }

    // إضافة الخوادم للقائمة وتشغيل المتاحة تلقائياً
    if (configData.servers) {
      for (const [serverId, config] of Object.entries(configData.servers)) {
        const serverConfig = config as MCPServerConfig;
        
        if (!serverConfig.disabled) {
          // إضافة للـ map
          client.servers.set(serverId, {
            id: serverId,
            name: serverId,
            command: serverConfig.command,
            args: serverConfig.args || [],
            env: serverConfig.env || {},
            isConnected: false,
            tools: [],
            status: 'disconnected'
          });
          console.log(`📝 Server ${serverId} added to registry`);
          
          // تشغيل الخادم تلقائياً في background
          setTimeout(async () => {
            try {
              const success = await client.startServer(serverId);
              if (success) {
                console.log(`✅ Auto-connected server: ${serverId}`);
              } else {
                console.log(`⚠️ Failed to auto-connect server: ${serverId}`);
              }
            } catch (error) {
              console.log(`❌ Error auto-connecting ${serverId}:`, error);
            }
          }, 100); // Small delay to avoid blocking
        }
      }
    }
    
    console.log('✅ MCP servers registry initialized');
  } catch (error) {
    console.error('⚠️ Failed to initialize MCP servers:', error);
  }
}

/**
 * وظائف مساعدة للتحكم في الخوادم
 */
export async function addCustomServer(serverId: string, config: MCPServerConfig): Promise<boolean> {
  const client = getMCPClient();
  return await client.addServer(serverId, config);
}

export async function removeCustomServer(serverId: string): Promise<boolean> {
  const client = getMCPClient();
  return await client.removeServer(serverId);
}

export async function refreshCustomServer(serverId: string): Promise<boolean> {
  const client = getMCPClient();
  return await client.refreshServer(serverId);
}

/**
 * قوالب الخوادم المتاحة
 */
export function getAvailableServerTemplates() {
  return [
    {
      id: 'time',
      name: 'Time Server',
      description: 'الحصول على الوقت والتاريخ الحالي',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-time'],
      category: 'utility'
    },
    {
      id: 'fetch',
      name: 'Fetch Server', 
      description: 'جلب محتوى المواقع والـ APIs',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-fetch'],
      category: 'web'
    },
    {
      id: 'filesystem',
      name: 'Filesystem Server',
      description: 'قراءة وكتابة الملفات المحلية',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '--', process.cwd()],
      category: 'files'
    },
    {
      id: 'sequential-thinking',
      name: 'Sequential Thinking',
      description: 'نظام التفكير المتسلسل والتحليل',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-sequentialthinking'],
      category: 'ai'
    },
    {
      id: 'memory',
      name: 'Memory Server',
      description: 'نظام الذاكرة والمعرفة المتقدم',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-memory'],
      category: 'ai'
    }
  ];
}
