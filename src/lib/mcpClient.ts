// MCP Client - للتواصل مع خوادم MCP الفعلية
import { spawn, ChildProcess } from 'child_process';

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPPrompt {
  name: string;
  description?: string;
  arguments?: any[];
}

export interface MCPServerCapabilities {
  tools?: { listChanged?: boolean };
  resources?: { listChanged?: boolean; subscribe?: boolean };
  prompts?: { listChanged?: boolean };
}

export interface MCPServerInfo {
  name: string;
  version: string;
  capabilities: MCPServerCapabilities;
}

export interface MCPMessage {
  jsonrpc: string;
  id?: string | number;
  method?: string;
  params?: any;
  result?: any;
  error?: any;
}

export interface SequentialThinkingStep {
  stepNumber: number;
  totalSteps: number;
  thought: string;
  nextStepNeeded: boolean;
  isRevision?: boolean;
  revisesThought?: number;
  branchFromThought?: number;
  branchId?: string;
  needsMoreThoughts?: boolean;
  currentStep?: {
    stepDescription: string;
    recommendedTools: {
      toolName: string;
      confidence: number;
      rationale: string;
      priority: number;
      suggestedInputs?: any;
      alternatives?: string[];
    }[];
    expectedOutcome: string;
    nextStepConditions?: string[];
  };
  previousSteps?: any[];
  remainingSteps?: string[];
}

export class MCPClient {
  private process: ChildProcess | null = null;
  private messageId = 0;
  private pendingRequests = new Map<number, { resolve: Function; reject: Function }>();
  private serverInfo: MCPServerInfo | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  constructor(
    private serverCommand: string,
    private serverArgs: string[] = [],
    private serverName: string = 'MCP Server'
  ) {}

  /**
   * اتصال بخادم MCP | Connect to MCP Server
   */
  async connect(): Promise<boolean> {
    try {
      console.log(`Connecting to MCP server: ${this.serverName}`);
      
      // تشغيل خادم MCP | Start MCP server
      this.process = spawn(this.serverCommand, this.serverArgs, {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      if (!this.process.stdout || !this.process.stdin) {
        throw new Error('Failed to create MCP server process');
      }

      // إعداد معالجات الأحداث | Setup event handlers
      this.setupEventHandlers();

      // تهيئة الاتصال | Initialize connection
      await this.initialize();
      
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      console.log(`Successfully connected to MCP server: ${this.serverName}`);
      return true;

    } catch (error) {
      console.error(`Failed to connect to MCP server: ${this.serverName}`, error);
      await this.handleConnectionError();
      return false;
    }
  }

  /**
   * إعداد معالجات الأحداث | Setup event handlers
   */
  private setupEventHandlers(): void {
    if (!this.process) return;

    // معالجة الرسائل الواردة | Handle incoming messages
    this.process.stdout?.on('data', (data) => {
      const messages = data.toString().trim().split('\n');
      messages.forEach((messageStr: string) => {
        if (messageStr.trim()) {
          try {
            const message: MCPMessage = JSON.parse(messageStr);
            this.handleMessage(message);
          } catch (error) {
            console.warn('Failed to parse MCP message:', messageStr);
          }
        }
      });
    });

    // معالجة الأخطاء | Handle errors
    this.process.stderr?.on('data', (data) => {
      console.error(`MCP Server Error (${this.serverName}):`, data.toString());
    });

    // معالجة إغلاق العملية | Handle process exit
    this.process.on('exit', (code) => {
      console.log(`MCP Server (${this.serverName}) exited with code ${code}`);
      this.isConnected = false;
      this.handleDisconnection();
    });

    this.process.on('error', (error) => {
      console.error(`MCP Server Process Error (${this.serverName}):`, error);
      this.isConnected = false;
      this.handleConnectionError();
    });
  }

  /**
   * تهيئة الاتصال مع الخادم | Initialize connection with server
   */
  private async initialize(): Promise<void> {
    const initMessage: MCPMessage = {
      jsonrpc: '2.0',
      id: this.getNextMessageId(),
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
          prompts: {}
        },
        clientInfo: {
          name: 'Collaction AI',
          version: '1.0.0'
        }
      }
    };

    const response = await this.sendMessage(initMessage);
    this.serverInfo = response.result;
  }

  /**
   * إرسال رسالة لخادم MCP | Send message to MCP server
   */
  private async sendMessage(message: MCPMessage): Promise<MCPMessage> {
    return new Promise((resolve, reject) => {
      if (!this.process?.stdin) {
        reject(new Error('MCP server not connected'));
        return;
      }

      const id = message.id || this.getNextMessageId();
      message.id = id;

      this.pendingRequests.set(Number(id), { resolve, reject });

      // إرسال الرسالة | Send message
      const messageStr = JSON.stringify(message) + '\n';
      this.process.stdin.write(messageStr);

      // إضافة مهلة زمنية | Add timeout
      setTimeout(() => {
        if (this.pendingRequests.has(Number(id))) {
          this.pendingRequests.delete(Number(id));
          reject(new Error('MCP request timeout'));
        }
      }, 30000); // 30 second timeout
    });
  }

  /**
   * معالجة الرسائل الواردة | Handle incoming messages
   */
  private handleMessage(message: MCPMessage): void {
    if (message.id && this.pendingRequests.has(Number(message.id))) {
      const { resolve, reject } = this.pendingRequests.get(Number(message.id))!;
      this.pendingRequests.delete(Number(message.id));

      if (message.error) {
        reject(new Error(`MCP Error: ${message.error.message || 'Unknown error'}`));
      } else {
        resolve(message);
      }
    }
  }

  /**
   * الحصول على معرف الرسالة التالي | Get next message ID
   */
  private getNextMessageId(): number {
    return ++this.messageId;
  }

  /**
   * استخدام أداة Sequential Thinking | Use Sequential Thinking Tool
   */
  async useSequentialThinking(
    thought: string,
    options: {
      stepNumber?: number;
      totalSteps?: number;
      nextStepNeeded?: boolean;
      isRevision?: boolean;
      revisesThought?: number;
      branchFromThought?: number;
      branchId?: string;
      needsMoreThoughts?: boolean;
      availableTools?: string[];
    } = {}
  ): Promise<SequentialThinkingStep> {
    const {
      stepNumber = 1,
      totalSteps = 5,
      nextStepNeeded = true,
      isRevision = false,
      availableTools = []
    } = options;

    const message: MCPMessage = {
      jsonrpc: '2.0',
      id: this.getNextMessageId(),
      method: 'tools/call',
      params: {
        name: 'sequentialthinking_tools',
        arguments: {
          thought,
          stepNumber,
          totalSteps,
          nextStepNeeded,
          isRevision,
          ...options,
          // تمرير الأدوات المتاحة | Pass available tools
          availableTools
        }
      }
    };

    try {
      const response = await this.sendMessage(message);
      
      if (response.result && response.result.content) {
        return {
          stepNumber: response.result.stepNumber || stepNumber,
          totalSteps: response.result.totalSteps || totalSteps,
          thought: response.result.content[0]?.text || thought,
          nextStepNeeded: response.result.nextStepNeeded !== false,
          isRevision: response.result.isRevision || false,
          revisesThought: response.result.revisesThought,
          branchFromThought: response.result.branchFromThought,
          branchId: response.result.branchId,
          needsMoreThoughts: response.result.needsMoreThoughts,
          currentStep: response.result.currentStep,
          previousSteps: response.result.previousSteps,
          remainingSteps: response.result.remainingSteps
        };
      }

      throw new Error('Invalid response from sequential thinking tool');
    } catch (error) {
      console.error('Sequential thinking error:', error);
      throw error;
    }
  }

  /**
   * قائمة الأدوات المتاحة | List available tools
   */
  async listTools(): Promise<MCPTool[]> {
    const message: MCPMessage = {
      jsonrpc: '2.0',
      id: this.getNextMessageId(),
      method: 'tools/list'
    };

    const response = await this.sendMessage(message);
    return response.result?.tools || [];
  }

  /**
   * التحقق من حالة الاتصال | Check connection status
   */
  isServerConnected(): boolean {
    return this.isConnected && this.process !== null && !this.process.killed;
  }

  /**
   * معالجة انقطاع الاتصال | Handle disconnection
   */
  private async handleDisconnection(): Promise<void> {
    this.isConnected = false;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect to MCP server (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(async () => {
        await this.connect();
      }, 2000 * this.reconnectAttempts); // Exponential backoff
    } else {
      console.error(`Failed to reconnect to MCP server after ${this.maxReconnectAttempts} attempts`);
    }
  }

  /**
   * معالجة خطأ الاتصال | Handle connection error
   */
  private async handleConnectionError(): Promise<void> {
    await this.disconnect();
    await this.handleDisconnection();
  }

  /**
   * قطع الاتصال | Disconnect from server
   */
  async disconnect(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
    
    this.isConnected = false;
    this.pendingRequests.clear();
    console.log(`Disconnected from MCP server: ${this.serverName}`);
  }

  /**
   * الحصول على معلومات الخادم | Get server info
   */
  getServerInfo(): MCPServerInfo | null {
    return this.serverInfo;
  }
}

// إدارة عملاء MCP | MCP Clients Manager
export class MCPClientsManager {
  private clients = new Map<string, MCPClient>();
  
  /**
   * إضافة عميل MCP جديد | Add new MCP client
   */
  async addClient(
    name: string, 
    command: string, 
    args: string[] = []
  ): Promise<boolean> {
    try {
      const client = new MCPClient(command, args, name);
      const connected = await client.connect();
      
      if (connected) {
        this.clients.set(name, client);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Failed to add MCP client ${name}:`, error);
      return false;
    }
  }

  /**
   * الحصول على عميل MCP | Get MCP client
   */
  getClient(name: string): MCPClient | undefined {
    return this.clients.get(name);
  }

  /**
   * إزالة عميل MCP | Remove MCP client
   */
  async removeClient(name: string): Promise<void> {
    const client = this.clients.get(name);
    if (client) {
      await client.disconnect();
      this.clients.delete(name);
    }
  }

  /**
   * قائمة العملاء المتصلين | List connected clients
   */
  getConnectedClients(): string[] {
    return Array.from(this.clients.entries())
      .filter(([_, client]) => client.isServerConnected())
      .map(([name, _]) => name);
  }

  /**
   * إيقاف جميع العملاء | Shutdown all clients
   */
  async shutdown(): Promise<void> {
    for (const [name, client] of this.clients) {
      await client.disconnect();
    }
    this.clients.clear();
  }
}

// مدير عملاء MCP العام | Global MCP clients manager
let mcpClientsManager: MCPClientsManager | null = null;

export function getMCPClientsManager(): MCPClientsManager {
  if (!mcpClientsManager) {
    mcpClientsManager = new MCPClientsManager();
  }
  return mcpClientsManager;
}
