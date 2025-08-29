import { NextRequest, NextResponse } from 'next/server';
import { getMCPManager } from '@/lib/mcp';
import { getAIGateway } from '@/lib/api';
import { AIModel } from '@/lib/models';

/**
 * POST /api/chat/mcp-tools
 * إرسال رسالة مع تمرير أدوات MCP للنموذج
 * Send message with MCP tools passed to the model
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      messages, 
      model,
      includeAllMCPTools = true
    } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { 
          error: 'Invalid messages | رسائل غير صالحة',
          message: 'Messages array is required | مصفوفة الرسائل مطلوبة'
        }, 
        { status: 400 }
      );
    }

    // Get MCP tools
    const mcpManager = getMCPManager();
    const mcpServers = mcpManager.getServers();
    
    // Convert MCP tools to OpenAI function format
    const tools: any[] = [];
    
    if (includeAllMCPTools) {
      mcpServers.forEach(server => {
        if (server.status === 'connected' && server.tools) {
          server.tools.forEach(tool => {
            tools.push({
              type: "function",
              function: {
                name: `mcp_${server.name}_${tool.name}`,
                description: `${tool.description || tool.name} (من خادم ${server.name} | from ${server.name} server)`,
                parameters: tool.inputSchema || {
                  type: "object",
                  properties: {},
                  required: []
                }
              }
            });
          });
        }
      });
    }

    // Always include sequential thinking tool
    tools.push({
      type: "function",
      function: {
        name: "mcp_sequential_thinking",
        description: "استخدم التفكير المتسلسل لحل المشاكل المعقدة خطوة بخطوة | Use sequential thinking for complex step-by-step problem solving",
        parameters: {
          type: "object",
          properties: {
            thought: {
              type: "string",
              description: "خطوة التفكير الحالية | Current thinking step"
            },
            step_number: {
              type: "integer",
              description: "رقم الخطوة الحالية | Current step number"
            },
            total_steps: {
              type: "integer", 
              description: "إجمالي الخطوات المقدرة | Estimated total steps"
            },
            next_step_needed: {
              type: "boolean",
              description: "هل تحتاج خطوة أخرى | Whether another step is needed"
            }
          },
          required: ["thought", "step_number", "total_steps", "next_step_needed"]
        }
      }
    });

    // Add system message about available tools
    const systemMessage = {
      role: "system",
      content: `You have access to the following tools via function calls:
${tools.map(t => `- ${t.function.name}: ${t.function.description}`).join('\n')}

When a user asks about MCP tools or sequential thinking, confirm that you can use these tools and demonstrate by calling them if appropriate.

أنت تمتلك الوصول للأدوات التالية عبر استدعاءات الدوال:
${tools.map(t => `- ${t.function.name}: ${t.function.description}`).join('\n')}

عندما يسأل المستخدم عن أدوات MCP أو التفكير المتسلسل، أكد أنك تستطيع استخدام هذه الأدوات وأظهر ذلك عبر استدعائها إذا كان مناسباً.`
    };

    const messagesWithSystem = [systemMessage, ...messages];

    // Send to AI with tools
    const aiGateway = getAIGateway();
    console.log(`Sending ${tools.length} tools to AI model:`, tools.map(t => t.function.name));
    const response = await aiGateway.sendMessage(messagesWithSystem, model as AIModel, {
      tools: tools
    });

    return NextResponse.json({
      content: response,
      tools_available: tools.length,
      servers_connected: mcpServers.filter(s => s.status === 'connected').length
    });

  } catch (error: any) {
    console.error('Error in MCP tools chat:', error);
    return NextResponse.json(
      {
        error: 'Internal server error | خطأ داخلي في الخادم',
        message: error.message || 'Unknown error | خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}
