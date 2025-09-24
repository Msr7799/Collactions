import { ChatMessage, ChatRequest, ApiError } from '../types';
import { AIModel, allModels } from './models';

// API Response interfaces
interface APIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenRouterResponse extends APIResponse {
  id?: string;
  model?: string;
  created?: number;
}

// Environment variables interface
interface APIKeys {
  GPTGOD_API: string;
  GPTGOD_API2: string;
  OPEN_ROUTER_API: string;
  OPEN_ROUTER_API2: string;
  HF_TOKEN: string; // Primary Hugging Face token
  HF_TOKEN2: string; // Backup Hugging Face token
}

// Chat message interface for internal use
interface InternalChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Stream response interface
interface StreamResponse {
  choices: Array<{
    delta: {
      content?: string;
      role?: string;
    };
    finish_reason?: string;
  }>;
}

// Advanced API Gateway Class
export class AIAPIGateway {
  private apiKeys: APIKeys;
  private retryAttempts: number = 3;
  private retryDelay: number = 1000;

  constructor() {
    this.apiKeys = {
      GPTGOD_API: process.env.NEXT_PUBLIC_GPTGOD_API || '',
      GPTGOD_API2: process.env.NEXT_PUBLIC_GPTGOD_API2 || '',
      OPEN_ROUTER_API: process.env.NEXT_PUBLIC_OPEN_ROUTER_API || '',
      OPEN_ROUTER_API2: process.env.NEXT_PUBLIC_OPEN_ROUTER_API2 || '',
      HF_TOKEN: process.env.NEXT_PUBLIC_HF_TOKEN || '', // Primary HF token
      HF_TOKEN2: process.env.NEXT_PUBLIC_HF_TOKEN2 || '' // Backup HF token
    };

    // Debug environment variables
    // Debug logging removed for security

    // Validate API keys
    this.validateAPIKeys();
  }

  /**
   * Validate that required API keys are present
   */
  private validateAPIKeys(): void {
    const missingKeys: string[] = [];
    
    if (!this.apiKeys.GPTGOD_API) missingKeys.push('GPTGOD_API');
    if (!this.apiKeys.OPEN_ROUTER_API) missingKeys.push('OPEN_ROUTER_API');
    if (!this.apiKeys.HF_TOKEN) missingKeys.push('NEXT_PUBLIC_HF_TOKEN');

    if (missingKeys.length > 0) {
      console.warn(`Missing access tokens in .env file: ${missingKeys.join(', ')}`);
      console.warn('Please add these tokens to your .env file for the AI features to work properly.');
    }
  }

  /**
   * Get appropriate access token for model provider
   */
  private getAccessToken(provider: string, attempt: number = 0): string {
    console.log(`Getting access token for provider: ${provider}`); // Debug log
    switch (provider) {
      case 'GPTGOD0':
        // Use primary key first, then fallback to backup key on retry
        if (attempt > 0 && this.apiKeys.GPTGOD_API2) {
          console.log('🔄 Primary GPTGOD API failed, switching to backup key (GPTGOD_API2)');
          return this.apiKeys.GPTGOD_API2;
        } else {
          console.log('Using primary GPTGOD API key');
          return this.apiKeys.GPTGOD_API;
        }
      
      case 'Hugging Face':
        // Use primary HF token first, then fallback to backup token on retry
        if (attempt > 0 && this.apiKeys.HF_TOKEN2) {
          console.log('🔄 Primary HF Token failed, switching to backup key (HF_TOKEN2)');
          return this.apiKeys.HF_TOKEN2;
        } else {
          console.log('Using primary HF Token');
          return this.apiKeys.HF_TOKEN;
        }
      
      default:
        // Use primary OpenRouter key first, then fallback to backup key on retry
        if (attempt > 0 && this.apiKeys.OPEN_ROUTER_API2) {
          console.log('🔄 Primary OpenRouter API failed, switching to backup key (OPEN_ROUTER_API2)');
          return this.apiKeys.OPEN_ROUTER_API2;
        } else {
          console.log('Using primary OpenRouter API key');
          return this.apiKeys.OPEN_ROUTER_API;
        }
    }
  }

  /**
   * Get API endpoint for model provider
   */
  private getAPIEndpoint(provider: string, modelId?: string): string {
    switch (provider) {
      case 'GPTGOD0':
        return 'https://api.gptgod.online/v1/chat/completions';
      case 'Hugging Face':
        // جميع نماذج Hugging Face تستخدم inference endpoint
        if (modelId) {
          return `https://api-inference.huggingface.co/models/${modelId}`;
        }
        // fallback endpoint إذا لم يُحدد model ID
        throw new Error('Model ID is required for Hugging Face API');
      default:
        return 'https://openrouter.ai/api/v1/chat/completions';
    }
  }

  /**
   * Build headers for API requests
   */
  private buildHeaders(provider: string, accessToken: string): Record<string, string> {
    switch (provider) {
      case 'GPTGOD0':
        return {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        };
      
      case 'Hugging Face':
        return {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        };
      
      default:
        return {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        };
    }
  }

  /**
   * Build request payload
   */
  private buildPayload(
    messages: ChatMessage[],
    model: AIModel,
    options: {
      temperature?: number;
      max_tokens?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
      stream?: boolean;
      tools?: Record<string, unknown>[];
    } = {}
  ): Record<string, unknown> {
    const {
      temperature = 0.7,
      max_tokens = 2048,
      top_p = 1,
      frequency_penalty = 0,
      presence_penalty = 0,
      stream = false,
      tools
    } = options;

    // Hugging Face Inference API uses different format
    if (model.provider === 'Hugging Face') {
      // For chat models, use text generation format
      if (model.capabilities.includes('chat') || 
          model.capabilities.includes('conversation') ||
          model.capabilities.includes('instruction_following')) {
        
        // Convert messages to single input text
        const inputText = messages.map(msg => {
          if (msg.role === 'user') return `User: ${msg.content}`;
          if (msg.role === 'assistant') return `Assistant: ${msg.content}`;
          return `${msg.role}: ${msg.content}`;
        }).join('\n') + '\nAssistant:';

        return {
          inputs: inputText,
          parameters: {
            max_new_tokens: max_tokens,
            temperature: temperature,
            top_p: top_p,
            do_sample: temperature > 0,
            return_full_text: false
          }
        };
      } else {
        // For other HF models (image analysis, etc.)
        return {
          inputs: messages[messages.length - 1]?.content || '',
          parameters: {
            max_new_tokens: max_tokens,
            temperature: temperature
          }
        };
      }
    }

    // Standard payload for GPTGOD and OpenRouter
    const payload: Record<string, unknown> = {
      model: model.id,
      messages,
      temperature,
      max_tokens,
      top_p,
      frequency_penalty,
      presence_penalty,
      stream
    };

    // Add tools if provided and model supports them
    if (tools && tools.length > 0) {
      // Only add tools for models that support function calling
      if (model.capabilities.includes('function_calling') || 
          model.capabilities.includes('tool_use')) {
        
        // For Hugging Face, don't add tools for now due to API limitations
        if (model.provider !== 'Hugging Face') {
          payload.tools = tools;
          payload.tool_choice = "auto";
        }
        // HF models will work without tools, just won't have web search capability
      }
      // If model doesn't support tools, tools are silently ignored
    }

    return payload;
  }

  /**
   * Make API request with retry logic
   */
  private async makeRequest(
    endpoint: string,
    headers: Record<string, string>,
    payload: any,
    attempt: number = 0,
    isHuggingFace: boolean = false
  ): Promise<APIResponse> {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Handle rate limit errors specifically
        if (response.status === 429 || errorText.includes('rate limit') || errorText.includes('resource_exhausted')) {
          const rateLimitDelay = this.getRateLimitDelay(attempt);
          console.warn(`Rate limit reached, waiting ${rateLimitDelay}ms before retry...`);
          
          if (attempt < this.retryAttempts - 1) {
            await this.delay(rateLimitDelay);
            return this.makeRequest(endpoint, headers, payload, attempt + 1, isHuggingFace);
          } else {
            throw new Error('RATE_LIMIT_EXCEEDED');
          }
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      
      // Transform Hugging Face response format to standard format
      if (isHuggingFace) {
        return this.transformHuggingFaceResponse(responseData);
      }

      return responseData;
    } catch (error) {
      if (error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED') {
        throw error;
      }
      
      if (attempt < this.retryAttempts - 1) {
        console.warn(`Request failed (attempt ${attempt + 1}), retrying...`);
        await this.delay(this.retryDelay * Math.pow(2, attempt));
        return this.makeRequest(endpoint, headers, payload, attempt + 1, isHuggingFace);
      }
      throw error;
    }
  }

  /**
   * Transform Hugging Face response to standard format
   */
  private transformHuggingFaceResponse(hfResponse: any): APIResponse {
    // HF text generation returns array format
    if (Array.isArray(hfResponse) && hfResponse.length > 0) {
      const generatedText = hfResponse[0].generated_text || hfResponse[0].text || '';
      return {
        choices: [{
          message: {
            content: generatedText.trim(),
            role: 'assistant'
          },
          finish_reason: 'stop'
        }]
      };
    }
    
    // HF single object format
    if (hfResponse.generated_text || hfResponse.text) {
      const generatedText = hfResponse.generated_text || hfResponse.text;
      return {
        choices: [{
          message: {
            content: generatedText.trim(),
            role: 'assistant'
          },
          finish_reason: 'stop'
        }]
      };
    }
    
    // Fallback for unexpected format
    throw new Error('Unexpected Hugging Face response format');
  }

  /**
   * Get delay for rate limit retries
   */
  private getRateLimitDelay(attempt: number): number {
    // Exponential backoff starting from 5 seconds for rate limits
    return Math.min(5000 * Math.pow(2, attempt), 60000); // Max 60 seconds
  }

  /**
   * Make streaming API request
   */
  private async makeStreamRequest(
    endpoint: string,
    headers: Record<string, string>,
    payload: any,
    onChunk: (content: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...payload, stream: true })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body reader available');

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onComplete();
              return;
            }

            try {
              const parsed: StreamResponse = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming chunk:', parseError);
            }
          }
        }
      }

      onComplete();
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Send message to AI model with fallback support
   */
  async sendMessage(
    messages: ChatMessage[], 
    model: AIModel,
    options: {
      temperature?: number;
      max_tokens?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
      tools?: any[];
    } = {}
  ): Promise<string> {
    // Check if this is an image generation model
    if (model.capabilities.includes('text_to_image')) {
      throw new Error(`Model ${model.id} is for image generation, not chat. Use generateImageHF() instead.`);
    }

    // Try primary API first
    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        const accessToken = this.getAccessToken(model.provider, attempt);
        const endpoint = this.getAPIEndpoint(model.provider, model.id);
        const headers = this.buildHeaders(model.provider, accessToken);
        const payload = this.buildPayload(messages, model, options);

        const isHuggingFace = model.provider === 'Hugging Face';
        const response = await this.makeRequest(endpoint, headers, payload, attempt, isHuggingFace);
        
        return response.choices[0]?.message?.content || 'No response generated';
      } catch (error) {
        console.error(`Primary API attempt ${attempt + 1} failed:`, error);
        
        // Check for insufficient credits error (403 with specific message)
        if (error instanceof Error && 
            (error.message.includes('403') && 
             error.message.includes('insufficient credits'))) {
          console.log('Insufficient credits detected, trying fallback API...');
          break; // Exit primary API attempts and try fallback
        }
        
        if (attempt === this.retryAttempts - 1) {
          // If all primary attempts failed, try fallback
          break;
        }
        
        await this.delay(this.retryDelay * Math.pow(2, attempt));
      }
    }

    // Try fallback API if primary failed
    if (model.provider === 'GPTGOD0' && this.apiKeys.GPTGOD_API2) {
      console.log('Trying fallback GPTGOD API...');
      
      for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
        try {
          const fallbackKey = this.apiKeys.GPTGOD_API2;
          const endpoint = this.getAPIEndpoint(model.provider);
          const headers = this.buildHeaders(model.provider, fallbackKey);
          const payload = this.buildPayload(messages, model, options);

          const response = await this.makeRequest(endpoint, headers, payload, attempt);
          
          console.log('Fallback API successful!');
          return response.choices[0]?.message?.content || 'No response generated';
        } catch (error) {
          console.error(`Fallback API attempt ${attempt + 1} failed:`, error);
          
          if (attempt === this.retryAttempts - 1) {
            // If fallback also fails, provide helpful error message
            if (error instanceof Error) {
              if (error.message === 'RATE_LIMIT_EXCEEDED') {
                throw new Error(`API_RATE_LIMIT_EXCEEDED`);
              }
              if (error.message.includes('403')) {
                throw new Error(`Both primary and fallback APIs have insufficient credits. Please top up your account or try again later. Original error: ${error.message}`);
              }
            }
            throw new Error(`Both primary and fallback APIs failed after ${this.retryAttempts} attempts: ${error}`);
          }
          
          await this.delay(this.retryDelay * Math.pow(2, attempt));
        }
      }
    }

    // Final error if both primary and fallback failed
    throw new Error('All API attempts (primary and fallback) failed. Please check your API keys and credits.');
  }

  /**
   * Send streaming message to AI model
   */
  async sendStreamingMessage(
    messages: ChatMessage[], 
    model: AIModel,
    onChunk: (content: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void,
    options: {
      temperature?: number;
      max_tokens?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
    } = {}
  ): Promise<void> {
    const accessToken = this.getAccessToken(model.provider);
    const endpoint = this.getAPIEndpoint(model.provider, model.id);
    const headers = this.buildHeaders(model.provider, accessToken);
    const payload = this.buildPayload(messages, model, options);

    await this.makeStreamRequest(
      endpoint, 
      headers, 
      payload, 
      onChunk, 
      onComplete, 
      onError
    );
  }

  /**
   * Get model capabilities
   */
  getModelCapabilities(model: AIModel): string[] {
    return model.capabilities;
  }

  /**
   * Check if model supports capability
   */
  supportsCapability(model: AIModel, capability: string): boolean {
    return model.capabilities.includes(capability);
  }

  /**
   * Get optimal settings for model
   */
  getOptimalSettings(model: AIModel, taskType: 'creative' | 'analytical' | 'coding'): any {
    const baseSettings = {
      max_tokens: Math.min(2048, model.contextLength / 4),
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    };

    switch (taskType) {
      case 'creative':
        return {
          ...baseSettings,
          temperature: 0.8,
          top_p: 0.9
        };
      case 'analytical':
        return {
          ...baseSettings,
          temperature: 0.3,
          top_p: 0.95
        };
      case 'coding':
        return {
          ...baseSettings,
          temperature: 0.1,
          top_p: 0.95
        };
      default:
        return baseSettings;
    }
  }

  /**
   * Health check for API endpoints
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    // Test GPTGOD API
    try {
      if (this.apiKeys.GPTGOD_API) {
        const response = await fetch('https://api.gptgod.online/v1/models', {
          headers: {
            'Authorization': `Bearer ${this.apiKeys.GPTGOD_API}`
          }
        });
        results['GPTGOD'] = response.ok;
      } else {
        results['GPTGOD'] = false;
      }
    } catch {
      results['GPTGOD'] = false;
    }

    // Test OpenRouter API  
    try {
      if (this.apiKeys.OPEN_ROUTER_API) {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          headers: {
            'Authorization': `Bearer ${this.apiKeys.OPEN_ROUTER_API}`
          }
        });
        results['OpenRouter'] = response.ok;
      } else {
        results['OpenRouter'] = false;
      }
    } catch {
      results['OpenRouter'] = false;
    }

    return results;
  }

  /**
   * Generate image using Hugging Face models with fallback support
   */
  async generateImageHF(prompt: string, modelId: string): Promise<Blob> {
    const endpoint = `https://api-inference.huggingface.co/models/${modelId}`;
    const payload = {
      inputs: prompt
    };

    // Try both primary and backup tokens
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const accessToken = this.getAccessToken('Hugging Face', attempt);
        const headers = this.buildHeaders('Hugging Face', accessToken);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          if (response.status === 401 && attempt === 0) {
            console.log(`🔄 HF Token attempt ${attempt + 1} failed with 401, trying backup token...`);
            continue; // Try backup token
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.blob();
      } catch (error) {
        if (attempt === 0) {
          console.log(`🔄 HF Token attempt ${attempt + 1} failed, trying backup token...`);
          continue;
        }
        console.error('Error generating image:', error);
        throw error;
      }
    }
    
    throw new Error('All HF token attempts failed');
  }

  /**
   * Analyze image using Hugging Face models
   */
  async analyzeImageHF(imageFile: File | Blob, modelId: string, question?: string): Promise<any> {
    const accessToken = this.getAccessToken('Hugging Face');
    const endpoint = `https://api-inference.huggingface.co/models/${modelId}`;
    
    try {
      // Create FormData for binary upload (recommended for HF)
      const formData = new FormData();
      formData.append('file', imageFile);
      if (question) {
        formData.append('question', question);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
          // Don't set Content-Type - let browser set it for FormData
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Transform response based on model type
      if (Array.isArray(result)) {
        // Image captioning models return array with generated_text
        if (result[0]?.generated_text) {
          return result[0].generated_text;
        }
        // Classification models return array with labels and scores
        if (result[0]?.label) {
          return result.map(item => `${item.label}: ${(item.score * 100).toFixed(1)}%`).join(', ');
        }
        return result[0];
      }
      
      // Single object response
      if (result.generated_text) {
        return result.generated_text;
      }
      
      return result;
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  }

  /**
   * Generate text using Hugging Face models
   */
  async generateTextHF(prompt: string, modelId: string, options?: {
    max_length?: number;
    temperature?: number;
    top_p?: number;
  }): Promise<any> {
    const accessToken = this.getAccessToken('Hugging Face');
    const endpoint = `https://api-inference.huggingface.co/models/${modelId}`;
    const headers = this.buildHeaders('Hugging Face', accessToken);
    
    const payload = {
      inputs: prompt,
      parameters: {
        max_length: options?.max_length || 100,
        temperature: options?.temperature || 0.7,
        top_p: options?.top_p || 0.9
      }
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  }

  /**
   * Generate video using Hugging Face models
   */
  async generateVideoHF(prompt: string, modelId: string, options?: {
    num_frames?: number;
    height?: number;
    width?: number;
    num_inference_steps?: number;
    guidance_scale?: number;
  }): Promise<Blob> {
    const accessToken = this.getAccessToken('Hugging Face');
    const endpoint = `https://api-inference.huggingface.co/models/${modelId}`;
    const headers = this.buildHeaders('Hugging Face', accessToken);
    
    const payload = {
      inputs: prompt,
      parameters: {
        num_frames: options?.num_frames || 16,
        height: options?.height || 512,
        width: options?.width || 512,
        num_inference_steps: options?.num_inference_steps || 25,
        guidance_scale: options?.guidance_scale || 7.5
      }
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Video generation error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error generating video:', error);
      throw error;
    }
  }

  /**
   * Generate video from image using Hugging Face models
   */
  async generateVideoFromImageHF(imageData: string, modelId: string, options?: {
    num_frames?: number;
    motion_scale?: number;
    noise_aug_strength?: number;
  }): Promise<Blob> {
    const accessToken = this.getAccessToken('Hugging Face');
    const endpoint = `https://api-inference.huggingface.co/models/${modelId}`;
    const headers = this.buildHeaders('Hugging Face', accessToken);
    
    const payload = {
      inputs: {
        image: imageData
      },
      parameters: {
        num_frames: options?.num_frames || 25,
        motion_scale: options?.motion_scale || 1.0,
        noise_aug_strength: options?.noise_aug_strength || 0.02
      }
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Image-to-video generation error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error generating video from image:', error);
      throw error;
    }
  }

  /**
   * Check Hugging Face model status
   */
  async checkModelStatusHF(modelId: string): Promise<any> {
    const accessToken = this.getAccessToken('Hugging Face');
    const endpoint = `https://api-inference.huggingface.co/models/${modelId}`;
    const headers = this.buildHeaders('Hugging Face', accessToken);
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking model status:', error);
      throw error;
    }
  }
}

// Singleton instance
let aiGatewayInstance: AIAPIGateway | null = null;

/**
 * Get AI Gateway singleton instance
 */
export function getAIGateway(): AIAPIGateway {
  if (!aiGatewayInstance) {
    aiGatewayInstance = new AIAPIGateway();
  }
  return aiGatewayInstance;
}

// Export types
export type { APIKeys, ChatMessage, APIResponse, StreamResponse };