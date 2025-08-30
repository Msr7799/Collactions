import { MCPServer, MCPTool, MCPPrompt, MCPResource } from '../mcp';

export class FetchServer implements MCPServer {
  id: string = 'fetch';
  name: string = 'Fetch';
  description: string = 'Web content fetching and conversion for efficient LLM usage';
  status: 'active' | 'inactive' = 'active';
  category: 'official' | 'community' = 'official';
  version: string = '1.0.0';
  isStable: boolean = true;
  year: number = 2024;
  isOpenSource: boolean = true;

  async getTools(): Promise<MCPTool[]> {
    return [
      {
        name: 'fetch_url',
        description: 'Fetch content from a URL and convert it to text',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to fetch content from'
            },
            format: {
              type: 'string',
              enum: ['text', 'markdown', 'html'],
              description: 'Output format',
              default: 'text'
            }
          },
          required: ['url']
        }
      },
      {
        name: 'search_web',
        description: 'Search the web for content',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query'
            },
            limit: {
              type: 'number',
              description: 'Number of results to return',
              default: 5
            }
          },
          required: ['query']
        }
      }
    ];
  }

  async getPrompts(): Promise<MCPPrompt[]> {
    return [
      {
        name: 'summarize_webpage',
        description: 'Summarize content from a webpage',
        arguments: [
          {
            name: 'url',
            description: 'URL of the webpage to summarize',
            required: true
          }
        ]
      },
      {
        name: 'extract_data',
        description: 'Extract specific data from a webpage',
        arguments: [
          {
            name: 'url',
            description: 'URL of the webpage',
            required: true
          },
          {
            name: 'data_type',
            description: 'Type of data to extract (links, images, text, etc.)',
            required: true
          }
        ]
      }
    ];
  }

  async getResources(): Promise<MCPResource[]> {
    return [
      {
        uri: 'fetch://cache',
        name: 'Fetch Cache',
        description: 'Cached web content for faster access',
        mimeType: 'application/json'
      }
    ];
  }

  async callTool(name: string, args: any): Promise<any> {
    switch (name) {
      case 'fetch_url':
        return await this.fetchUrl(args.url, args.format || 'text');
      case 'search_web':
        return await this.searchWeb(args.query, args.limit || 5);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async fetchUrl(url: string, format: string = 'text'): Promise<any> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();
      
      switch (format) {
        case 'html':
          return { content, format: 'html', url };
        case 'markdown':
          // Simple HTML to Markdown conversion
          const markdown = content
            .replace(/<h([1-6])>(.*?)<\/h[1-6]>/gi, (_, level, text) => '#'.repeat(parseInt(level)) + ' ' + text + '\n')
            .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
            .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
            .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
            .replace(/<em>(.*?)<\/em>/gi, '*$1*')
            .replace(/<[^>]*>/g, ''); // Remove remaining HTML tags
          return { content: markdown, format: 'markdown', url };
        default:
          // Extract text content
          const text = content
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim();
          return { content: text, format: 'text', url };
      }
    } catch (error) {
      throw new Error(`Failed to fetch URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async searchWeb(query: string, limit: number = 5): Promise<any> {
    // Mock search results - في التطبيق الحقيقي يمكن استخدام Google Search API أو DuckDuckGo
    const mockResults = [
      {
        title: `نتيجة البحث الأولى عن: ${query}`,
        url: `https://example.com/search?q=${encodeURIComponent(query)}`,
        snippet: `هذه نتيجة بحث وهمية عن "${query}". في التطبيق الحقيقي ستعرض نتائج حقيقية.`,
        date: new Date().toISOString()
      },
      {
        title: `نتيجة البحث الثانية عن: ${query}`,
        url: `https://example2.com/search?q=${encodeURIComponent(query)}`,
        snippet: `المزيد من المعلومات حول "${query}" متوفرة هنا.`,
        date: new Date().toISOString()
      }
    ];

    return {
      query,
      results: mockResults.slice(0, limit),
      total: mockResults.length
    };
  }

  async connect(): Promise<boolean> {
    // محاكاة الاتصال
    return true;
  }

  async disconnect(): Promise<void> {
    // محاكاة قطع الاتصال
  }

  async getStatus(): Promise<'connected' | 'disconnected' | 'error'> {
    return 'connected';
  }
}
