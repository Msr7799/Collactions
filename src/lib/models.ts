export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  contextLength: number;
  pricing: {
    input: string;
    output: string;
  };
  capabilities: string[];
  type: 'free' | 'paid';
}

export const openRouterModels: AIModel[] = [
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT-OSS 20B',
    provider: 'OpenAI',
    description: 'نموذج مفتوح المصدر 21B معامل مع معمارية MoE - مؤكد ومتاح مجاناً عبر OpenRouter',
    contextLength: 131072,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['function_calling', 'tool_use', 'structured_output', 'reasoning'],
    type: 'free'
  },
  {
    id: 'meta-llama/llama-3.2-11b-vision-instruct',
    name: 'Llama 3.2 11B Vision Instruct',
    provider: 'Meta',
    description: 'نموذج متعدد الوسائط بـ 11B معامل مصمم للمهام البصرية والنصية - ممتاز لتحليل الصور وVQA - مجاني 100%',
    contextLength: 131072,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['vision', 'image_analysis', 'visual_qa', 'multimodal', 'image_captioning'],
    type: 'free'
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct',
    name: 'Qwen2.5 72B Instruct',
    provider: 'Qwen',
    description: 'أحدث نموذج من سلسلة Qwen بـ 72B معامل، محسن للبرمجة والرياضيات وفهم البيانات المنظمة - مجاني',
    contextLength: 131072,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['coding', 'mathematics', 'structured_data', 'long_context', 'multilingual'],
    type: 'free'
  },
  {
    id: 'meta-llama/llama-3.1-405b-instruct',
    name: 'Llama 3.1 405B Instruct',
    provider: 'Meta',
    description: 'النموذج الضخم بـ 405B معامل من Meta، يضاهي GPT-4o وClaude 3.5 في الأداء - مجاني ومتقدم جداً',
    contextLength: 66000,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['advanced_reasoning', 'complex_tasks', 'high_quality_dialogue', 'instruction_following'],
    type: 'free'
  },
  {
    id: 'mistralai/mistral-nemo',
    name: 'Mistral Nemo',
    provider: 'Mistral',
    description: 'نموذج 12B معامل مطور بالتعاون مع NVIDIA، متعدد اللغات ويدعم استخدام الأدوات - مجاني',
    contextLength: 131072,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['multilingual', 'function_calling', 'tool_use', 'fast_inference'],
    type: 'free'
  },
  {
    id: 'google/gemma-2-9b',
    name: 'Gemma 2 9B',
    provider: 'Google',
    description: 'نموذج متقدم مفتوح المصدر من Google بـ 9B معامل، فعال وعالي الأداء - مجاني',
    contextLength: 8192,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['efficient', 'general_purpose', 'fast_response', 'cost_effective'],
    type: 'free'
  },
  {
    id: 'mistralai/mistral-7b-instruct',
    name: 'Mistral 7B Instruct',
    provider: 'Mistral',
    description: 'نموذج عالي الأداء بـ 7.3B معامل، محسن للسرعة والاستجابة السريعة - مجاني',
    contextLength: 33000,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['fast_inference', 'instruction_following', 'efficient', 'reliable'],
    type: 'free'
  },
  {
    id: 'mistral/mistral-small-3.2-24b',
    name: 'Mistral Small 3.2 24B',
    provider: 'Mistral',
    description: 'نموذج محدث 24B محسن لاتباع التعليمات واستخدام الأدوات والمخرجات المنظمة',
    contextLength: 131072,
    pricing: { input: '$0.2/1M', output: '$0.6/1M' },
    capabilities: ['function_calling', 'structured_output', 'coding', 'vision', 'tool_use'],
    type: 'paid'
  }
];

export const gptGodModels: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'GPTGOD0',
    description: 'أحدث نموذج من OpenAI مع قدرات متقدمة في النص والصور والصوت - يدعم تحليل الصور',
    contextLength: 128000,
    pricing: { input: 'Via GPTGOD', output: 'Via GPTGOD' },
    capabilities: ['multimodal', 'advanced_reasoning', 'coding', 'vision', 'audio', 'image_analysis'],
    type: 'free'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'GPTGOD0',
    description: 'نموذج سريع وفعال للمحادثات العامة والمهام البسيطة',
    contextLength: 16385,
    pricing: { input: 'Via GPTGOD', output: 'Via GPTGOD' },
    capabilities: ['chat', 'general_purpose', 'fast_response'],
    type: 'free'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'GPTGOD0',
    description: 'إصدار مضغوط من GPT-4o، أسرع وأكثر كفاءة للمهام البسيطة',
    contextLength: 128000,
    pricing: { input: 'Via GPTGOD', output: 'Via GPTGOD' },
    capabilities: ['fast', 'efficient', 'general_purpose', 'cost_effective'],
    type: 'free'
  }
];

export const huggingFaceModels: AIModel[] = [
  // نماذج المحادثة - مدعومة رسمياً من HF Router API
  {
    id: 'google/gemma-2-2b-it',
    name: 'Gemma 2 2B Instruct',
    provider: 'Hugging Face',
    description: 'نموذج محادثة من Google، سريع وفعال للمهام اليومية',
    contextLength: 8192,
    pricing: { input: 'Via HF_TOKEN', output: 'Via HF_TOKEN' },
    capabilities: ['chat', 'conversation', 'instruction_following', 'fast_inference'],
    type: 'free'
  },
  {
    id: 'microsoft/phi-4',
    name: 'Phi-4',
    provider: 'Hugging Face',
    description: 'أحدث نموذج من Microsoft، قوي ومحسن للبرمجة والمحادثة',
    contextLength: 16384,
    pricing: { input: 'Via HF_TOKEN', output: 'Via HF_TOKEN' },
    capabilities: ['chat', 'coding', 'reasoning', 'instruction_following', 'function_calling'],
    type: 'free'
  },
  {
    id: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B',
    name: 'DeepSeek R1 Distill',
    provider: 'Hugging Face',
    description: 'نموذج صغير وقوي من DeepSeek، ممتاز للمنطق والتفكير',
    contextLength: 32768,
    pricing: { input: 'Via HF_TOKEN', output: 'Via HF_TOKEN' },
    capabilities: ['chat', 'reasoning', 'instruction_following', 'logic'],
    type: 'free'
  },
  {
    id: 'Qwen/Qwen2.5-7B-Instruct-1M',
    name: 'Qwen 2.5 7B Instruct',
    provider: 'Hugging Face',
    description: 'نموذج قوي من Alibaba مع دعم النصوص الطويلة جداً',
    contextLength: 1048576,
    pricing: { input: 'Via HF_TOKEN', output: 'Via HF_TOKEN' },
    capabilities: ['chat', 'long_context', 'instruction_following', 'reasoning', 'function_calling'],
    type: 'free'
  },
  {
    id: 'Qwen/Qwen2.5-Coder-32B-Instruct',
    name: 'Qwen 2.5 Coder',
    provider: 'Hugging Face',
    description: 'نموذج متخصص في البرمجة وكتابة الكود، ممتاز للمطورين',
    contextLength: 131072,
    pricing: { input: 'Via HF_TOKEN', output: 'Via HF_TOKEN' },
    capabilities: ['chat', 'coding', 'programming', 'instruction_following', 'function_calling'],
    type: 'free'
  },

  // نماذج توليد الصور - تعمل مع inference endpoint
  {
    id: 'black-forest-labs/FLUX.1-dev',
    name: 'FLUX.1-dev',
    provider: 'Hugging Face',
    description: 'نموذج متطور لتوليد الصور عالية الجودة من النص باستخدام تقنيات الذكاء الاصطناعي المتقدمة - مجاني',
    contextLength: 0,
    pricing: { input: 'Via HF_TOKEN', output: 'Via HF_TOKEN' },
    capabilities: ['text_to_image', 'high_quality', 'creative', 'artistic'],
    type: 'free'
  },
  {
    id: 'stabilityai/stable-diffusion-xl-base-1.0',
    name: 'Stable Diffusion XL (Limited)',
    provider: 'Hugging Face',
    description: '⚠️ نموذج قوي لكنه محدود/مدفوع في Hugging Face Inference API - استخدم FLUX.1-dev كبديل مجاني',
    contextLength: 0,
    pricing: { input: 'Limited/Paid', output: 'Limited/Paid' },
    capabilities: ['text_to_image', 'high_resolution', 'detailed', 'artistic'],
    type: 'paid'
  },
  {
    id: 'runwayml/stable-diffusion-v1-5',
    name: 'Stable Diffusion v1.5',
    provider: 'Hugging Face',
    description: 'النموذج الكلاسيكي لتوليد الصور، سريع وموثوق',
    contextLength: 0,
    pricing: { input: 'Via HF_TOKEN', output: 'Via HF_TOKEN' },
    capabilities: ['text_to_image', 'fast', 'reliable', 'creative'],
    type: 'free'
  },
  {
    id: 'stabilityai/stable-diffusion-2-1',
    name: 'Stable Diffusion 2.1',
    provider: 'Hugging Face',
    description: 'إصدار محسن من Stable Diffusion مع جودة أفضل',
    contextLength: 0,
    pricing: { input: 'Via HF_TOKEN', output: 'Via HF_TOKEN' },
    capabilities: ['text_to_image', 'improved_quality', 'creative', 'versatile'],
    type: 'free'
  },

  // نماذج تحليل الصور - تعمل مع inference endpoint
  {
    id: 'Salesforce/blip-image-captioning-base',
    name: 'BLIP Image Captioning Base',
    provider: 'Hugging Face',
    description: 'نموذج موثوق من Salesforce لوصف الصور - يعمل بشكل مستقر',
    contextLength: 512,
    pricing: { input: 'Via HF_TOKEN', output: 'Via HF_TOKEN' },
    capabilities: ['image_to_text', 'image_analysis', 'captioning', 'vision'],
    type: 'free'
  },
  {
    id: 'dandelin/vilt-b32-finetuned-vqa',
    name: 'ViLT VQA',
    provider: 'Hugging Face',
    description: 'نموذج للإجابة على الأسئلة البصرية - موثوق ويعمل بشكل جيد',
    contextLength: 1024,
    pricing: { input: 'Via HF_TOKEN', output: 'Via HF_TOKEN' },
    capabilities: ['visual_qa', 'image_analysis', 'question_answering'],
    type: 'free'
  },
  {
    id: 'nlpconnect/vit-gpt2-image-captioning',
    name: 'ViT-GPT2 Image Captioning',
    provider: 'Hugging Face', 
    description: 'نموذج بديل لوصف الصور - تم استبداله بنماذج أكثر موثوقية',
    contextLength: 1024,
    pricing: { input: 'Via HF_TOKEN', output: 'Via HF_TOKEN' },
    capabilities: ['image_to_text', 'image_analysis', 'backup_model'],
    type: 'free'
  },
  {
    id: 'microsoft/git-base',
    name: 'Microsoft GIT Base',
    provider: 'Hugging Face',
    description: 'نموذج متطور من Microsoft لتحليل الصور وتوليد الوصف الطبيعي - يعمل بشكل موثوق',
    contextLength: 1024,
    pricing: { input: 'Via HF_TOKEN', output: 'Via HF_TOKEN' },
    capabilities: ['image_to_text', 'image_analysis', 'detailed_description', 'vision'],
    type: 'free'
  },

];

// احتفظ بـ imageModels للتوافق مع النسخة السابقة
export const imageModels: AIModel[] = huggingFaceModels.filter(model => 
  model.capabilities.includes('text_to_image')
);


export const allModels: AIModel[] = [...openRouterModels, ...gptGodModels, ...huggingFaceModels];

// Set default to Llama 3.2 11B Vision (supports vision and is completely free)
export const defaultModel = openRouterModels.find(m => m.id === 'meta-llama/llama-3.2-11b-vision-instruct') || gptGodModels[0];

export const getModelsByProvider = (provider: string): AIModel[] => {
  return allModels.filter(model => model.provider === provider);
};

export const getModelById = (id: string): AIModel | undefined => {
  return allModels.find(model => model.id === id);
};

export const getFreeModels = (): AIModel[] => {
  return allModels.filter(model => model.type === 'free');
};
