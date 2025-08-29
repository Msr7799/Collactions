'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  ExternalLink, 
  Github, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Code,
  Globe,
  Calendar,
  Monitor,
  Smartphone,
  Laptop,
  Zap
} from 'lucide-react';

interface Tool {
  name: string;
  description: string;
  isExpanded?: boolean;
}

interface ServiceDetailProps {
  serviceName?: string;
}

const ServiceDetail: React.FC<ServiceDetailProps> = ({ serviceName = "fetch" }) => {
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'auto' | 'json' | 'typescript' | 'python'>('auto');

  // Get server configuration based on serviceName
  const getServerConfig = (serverName: string) => {
    const configs: Record<string, any> = {
      fetch: {
        name: 'Fetch',
        description: 'Web content fetching and conversion for efficient LLM usage.',
        tools: [
          { name: 'fetch', description: 'Fetch and convert web content from URLs for LLM usage.' },
          { name: 'html_to_text', description: 'Convert HTML content to clean text format.' }
        ],
        npmPackage: '@modelcontextprotocol/server-fetch',
        githubUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/fetch',
        icon: <Globe className="w-6 h-6 text-black" />
      },
      filesystem: {
        name: 'Filesystem',
        description: 'Secure file operations with configurable access controls.',
        tools: [
          { name: 'read_file', description: 'Read the contents of a file from the file system.' },
          { name: 'write_file', description: 'Write content to a file in the file system.' },
          { name: 'list_directory', description: 'List the contents of a directory.' },
          { name: 'create_directory', description: 'Create a new directory.' }
        ],
        npmPackage: '@modelcontextprotocol/server-filesystem',
        githubUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
        icon: <Monitor className="w-6 h-6 text-black" />
      },
      memory: {
        name: 'Memory',
        description: 'Knowledge graph-based persistent memory system.',
        tools: [
          { name: 'create_entities', description: 'Create new entities in the knowledge graph.' },
          { name: 'create_relations', description: 'Create relationships between entities.' },
          { name: 'search_nodes', description: 'Search for nodes in the knowledge graph.' },
          { name: 'read_graph', description: 'Read the entire knowledge graph structure.' }
        ],
        npmPackage: '@modelcontextprotocol/server-memory',
        githubUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/memory',
        icon: <Settings className="w-6 h-6 text-black" />
      },
      git: {
        name: 'Git',
        description: 'Tools to read, search, and manipulate Git repositories.',
        tools: [
          { name: 'git_log', description: 'Get commit history for a repository.' },
          { name: 'git_diff', description: 'Show differences between commits or files.' },
          { name: 'git_show', description: 'Show details of a specific commit.' },
          { name: 'git_search', description: 'Search through repository content.' }
        ],
        npmPackage: '@modelcontextprotocol/server-git',
        githubUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/git',
        icon: <Code className="w-6 h-6 text-black" />
      },
      sequential_thinking: {
        name: 'Sequential Thinking',
        description: 'Dynamic and reflective problem-solving through thought sequences.',
        tools: [
          { name: 'think', description: 'Process a thought step in the sequential thinking chain.' },
          { name: 'reflect', description: 'Reflect on previous thoughts and adjust approach.' },
          { name: 'conclude', description: 'Draw conclusions from the thinking process.' }
        ],
        npmPackage: '@modelcontextprotocol/server-sequentialthinking',
        githubUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking',
        icon: <Settings className="w-6 h-6 text-black" />
      }
    };
    return configs[serverName] || configs.fetch;
  };

  const serverConfig = getServerConfig(serviceName);
  const tools: Tool[] = serverConfig.tools;

  const toggleTool = (toolName: string) => {
    setExpandedTool(expandedTool === toolName ? null : toolName);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Service Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Service Header */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              {serverConfig.icon}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-foreground">{serverConfig.name}</h1>
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <p className="text-muted text-sm">{serverConfig.npmPackage} • Official MCP Server</p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex items-center space-x-3">
            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">Official</span>
            <span className="px-2 py-1 bg-secondary text-muted rounded text-xs">{serverConfig.tools.length} tools</span>
            <span className="px-2 py-1 bg-secondary text-muted rounded text-xs">2024</span>
            <span className="px-2 py-1 bg-secondary text-muted rounded text-xs">Open Source</span>
          </div>

          {/* About Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
              <span>About</span>
            </h2>
            <p className="text-muted leading-relaxed">
              {serverConfig.description}
            </p>
          </div>

          {/* Tools Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Tools</span>
            </h2>
            
            <div className="space-y-3">
              {tools.map((tool) => (
                <div key={tool.name} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleTool(tool.name)}
                    className="w-full p-4 text-left hover:bg-secondary transition-colors flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-medium text-foreground">{tool.name}</h3>
                      <p className="text-sm text-muted mt-1 line-clamp-2">{tool.description}</p>
                    </div>
                    {expandedTool === tool.name ? (
                      <ChevronUp className="w-5 h-5 text-muted" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted" />
                    )}
                  </button>
                  
                  {expandedTool === tool.name && (
                    <div className="border-t p-4 bg-secondary">
                      <p className="text-sm text-muted">
                        Full tool documentation and parameters would be displayed here.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button className="w-full p-3 border rounded-lg text-primary hover:bg-secondary transition-colors text-sm font-medium">
              Explore capabilities ✨
            </button>
          </div>
        </div>

        {/* Right Column - Connection & Config */}
        <div className="space-y-6">
          
          {/* Connect Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Connect</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">
                  Get connection URL
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={`mcp://${serverConfig.npmPackage}`}
                    readOnly
                    className="flex-1 px-3 py-2 bg-secondary border rounded-l-md text-sm text-foreground"
                  />
                  <button
                    onClick={() => copyToClipboard(`mcp://${serverConfig.npmPackage}`)}
                    className="px-3 py-2 bg-primary text-black rounded-r-md hover:bg-primary/80 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-muted">
                Claude doesn't support OAuth yet so use text instead. Get URL will load instead
              </p>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-foreground mb-3">Test this MCP Server</p>
                
                <div className="space-y-3">
                  <a 
                    href="/prompts" 
                    className="w-full flex items-center justify-center space-x-2 p-3 bg-primary text-black rounded-md hover:bg-primary/80 transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    <span className="font-medium">Test in Prompts Page</span>
                  </a>
                  
                  <div className="text-xs text-muted text-center">
                    Try this server with real prompts and see the results
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  <h3 className="text-sm font-medium text-foreground">Installation & Setup</h3>
                  <p className="text-xs text-muted">Install and configure this MCP server for your environment.</p>
                  
                  <div className="bg-secondary rounded-md p-3 font-mono text-xs">
                    <pre className="text-foreground whitespace-pre-wrap">
{`# Install the server
npm install ${serverConfig.npmPackage}

# Add to Claude Desktop config
{
  "mcpServers": {
    "${serviceName}": {
      "command": "npx",
      "args": ["${serverConfig.npmPackage}"]
    }
  }
}`}
                    </pre>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>This is a real, working MCP server from the official repository.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Details</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted">Package</span>
                <span className="text-foreground font-mono text-xs">{serverConfig.npmPackage}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted">Tools Available</span>
                <span className="text-foreground">{serverConfig.tools.length} tools</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted">Status</span>
                <span className="text-green-400">✓ Official</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted">License</span>
                <span className="text-foreground">MIT</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted">Published</span>
                <span className="text-foreground">2024</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted">Source Code</span>
                <div className="flex items-center space-x-1">
                  <Github className="w-4 h-4 text-muted" />
                  <a href={serverConfig.githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                    View on GitHub
                  </a>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-muted">Test Server</span>
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4 text-muted" />
                  <a href="/prompts" className="text-primary hover:text-primary/80">
                    Try in Prompts
                  </a>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 p-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500/10 transition-colors text-sm">
              ⚠️ Report an issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
