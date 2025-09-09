import { NextRequest, NextResponse } from 'next/server';
import { AIAPIGateway } from '@/lib/api';
import { gptGodModels, huggingFaceModels, openRouterModels, AIModel } from '@/lib/models';

/**
 * POST /api/generate-image
 * توليد الصور باستخدام GPT-4o لتوليد الوصف + Hugging Face لتوليد الصورة الفعلية
 * Generate images using GPT-4o for description + Hugging Face for actual image generation
 */
export async function POST(request: NextRequest) {
  try {
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
          error: 'Prompt is required | النص المطلوب مطلوب',
          message: 'Please provide a text prompt for image generation | يرجى تقديم نص لتوليد الصورة'
        }, 
        { status: 400 }
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
          return NextResponse.json({
            success: true,
            finalPrompt: finalPrompt,
            originalPrompt: prompt,
            descriptionModel: selectedModel.name,
            model: selectedModel.id,
            provider: selectedModel.provider,
            type: 'enhancement'
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
          error: 'Image generation model not found | نموذج توليد الصور غير موجود',
          message: `Model ${model} not found or doesn't support image generation | النموذج ${model} غير موجود أو لا يدعم توليد الصور`
        }, 
        { status: 400 }
      );
    }

    // الخطوة 3: توليد الصورة الفعلية باستخدام Hugging Face
    try {
      console.log('Generating actual image with Hugging Face...');
      
      const imageBlob = await aiGateway.generateImageHF(finalPrompt, model);
      
      // تحويل Blob إلى Base64 للعرض في Frontend
      const arrayBuffer = await imageBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // تحديد نوع الصورة بناءً على المحتوى أو استخدام PNG كافتراضي
      const contentType = imageBlob.type || 'image/png';
      const base64Image = `data:${contentType};base64,${buffer.toString('base64')}`;

      console.log('Image generated successfully:', {
        size: buffer.length,
        contentType: contentType,
        base64Preview: base64Image.substring(0, 100) + '...'
      });

      return NextResponse.json({
        success: true,
        image: base64Image, // صورة فعلية بصيغة base64
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
          generatedAt: new Date().toISOString()
        }
      });

    } catch (hfError: any) {
      console.error('Hugging Face image generation failed:', hfError);
      
      // معالجة أخطاء Hugging Face
      if (hfError.message?.includes('401') || hfError.message?.includes('unauthorized')) {
        return NextResponse.json(
          { 
            error: 'Invalid Hugging Face token | مفتاح Hugging Face غير صحيح',
            message: 'Please check your HF_TOKEN configuration | تحقق من إعداد مفتاح Hugging Face'
          }, 
          { status: 401 }
        );
      }

      // معالجة خطأ 402 - Payment Required
      if (hfError.message?.includes('402') || hfError.message?.includes('payment') || hfError.message?.includes('billing')) {
        return NextResponse.json(
          { 
            error: 'Hugging Face subscription required | يتطلب اشتراك Hugging Face مدفوع',
            message: 'Free tier limit exceeded. Please upgrade your Hugging Face account or try again later | تم تجاوز الحد المجاني، يرجى ترقية حسابك أو المحاولة لاحقاً',
            type: 'payment_required',
            fallback: true
          }, 
          { status: 402 }
        );
      }

      if (hfError.message?.includes('503') || hfError.message?.includes('model') || hfError.message?.includes('loading')) {
        return NextResponse.json(
          { 
            error: 'Model loading error | خطأ في تحميل النموذج',
            message: 'The image generation model is loading. Please try again in a few minutes | النموذج قيد التحميل، حاول مرة أخرى خلال دقائق'
          }, 
          { status: 503 }
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
        error: 'Internal server error | خطأ داخلي في الخادم',
        message: error.message || 'Unknown error occurred | حدث خطأ غير معروف',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
