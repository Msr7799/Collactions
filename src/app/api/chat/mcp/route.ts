import { NextRequest, NextResponse } from 'next/server';
import { getMCPClientsManager } from '@/lib/mcpClient';
import { handleAPIError } from '@/lib/errorHandling';
import { getAIGateway, ChatMessage } from '@/lib/api';
import { AIModel } from '@/lib/models';

/**
 * POST /api/chat/mcp
 * إرسال رسالة مع استخدام MCP Sequential Thinking
 * Send message using MCP Sequential Thinking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      messages = [], 
      model, 
      useSequentialThinking = true,
      maxThinkingSteps = 5 
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { 
          error: 'Invalid message | رسالة غير صالحة',
          message: 'Message is required | الرسالة مطلوبة'
        }, 
        { status: 400 }
      );
    }

    // إعداد النموذج الافتراضي | Setup default model
    const aiModel: AIModel = model || {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'GPTGOD0',
      description: 'إصدار مضغوط من GPT-4o، أسرع وأكثر كفاءة للمهام البسيطة',
      contextLength: 128000,
      pricing: { input: 'Via GPTGOD', output: 'Via GPTGOD' },
      capabilities: ['fast', 'efficient', 'general_purpose', 'cost_effective'],
      type: 'free'
    };

    let response = '';
    let thinkingSteps: any[] = [];

    if (useSequentialThinking) {
      try {
        // الحصول على مدير عملاء MCP | Get MCP clients manager
        const mcpManager = getMCPClientsManager();
        
        // محاولة الحصول على عميل sequential-thinking | Try to get sequential-thinking client
        let sequentialClient = mcpManager.getClient('sequential-thinking');
        
        if (!sequentialClient) {
          // إضافة عميل sequential-thinking إذا لم يكن موجود
          // Add sequential-thinking client if not exists
          console.log('Adding sequential-thinking MCP client...');
          
          const clientAdded = await mcpManager.addClient(
            'sequential-thinking',
            'npx',
            ['-y', 'mcp-sequentialthinking-tools']
          );
          
          if (clientAdded) {
            sequentialClient = mcpManager.getClient('sequential-thinking');
            console.log('Sequential-thinking client added successfully');
          } else {
            console.warn('Failed to add sequential-thinking client, falling back to direct AI');
          }
        }

        // استخدام التفكير المتسلسل إذا كان العميل متاح | Use sequential thinking if client available
        if (sequentialClient && sequentialClient.isServerConnected()) {
          console.log('Using sequential thinking for message processing...');
          
          // خطوات التفكير المتسلسل | Sequential thinking steps
          let currentStep = 1;
          let needsMoreSteps = true;
          
          // الخطوة الأولى: تحليل الرسالة | Step 1: Analyze message
          let currentThought = `تحليل الرسالة الواردة من المستخدم: "${message}"

أحتاج إلى:
1. فهم ما يطلبه المستخدم بدقة
2. تحديد نوع الإجابة المطلوبة (معلوماتية، إبداعية، تقنية، إلخ)
3. جمع السياق من الرسائل السابقة إن وجدت
4. تخطيط للإجابة الأمثل

Analyzing user message: "${message}"

I need to:
1. Understand precisely what the user is requesting
2. Determine the type of response needed (informational, creative, technical, etc.)
3. Gather context from previous messages if any
4. Plan for the optimal response`;

          // الأدوات المتاحة للتفكير | Available tools for thinking
          const availableTools = [
            'getAIGateway',
            'sendMessage',
            'parseContent',
            'generateResponse'
          ];

          while (needsMoreSteps && currentStep <= maxThinkingSteps) {
            try {
              const thinkingStep = await sequentialClient.useSequentialThinking(
                currentThought,
                {
                  stepNumber: currentStep,
                  totalSteps: maxThinkingSteps,
                  nextStepNeeded: currentStep < maxThinkingSteps,
                  availableTools
                }
              );

              thinkingSteps.push({
                step: currentStep,
                thought: thinkingStep.thought,
                currentStep: thinkingStep.currentStep,
                recommendedTools: thinkingStep.currentStep?.recommendedTools || []
              });

              console.log(`Sequential thinking step ${currentStep}:`, thinkingStep.thought.substring(0, 100) + '...');

              needsMoreSteps = thinkingStep.nextStepNeeded;
              currentStep++;

              // تحديث الفكرة للخطوة التالية | Update thought for next step
              if (needsMoreSteps && currentStep <= maxThinkingSteps) {
                if (currentStep === 2) {
                  currentThought = `بناءً على التحليل السابق، سأقوم الآن بتخطيط الإجابة:

المعلومات المطلوبة:
- ${message.includes('?') ? 'سؤال يحتاج إجابة مباشرة' : 'طلب يحتاج تنفيذ'}
- السياق: ${messages.length > 0 ? `${messages.length} رسائل سابقة` : 'لا يوجد سياق سابق'}

خطة الإجابة:
1. تقديم إجابة شاملة ومفيدة
2. استخدام اللغتين العربية والإنجليزية حسب قواعد المستخدم
3. تنسيق الإجابة بشكل واضح ومقروء

Based on previous analysis, I'll now plan the response:

Required information:
- ${message.includes('?') ? 'Question needing direct answer' : 'Request needing implementation'}
- Context: ${messages.length > 0 ? `${messages.length} previous messages` : 'No previous context'}

Response plan:
1. Provide comprehensive and useful answer
2. Use both Arabic and English according to user rules
3. Format response clearly and readably`;
                
                } else if (currentStep === 3) {
                  currentThought = `الآن سأقوم بصياغة الإجابة النهائية مع مراعاة:

التفاصيل المهمة:
- دقة المعلومات المقدمة
- وضوح الشرح
- تطبيق قواعد المستخدم (النصوص بالعربية والإنجليزية)
- تنسيق مناسب للقراءة

سأستخدم نموذج الذكاء الاصطناعي لإنتاج إجابة عالية الجودة.

Now I'll craft the final response considering:

Important details:
- Accuracy of provided information
- Clear explanation
- Apply user rules (texts in Arabic and English)
- Proper formatting for readability

I'll use the AI model to generate a high-quality response.`;

                } else if (currentStep >= 4) {
                  currentThought = `مراجعة نهائية وتحسين الإجابة:

التأكد من:
- شمولية الإجابة
- جودة المحتوى
- تطبيق القواعد اللغوية
- مناسبة الإجابة للسؤال

Final review and response improvement:

Ensuring:
- Comprehensive answer
- Content quality  
- Language rules application
- Response appropriateness to question`;
                }
              }

            } catch (error) {
              console.error(`Error in sequential thinking step ${currentStep}:`, error);
              break;
            }
          }

          console.log(`Sequential thinking completed with ${thinkingSteps.length} steps`);
        }

      } catch (error) {
        console.error('Error in MCP sequential thinking:', error);
        console.log('Falling back to direct AI response...');
      }
    }

    // إرسال الرسالة للنموذج | Send message to AI model
    const aiGateway = getAIGateway();
    const chatMessages: ChatMessage[] = [
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];

    // إضافة سياق التفكير المتسلسل إذا كان متاحاً | Add sequential thinking context if available
    if (thinkingSteps.length > 0) {
      const thinkingContext = `قام نظام التفكير المتسلسل بتحليل طلبك في ${thinkingSteps.length} خطوات:

${thinkingSteps.map(step => `الخطوة ${step.step}: ${step.thought.substring(0, 200)}...`).join('\n\n')}

The sequential thinking system analyzed your request in ${thinkingSteps.length} steps:

${thinkingSteps.map(step => `Step ${step.step}: ${step.thought.substring(0, 200)}...`).join('\n\n')}

بناءً على هذا التحليل، سأقدم لك إجابة شاملة ومدروسة:

Based on this analysis, I'll provide you with a comprehensive and well-considered answer:`;

      chatMessages.unshift({ 
        role: 'system', 
        content: thinkingContext 
      });
    }

    try {
      response = await aiGateway.sendMessage(chatMessages, aiModel);
    } catch (error) {
      console.error('Error sending message to AI:', error);
      throw error;
    }

    // إرجاع الاستجابة مع خطوات التفكير | Return response with thinking steps
    return NextResponse.json({
      success: true,
      message: response,
      thinkingSteps: thinkingSteps.length > 0 ? thinkingSteps : undefined,
      mcpUsed: thinkingSteps.length > 0,
      model: aiModel.name,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in MCP chat endpoint:', error);
    const apiError = handleAPIError(error);
    
    return NextResponse.json(
      { 
        error: apiError.code,
        message: apiError.message,
        success: false
      }, 
      { status: apiError.status }
    );
  }
}

/**
 * GET /api/chat/mcp
 * التحقق من حالة خوادم MCP
 * Check MCP servers status
 */
export async function GET() {
  try {
    const mcpManager = getMCPClientsManager();
    const connectedClients = mcpManager.getConnectedClients();
    
    // محاولة إضافة عميل sequential-thinking إذا لم يكن متصلاً
    // Try to add sequential-thinking client if not connected
    if (!connectedClients.includes('sequential-thinking')) {
      console.log('Attempting to connect sequential-thinking client...');
      const clientAdded = await mcpManager.addClient(
        'sequential-thinking',
        'npx',
        ['-y', 'mcp-sequentialthinking-tools']
      );
      
      if (clientAdded) {
        connectedClients.push('sequential-thinking');
      }
    }

    return NextResponse.json({
      success: true,
      connectedClients,
      availableFeatures: {
        sequentialThinking: connectedClients.includes('sequential-thinking'),
        enhancedReasoning: connectedClients.includes('sequential-thinking'),
        stepByStepAnalysis: connectedClients.includes('sequential-thinking')
      },
      message: `${connectedClients.length} MCP servers connected | ${connectedClients.length} خادم MCP متصل`
    });

  } catch (error) {
    console.error('Error checking MCP status:', error);
    const apiError = handleAPIError(error);
    
    return NextResponse.json(
      { 
        error: apiError.code,
        message: apiError.message,
        success: false
      }, 
      { status: apiError.status }
    );
  }
}
