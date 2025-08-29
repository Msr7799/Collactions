import { MCPClient } from './mcpClient';

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolResult {
  tool_call_id: string;
  content: string;
}

// Tavily Search MCP Tool
const tavilySearchTool: MCPTool = {
  name: 'tavily_search',
  description: 'Search the web using Tavily API for real-time information and current events',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query string'
      },
      max_results: {
        type: 'number',
        description: 'Maximum number of results to return (default: 5)',
        default: 5
      },
      include_images: {
        type: 'boolean',
        description: 'Include images in results',
        default: false
      }
    },
    required: ['query']
  }
};

// Web Search Tool
const webSearchTool: MCPTool = {
  name: 'web_search',
  description: 'Search the internet for current information, news, and web content',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query'
      },
      num_results: {
        type: 'number',
        description: 'Number of results to return',
        default: 3
      }
    },
    required: ['query']
  }
};

// Available MCP Tools
const availableMCPTools: MCPTool[] = [
  tavilySearchTool,
  webSearchTool
];

/**
 * Get all available MCP tools
 */
export function getMCPTools(): MCPTool[] {
  return availableMCPTools;
}

/**
 * Convert MCP tools to OpenAI function format
 */
export function convertMCPToolsToFunctions(tools: MCPTool[]) {
  return tools.map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema
    }
  }));
}

/**
 * Execute MCP tool call
 */
export async function executeMCPTool(toolCall: ToolCall): Promise<ToolResult> {
  const { name, arguments: args } = toolCall.function;
  
  try {
    const parsedArgs = JSON.parse(args);
    
    switch (name) {
      case 'tavily_search':
        return await executeTavilySearch(toolCall.id, parsedArgs);
      
      case 'web_search':
        return await executeWebSearch(toolCall.id, parsedArgs);
      
      default:
        return {
          tool_call_id: toolCall.id,
          content: `Unknown tool: ${name}`
        };
    }
  } catch (error) {
    return {
      tool_call_id: toolCall.id,
      content: `Error executing tool ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Execute Tavily search
 */
async function executeTavilySearch(toolCallId: string, args: any): Promise<ToolResult> {
  const { query, max_results = 5, include_images = false } = args;
  
  try {
    const response = await fetch('/api/tavily-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        max_results,
        include_images
      })
    });
    
    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Format search results
    const results = data.results?.map((result: any) => ({
      title: result.title,
      url: result.url,
      content: result.content,
      ...(result.image_url && { image_url: result.image_url })
    })) || [];
    
    const formattedContent = `🔍 **البحث في الويب | Web Search Results**\n\n**طلب البحث | Query:** ${query}\n\n${results.map((result: any, index: number) => 
      `**${index + 1}. ${result.title}**\n${result.content}\n🔗 المصدر | Source: ${result.url}\n`
    ).join('\n')}\n\n📊 **إجمالي النتائج | Total Results:** ${results.length}`;
    
    return {
      tool_call_id: toolCallId,
      content: formattedContent
    };
  } catch (error) {
    return {
      tool_call_id: toolCallId,
      content: `❌ خطأ في البحث | Search Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Execute web search (fallback/alternative implementation)
 */
async function executeWebSearch(toolCallId: string, args: any): Promise<ToolResult> {
  const { query, num_results = 3 } = args;
  
  try {
    // Use the existing search_web function if available
    const response = await fetch('/api/web-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        num_results
      })
    });
    
    if (!response.ok) {
      throw new Error(`Web search API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    const formattedContent = `🌐 **البحث العام | General Web Search**\n\n**البحث عن | Searching for:** ${query}\n\n${data.results?.map((result: any, index: number) => 
      `**${index + 1}. ${result.title || 'No title'}**\n${result.snippet || result.content || 'No content available'}\n🔗 ${result.url || result.link}\n`
    ).join('\n') || 'لا توجد نتائج | No results found'}\n`;
    
    return {
      tool_call_id: toolCallId,
      content: formattedContent
    };
  } catch (error) {
    return {
      tool_call_id: toolCallId,
      content: `❌ خطأ في البحث العام | General Search Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Check if model supports MCP tools
 */
export function modelSupportsMCPTools(modelCapabilities: string[]): boolean {
  return modelCapabilities.some(cap => 
    cap.includes('function_calling') || 
    cap.includes('tool_use') ||
    cap.includes('tools')
  );
}
