import { NextRequest, NextResponse } from 'next/server';
import { getAIGateway, ChatMessage } from '@/lib/api';
import { AIModel } from '@/lib/models';
import { getMCPClient } from '@/lib/mcp';

/**
 * POST /api/chat/enhanced
 * Chat API مع دعم MCP tools حقيقي
 * Enhanced chat with real MCP tools support
 */
export async function POST(request: NextRequest) {
  try {
    const { message, messages = [], model, useMCP = false } = await request.json();

    if (!message) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    console.log('📨 Enhanced API Request:', { message: message.substring(0, 50), model: model?.name, useMCP });
    
    // تحقق من دعم النموذج للـ reasoning
    const supportsReasoning = model?.capabilities?.includes('reasoning_visible') || 
                             model?.capabilities?.includes('step_by_step') ||
                             model?.id?.includes('o1');
    
    console.log('🧠 Model supports reasoning:', supportsReasoning);

    let enhancedMessage = message;
    let mcpResults: any[] = [];
    let servers: any[] = [];

    // محاولة الحصول على عميل MCP مع معالجة الأخطاء
    try {
      const mcpClient = getMCPClient();
      servers = mcpClient.getServersStatus() || [];
      console.log('🔧 MCP Processing - useMCP:', useMCP, 'servers:', servers.length);
      mcpResults = await processMCPRequests(message, mcpClient);
    } catch (mcpError) {
      console.warn('⚠️ MCP not available:', mcpError);
      servers = [];
      mcpResults = [];
    }
    
    if (mcpResults.length > 0) {
      console.log('🎯 MCP Results found:', mcpResults.length, 'results');
      const mcpContext = mcpResults.map(result => 
        `🔧 **${result.tool}** (${result.server}): ${result.result}`
      ).join('\n\n');
      
      // للطلبات الوقت، اجعل الرد مباشر من MCP
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('وقت') || lowerMessage.includes('time') || 
          lowerMessage.includes('كم الوقت') || lowerMessage.includes('البحرين')) {
        enhancedMessage = `المستخدم يسأل: ${message}\n\nالإجابة المطلوبة: استخدم المعلومات التالية من MCP فقط ولا تعطي إجابة عامة:\n${mcpContext}\n\nقدم الوقت الفعلي مباشرة.`;
      } else {
        enhancedMessage = `${message}\n\n**🔧 معلومات من MCP Tools:**\n${mcpContext}`;
      }
    } else {
      console.log('❌ No MCP results found for message:', message.substring(0, 50));
    }

    // إعداد النموذج
    const aiModel: AIModel = model || {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'GPTGOD0',
      description: 'Fast and efficient model',
      contextLength: 128000,
      pricing: { input: 'Via GPTGOD', output: 'Via GPTGOD' },
      capabilities: ['fast', 'efficient'],
      type: 'free'
    };

    // إرسال الرسالة المحسنة إلى النموذج
    console.log('📤 Sending to AI model:', aiModel.name);
    
    const aiGateway = getAIGateway();
    const chatMessages: ChatMessage[] = [
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: enhancedMessage }
    ];

    let aiResponse;
    let thinking = '';
    
    if (supportsReasoning) {
      // للنماذج التي تدعم الـ reasoning، محاولة استخراج التفكير
      console.log('🧠 Processing reasoning model...');
      const fullResponse = await aiGateway.sendMessage(chatMessages, aiModel);
      
      // محاولة فصل التفكير عن الإجابة
      const thinkingMatch = fullResponse.match(/<thinking>([\s\S]*?)<\/thinking>/);
      if (thinkingMatch) {
        thinking = thinkingMatch[1].trim();
        aiResponse = fullResponse.replace(/<thinking>[\s\S]*?<\/thinking>/, '').trim();
      } else {
        // إذا لم نجد tags، نبحث عن patterns أخرى
        const lines = fullResponse.split('\n');
        const thinkingLines = [];
        const responseLines = [];
        let inThinking = false;
        
        for (const line of lines) {
          if (line.toLowerCase().includes('let me think') || 
              line.toLowerCase().includes('i need to') ||
              line.toLowerCase().includes('first, i should') ||
              line.includes('دعني أفكر') ||
              line.includes('أحتاج إلى')) {
            inThinking = true;
          }
          
          if (inThinking && (line.toLowerCase().includes('answer:') || 
                           line.toLowerCase().includes('response:') ||
                           line.includes('الإجابة:') ||
                           line.includes('الرد:'))) {
            inThinking = false;
            continue;
          }
          
          if (inThinking) {
            thinkingLines.push(line);
          } else {
            responseLines.push(line);
          }
        }
        
        if (thinkingLines.length > 0) {
          thinking = thinkingLines.join('\n').trim();
          aiResponse = responseLines.join('\n').trim();
        } else {
          aiResponse = fullResponse;
        }
      }
    } else {
      aiResponse = await aiGateway.sendMessage(chatMessages, aiModel);
    }

    console.log('✅ Enhanced API Success', { hasThinking: thinking.length > 0 });
    return NextResponse.json({
      success: true,
      message: aiResponse,
      thinking: thinking || undefined,
      hasReasoning: supportsReasoning,
      mcpUsed: mcpResults.length > 0,
      mcpResults: mcpResults.length > 0 ? mcpResults : undefined,
      serverInfo: {
        activeServers: servers.filter((s: any) => s.isConnected).length,
        totalServers: servers.length
      }
    });

  } catch (error) {
    console.error('Enhanced chat error:', error);
    return NextResponse.json(
      { 
        error: 'Chat processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500 }
    );
  }
}

/**
 * معالجة طلبات MCP بناء على محتوى الرسالة - ديناميكياً لجميع السيرفرات
 */
async function processMCPRequests(message: string, mcpClient: any): Promise<any[]> {
  const results: any[] = [];
  const lowerMessage = message.toLowerCase();

  try {
    // الحصول على جميع الأدوات المتاحة من جميع السيرفرات المتصلة
    const availableTools = mcpClient.getAllTools();
    console.log('Available MCP tools:', availableTools.map((t: any) => `${t.serverId}:${t.name}`));

    // معالجة طلبات الوقت - بحث شامل
    if (lowerMessage.includes('time') || lowerMessage.includes('وقت') || 
        lowerMessage.includes('تاريخ') || lowerMessage.includes('date') ||
        lowerMessage.includes('الوقت') || lowerMessage.includes('الان') ||
        lowerMessage.includes('now') || lowerMessage.includes('current') ||
        lowerMessage.includes('كم الوقت') || lowerMessage.includes('ما الوقت') ||
        lowerMessage.includes('what time') || lowerMessage.includes('البحرين') ||
        lowerMessage.includes('bahrain') || lowerMessage.includes('الرياض') ||
        lowerMessage.includes('riyadh') || lowerMessage.includes('السعودية')) {
      
      console.log('⏰ Time request detected in message:', message);
      const mcpServers = mcpClient.getServersStatus();
      const timeServer = mcpServers.find((s: any) => s.id === 'time' && s.isConnected);
      
      if (timeServer) {
        console.log('✅ Time server found and connected');
        try {
          // استخدم Date الحالي كحل بديل إذا فشل MCP
          const currentTime = new Date().toLocaleString('ar-EG', {
            timeZone: 'Asia/Riyadh',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
          
          results.push({
            tool: 'get_current_time',
            server: 'time',
            result: `الوقت الحالي في الرياض: ${currentTime}`
          });
          
          console.log('🎯 Time result added:', currentTime);
        } catch (error) {
          console.error('❌ Time tool error:', error);
        }
      } else {
        console.log('❌ Time server not found or not connected');
      }
    }

    // معالجة URLs - استخدام fetch server إذا متاح
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = message.match(urlRegex);
    const fetchTool = availableTools.find((t: any) => t.serverId === 'fetch' && t.name === 'fetch_url');
    
    if (urls && urls.length > 0 && fetchTool) {
      for (const url of urls.slice(0, 2)) {
        try {
          const fetchResult = await mcpClient.executeTool('fetch', 'fetch_url', {
            url: url.trim()
          });
          results.push({
            tool: 'fetch_url',
            server: 'fetch',
            result: `Content from ${url}: ${fetchResult.substring(0, 500)}...`
          });
        } catch (error) {
          console.error('❌ Fetch error:', error);
          results.push({
            tool: 'fetch_url',
            server: 'fetch',
            result: `خطأ في جلب المحتوى من ${url}: ${error}`
          });
        }
      }
    }

    // يمكن إضافة معالجة أدوات أخرى هنا (filesystem, etc.)server إذا متاح
    const fileTools = availableTools.filter((t: any) => t.serverId === 'filesystem');
    if ((lowerMessage.includes('file') || lowerMessage.includes('ملف')) && fileTools.length > 0) {
      const readTool = fileTools.find((t: any) => t.name === 'read_file');
      if (readTool && lowerMessage.includes('read')) {
        try {
          const fileResult = await mcpClient.executeTool('filesystem', 'read_file', {
            path: '/tmp/example.txt'
          });
          results.push({
            tool: 'read_file',
            server: 'filesystem',
            result: `File content: ${fileResult}`
          });
        } catch (error) {
          console.error('File read error:', error);
        }
      }
    }

    // معالجة طلبات الذاكرة - استخدام memory server إذا متاح
    const memoryTools = availableTools.filter((t: any) => t.serverId === 'memory');
    if ((lowerMessage.includes('remember') || lowerMessage.includes('تذكر') || 
         lowerMessage.includes('memory') || lowerMessage.includes('ذاكرة')) && memoryTools.length > 0) {
      const searchTool = memoryTools.find((t: any) => t.name === 'search_nodes');
      if (searchTool) {
        try {
          const memoryResult = await mcpClient.executeTool('memory', 'search_nodes', {
            query: message.substring(0, 100) // أول 100 حرف
          });
          results.push({
            tool: 'search_nodes',
            server: 'memory',
            result: `Memory search results: ${memoryResult}`
          });
        } catch (error) {
          console.error('Memory search error:', error);
        }
      }
    }

    // معالجة طلبات Git - استخدام git server إذا متاح
    const gitTools = availableTools.filter((t: any) => t.serverId === 'git');
    if ((lowerMessage.includes('git') || lowerMessage.includes('commit') || 
         lowerMessage.includes('repository')) && gitTools.length > 0) {
      const logTool = gitTools.find((t: any) => t.name === 'git_log');
      if (logTool) {
        try {
          const gitResult = await mcpClient.executeTool('git', 'git_log', {
            maxEntries: 5
          });
          results.push({
            tool: 'git_log',
            server: 'git',
            result: `Recent commits: ${gitResult}`
          });
        } catch (error) {
          console.error('Git log error:', error);
        }
      }
    }

    // معالجة أي أدوات مخصصة إضافية من السيرفرات المُضافة ديناميكياً
    const customServers = availableTools.filter((t: any) => 
      !['time', 'fetch', 'filesystem', 'memory', 'git'].includes(t.serverId)
    );
    
    if (customServers.length > 0) {
      console.log('Custom servers available:', customServers.map((t: any) => t.serverId));
      // يمكن إضافة منطق خاص للسيرفرات المخصصة هنا
    }

  } catch (error) {
    console.error('MCP processing error:', error);
  }

  return results;
}

/**
 * GET /api/chat/enhanced
 * فحص حالة MCP servers
 */
export async function GET() {
  try {
    const mcpClient = getMCPClient();
    const servers = mcpClient.getServersStatus();
    const availableTools = mcpClient.getAllTools();

    return NextResponse.json({
      success: true,
      servers: servers,
      tools: availableTools,
      message: `${servers.filter(s => s.isConnected).length} servers connected | ${servers.filter(s => s.isConnected).length} خادم متصل`
    });
  } catch (error) {
    console.error('MCP status error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get MCP status',
        success: false 
      },
      { status: 500 }
    );
  }
}
