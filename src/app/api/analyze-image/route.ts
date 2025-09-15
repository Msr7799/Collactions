import { NextRequest, NextResponse } from 'next/server';
import { AIAPIGateway } from '@/lib/api';
import { allModels } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageData, modelId } = body;

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Find the image analysis model
    const model = allModels.find(m => m.id === modelId);
    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    // Check if model supports image analysis
    if (!model.capabilities.includes('image_analysis') && 
        !model.capabilities.includes('vision') &&
        !model.capabilities.includes('multimodal')) {
      return NextResponse.json(
        { error: 'Model does not support image analysis' },
        { status: 400 }
      );
    }

    const apiGateway = new AIAPIGateway();

    // For GPT-4o Vision (supports base64 images directly)
    if (model.provider === 'GPTGOD0' && model.capabilities.includes('vision')) {
      const messages = [
        {
          role: 'user' as const,
          content: `Analyze this image and describe what you see in detail. Include objects, people, activities, colors, composition, and any notable features.

Image data: ${imageData}`
        }
      ];

      const response = await apiGateway.sendMessage(messages, model);
      return NextResponse.json({
        success: true,
        analysis: response,
        model: model.id,
        provider: model.provider
      });
    }

    // For Hugging Face image analysis models
    if (model.provider === 'Hugging Face') {
      try {
        // Use the generic sendMessage method with image data as input
        const messages = [
          {
            role: 'user' as const,
            content: `Analyze this image: ${imageData}`
          }
        ];

        const response = await apiGateway.sendMessage(messages, model);
        return NextResponse.json({
          success: true,
          analysis: response,
          model: model.id,
          provider: model.provider
        });
      } catch (error) {
        console.error('HF Image analysis error:', error);
        return NextResponse.json(
          { 
            error: 'Image analysis failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Unsupported model provider for image analysis' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Image analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
