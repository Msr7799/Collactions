// src/app/api/generate-image/route.ts
// API route to generate images using GPT-4o for description and Hugging Face for image generation
// يدعم تحسين الوصف، الترجمة، وتحسين الوصف فقط بدون توليد صورة

import { NextRequest, NextResponse } from 'next/server';
import { AIAPIGateway } from '@/lib/api';
import { gptGodModels, huggingFaceModels, openRouterModels, AIModel } from '@/lib/models';
import { saveImageAsBase64, saveImageAsFile, saveImageWithResponsive } from '@/utils/saveImage';
import { validateImageBlob, validateImageRequest, validateImage } from '@/utils/validateImage';
import { generateResponsive, extractImageMetadata } from '@/utils/generateResponsive';
import { 
  imageGenerationLimiter, 
  enhancePromptLimiter, 
  getClientIdentifier, 
  createRateLimitResponse 
} from '@/utils/rateLimiter';

/**
 * Helper function to create consistent response headers
 */
function createResponseHeaders(options: {
  cacheControl?: string;
  rateLimit?: { remaining: number; resetTime: number };
} = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (options.cacheControl) {
    headers['Cache-Control'] = options.cacheControl;
  }
  
  if (options.rateLimit) {
    headers['X-RateLimit-Remaining'] = options.rateLimit.remaining.toString();
    headers['X-RateLimit-Reset'] = options.rateLimit.resetTime.toString();
  }
  
  return headers;
}

/**
 * POST /api/generate-image
 * توليد الصور باستخدام GPT-4o لتوليد الوصف + Hugging Face لتوليد الصورة الفعلية
 * Generate images using GPT-4o for description + Hugging Face for actual image generation
 */
export async function POST(request: NextRequest) {
  try {
    // 🛡️ Rate limiting - Check if client is within allowed limits
    const clientId = getClientIdentifier(request);
    const rateLimit = imageGenerationLimiter.isAllowed(clientId);
    
    if (!rateLimit.allowed) {
      console.log(`🚫 Rate limit exceeded for client: ${clientId}`);
      return createRateLimitResponse(
        rateLimit.remaining, 
        rateLimit.resetTime,
        'Too many image generation requests. Please wait before trying again | طلبات كثيرة لتوليد الصور، يرجى الانتظار قبل المحاولة مرة أخرى'
      );
    }
    
    const body = await request.json();
    const { 
      prompt,
      model = "black-forest-labs/FLUX.1-dev", // Default HF image model
      size = "1024x1024",
      quality = "standard",
      useGPT4Description = false, // خيار لاستخدام نموذج لتحسين الوصف - معطل افتراضياً
      descriptionModel = "gpt-4o-mini", // النموذج المستخدم لتحسين الوصف (أوفر من gpt-4o)
      enhanceOnly = false, // خيار لتحسين الوصف فقط بدون توليد صورة
      translateOnly = false // خيار لترجمة النص العربي للإنجليزية فقط
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { 
          error: 'Prompt is required | النص المطلوب مطلوب'
        }, 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // التحقق من صحة معاملات الطلب
    const validation = validateImageRequest(prompt, model);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: validation.error
        }, 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    console.log(`Generating image with prompt: "${prompt}"`);
    console.log(`Using model: ${model}, Description enhancement: ${useGPT4Description ? descriptionModel : 'disabled'}`);

    const aiGateway = new AIAPIGateway();
    let finalPrompt = prompt;
    let gptDescription = null;
    let usedDescriptionModel = null;

    // الخطوة 1: استخدام نموذج لتحسين وصف الصورة (اختياري)
    if (useGPT4Description) {
      try {
        console.log(`Using ${descriptionModel} to enhance image description...`);
        
        // البحث عن النموذج المطلوب في جميع النماذج المتاحة
        let selectedModel = [...gptGodModels, ...openRouterModels, ...huggingFaceModels].find((m: AIModel) => m.id === descriptionModel);
        
        // fallback للنماذج الشائعة
        if (!selectedModel) {
          console.warn(`Model ${descriptionModel} not found, trying alternatives...`);
          selectedModel = gptGodModels.find((m: AIModel) => m.id === 'gpt-4o-mini') || 
                        gptGodModels.find((m: AIModel) => m.id === 'gpt-3.5-turbo') ||
                        gptGodModels.find((m: AIModel) => m.id === 'gpt-4o');
        }
        
        if (!selectedModel) {
          throw new Error(`Description model not found: ${descriptionModel}`);
        }

        usedDescriptionModel = selectedModel;

        // طلب تحسين الوصف أو الترجمة
        let systemPrompt = '';
        let userContent = '';
        
        if (translateOnly) {
          systemPrompt = 'You are a professional Arabic-English translator. Translate the Arabic text to natural, accurate English while preserving the meaning, tone, and context. Provide only the English translation without explanations.';
          userContent = prompt;
        } else {
          systemPrompt = '';
          userContent = `Enhance this image description for better AI image generation. Make it detailed and vivid but concise. Original: "${prompt}"`;
        }

        const messages = translateOnly ? [
          {
            role: 'system' as const,
            content: systemPrompt
          },
          {
            role: 'user' as const,
            content: userContent
          }
        ] : [
          {
            role: 'user' as const,
            content: userContent
          }
        ];

        const enhancedDescription = await aiGateway.sendMessage(messages, selectedModel);

        gptDescription = enhancedDescription;
        finalPrompt = enhancedDescription.trim();
        console.log(`Enhanced description from ${selectedModel.name}:`, finalPrompt);

        // إذا كان المطلوب تحسين الوصف فقط، أرجع النتيجة هنا
        if (enhanceOnly) {
          // Use more lenient rate limit for text enhancement
          const enhanceRateLimit = enhancePromptLimiter.isAllowed(clientId);
          
          return NextResponse.json({
            success: true,
            finalPrompt: finalPrompt,
            originalPrompt: prompt,
            descriptionModel: selectedModel.name,
            model: selectedModel.id,
            provider: selectedModel.provider,
            type: 'enhancement'
          }, {
            headers: createResponseHeaders({
              cacheControl: 'no-cache, must-revalidate',
              rateLimit: enhanceRateLimit
            })
          });
        }
        
      } catch (enhancementError: any) {
        console.warn(`${descriptionModel} enhancement failed, using original prompt:`, enhancementError.message);
        // استخدم الـ prompt الأصلي في حالة فشل النموذج
        usedDescriptionModel = null;
      }
    }

    // الخطوة 2: تحقق من وجود نموذج Hugging Face
    const imageModel = huggingFaceModels.find((m: AIModel) => m.id === model);
    if (!imageModel || !imageModel.capabilities.includes('text_to_image')) {
      return NextResponse.json(
        { 
          error: `Model ${model} not found or doesn't support image generation | النموذج ${model} غير موجود أو لا يدعم توليد الصور`
        }, 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // الخطوة 3: توليد الصورة الفعلية باستخدام Hugging Face
    try {
      console.log('Generating actual image with Hugging Face...');
      
      const imageBlob = await aiGateway.generateImageHF(finalPrompt, model);
      
      // التحقق من صحة الصورة المولدة
      const blobValidation = validateImageBlob(imageBlob);
      if (!blobValidation.isValid) {
        return NextResponse.json(
          { 
            error: blobValidation.error || 'Invalid generated image | صورة مولدة غير صحيحة'
          }, 
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // حفظ الصورة مع توليد النسخ المتجاوبة للأداء الأفضل
      try {
        // تحديد امتداد الملف بناءً على نوع المحتوى
        const extension = imageBlob.type === 'image/jpeg' ? 'jpg' : 
                         imageBlob.type === 'image/webp' ? 'webp' : 'png';
        
        // تحويل Blob إلى Buffer
        const arrayBuffer = await imageBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const savedImage = await saveImageWithResponsive(buffer, extension);
        
        // استخراج معلومات الصورة (اختياري)
        const imageMetadata = extractImageMetadata(`data:${savedImage.contentType};base64,${buffer.toString('base64')}`);

        // إرجاع استجابة JSON مرتبة مع معلومات الصورة المتجاوبة
        return NextResponse.json({
          success: true,
          url: savedImage.filePath,
          srcset: savedImage.responsive.srcSet,
          sizes: "(max-width: 600px) 100vw, 600px",
          alt: "Generated AI Image",
          prompt: prompt,
          finalPrompt: finalPrompt,
          gptDescription: gptDescription,
          model: imageModel.name,
          provider: 'Hugging Face',
          type: 'image',
          enhanced: useGPT4Description && gptDescription !== null,
          descriptionModel: usedDescriptionModel ? usedDescriptionModel.name : null,
          metadata: {
            originalPrompt: prompt,
            enhancedPrompt: finalPrompt,
            imageModel: model,
            descriptionModel: usedDescriptionModel ? usedDescriptionModel.id : null,
            size: size,
            generatedAt: new Date().toISOString(),
            imageSize: savedImage.size,
            contentType: savedImage.contentType,
            fileName: savedImage.fileName,
            imageMetadata: imageMetadata
          }
        }, {
          headers: createResponseHeaders({
            cacheControl: 'public, max-age=86400, s-maxage=86400',
            rateLimit: rateLimit
          })
        });
      } catch (validationError: any) {
        console.error('🔒 Image validation failed:', validationError.message);
        return NextResponse.json(
          { 
            error: validationError.message || 'Invalid image format or size | تنسيق أو حجم الصورة غير صحيح'
          }, 
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

    } catch (hfError: any) {
      console.error('Hugging Face image generation failed:', hfError);
      
      // معالجة أخطاء Hugging Face
      if (hfError.message?.includes('401') || hfError.message?.includes('unauthorized')) {
        return NextResponse.json(
          { 
            error: 'Invalid Hugging Face token | مفتاح Hugging Face غير صحيح'
          }, 
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // معالجة خطأ 402 - Payment Required
      if (hfError.message?.includes('402') || hfError.message?.includes('payment') || hfError.message?.includes('billing')) {
        return NextResponse.json(
          { 
            error: 'Hugging Face subscription required | يتطلب اشتراك Hugging Face مدفوع'
          }, 
          { 
            status: 402,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      if (hfError.message?.includes('503') || hfError.message?.includes('model') || hfError.message?.includes('loading')) {
        return NextResponse.json(
          { 
            error: 'Model loading error | خطأ في تحميل النموذج'
          }, 
          { 
            status: 503,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // خطأ عام في Hugging Face - عرض الوصف النصي كبديل
      if (gptDescription) {
        let fallbackMessage = 'Image generation failed but got enhanced description | فشل توليد الصورة لكن تم الحصول على وصف محسن';
        
        // رسالة خاصة لانتهاء الرصيد
        if (hfError.message?.includes('exceeded') || hfError.message?.includes('credits')) {
          fallbackMessage = 'Hugging Face monthly credits exceeded. Using GPT-4o description instead | انتهى الرصيد الشهري لـ Hugging Face، استخدام وصف GPT-4o بدلاً';
        }

        return NextResponse.json({
          success: false,
          error: 'Image generation failed, returning description | فشل توليد الصورة، تم إرجاع الوصف',
          text: gptDescription,
          prompt: prompt,
          model: 'GPT-4o (Text Description)',
          provider: 'GodGPT',
          type: 'text',
          fallback: true,
          message: fallbackMessage,
          creditsExceeded: hfError.message?.includes('exceeded') || hfError.message?.includes('credits')
        });
      }

      throw hfError;
    }

  } catch (error: any) {
    console.error('Error in image generation pipeline:', error);
    return NextResponse.json(
      {
        error: error.message || 'Internal server error | خطأ داخلي في الخادم'
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
