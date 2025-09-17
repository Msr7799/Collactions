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
    id: 'arliai/qwq-32b-rpr-v1:free',
    name: 'QwQ 32B RpR v1',
    provider: 'OpenRouter',
    description: 'نموذج 32B محسن للكتابة الإبداعية ولعب الأدوار مع سياق طويل يصل إلى 128K رمز - مجاني',
    contextLength: 128000,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['creative_writing', 'roleplay', 'long_context', 'creative'],
    type: 'free'
  },
{
  id: 'agentica/deepcoder-14b-preview:free',
  name: 'Deepcoder 14B Preview',
  provider: 'OpenRouter',
  description: 'نموذج 14B محسن خصيصاً لتوليد الكود والبرمجة مع سياق 96K رمز - مجاني',
  contextLength: 96000,
  pricing: { input: 'Free', output: 'Free' },
  capabilities: ['coding', 'code_generation', 'programming', 'software_development'],
  type: 'free'
},
{
  id: 'moonshotai/kimi-vl-a3b-thinking:free',
  name: 'Kimi VL A3B Thinking',
  provider: 'OpenRouter',
  description: 'نموذج متعدد الوسائط 3B مع نمط التفكير المرئي ودعم الصور والنصوص - مجاني',
  contextLength: 128000,
  pricing: { input: 'Free', output: 'Free' },
  capabilities: ['vision', 'multimodal', 'thinking_mode', 'image_analysis', 'visual_reasoning'],
  type: 'free'
},
{
  id: 'meta-llama/llama-4-maverick:free',
  name: 'Llama 4 Maverick 17B Instruct',
  provider: 'OpenRouter',
  description: 'أحدث نموذج Llama 4 بـ 17B معامل مع قدرات متعددة الوسائط وسياق مليون رمز - مجاني',
  contextLength: 1000000,
  pricing: { input: 'Free', output: 'Free' },
  capabilities: ['multimodal', 'vision', 'large_context', 'advanced_reasoning', 'instruction_following'],
  type: 'free'
},
{
  id: 'meta-llama/llama-4-scout:free',
  name: 'Llama 4 Scout 17B Instruct',
  provider: 'OpenRouter',
  description: 'نسخة Scout من Llama 4 محسنة للكفاءة مع سياق متعدد المليون رمز - مجاني',
  contextLength: 2000000,
  pricing: { input: 'Free', output: 'Free' },
  capabilities: ['efficient', 'multimodal', 'vision', 'ultra_large_context', 'fast_inference'],
  type: 'free'
},
{
  id: 'qwen/qwen2.5-vl-32b-instruct:free',
  name: 'Qwen2.5 VL 32B Instruct',
  provider: 'OpenRouter',
  description: 'نموذج Qwen متعدد الوسائط 32B محسن للاستدلال المرئي والتحليل - مجاني',
  contextLength: 128000,
  pricing: { input: 'Free', output: 'Free' },
  capabilities: ['vision', 'multimodal', 'reasoning', 'image_analysis', 'visual_qa'],
  type: 'free'
},
{
  id: 'qwen/qwq-32b:free',
  name: 'QwQ 32B',
  provider: 'OpenRouter',
  description: 'نموذج Qwen 32B محسن للاستدلال والتفكير المنطقي - مجاني',
  contextLength: 128000,
  pricing: { input: 'Free', output: 'Free' },
  capabilities: ['reasoning', 'logic', 'problem_solving', 'advanced_reasoning'],
  type: 'free'
},
{
  id: 'deepseek/deepseek-v3-0324:free',
  name: 'DeepSeek V3 0324',
  provider: 'OpenRouter',
  description: 'النموذج الرائد من DeepSeek بعائلة 685B معامل مع سياق 164K للمحادثة والاستدلال - مجاني',
  contextLength: 164000,
  pricing: { input: 'Free', output: 'Free' },
  capabilities: ['advanced_reasoning', 'chat', 'problem_solving', 'large_scale'],
  type: 'free'
},
{
  id: 'mistralai/mistral-small-3.1-24b:free',
  name: 'Mistral Small 3.1 24B',
  provider: 'OpenRouter',
  description: 'نموذج Mistral الصغير 24B مع دعم متعدد الوسائط وكفاءة عالية - مجاني',
  contextLength: 128000,
  pricing: { input: 'Free', output: 'Free' },
  capabilities: ['multimodal', 'vision', 'efficient', 'instruction_following'],
  type: 'free'
},
{
  id: 'google/gemma-3-4b:free',
  name: 'Gemma 3 4B',
  provider: 'OpenRouter',
  description: 'نموذج Google Gemma 3 بـ 4B معامل مع دعم متعدد الوسائط والتعدد اللغوي - مجاني',
  contextLength: 128000,
  pricing: { input: 'Free', output: 'Free' },
  capabilities: ['multimodal', 'multilingual', 'vision', 'efficient'],
  type: 'free'
},
{
  id: 'google/gemma-3-12b:free',
  name: 'Gemma 3 12B',
  provider: 'OpenRouter',
  description: 'النسخة الأكبر من Gemma 3 بـ 12B معامل مع قدرات متقدمة - مجاني',
  contextLength: 128000,
  pricing: { input: 'Free', output: 'Free' },
  capabilities: ['multimodal', 'vision', 'advanced_reasoning', 'multilingual'],
  type: 'free'
},
{
  id: 'google/gemma-3-27b:free',
  name: 'Gemma 3 27B',
  provider: 'OpenRouter',
  description: 'أقوى نموذج في عائلة Gemma 3 بـ 27B معامل مفتوح المصدر - مجاني',
  contextLength: 128000,
  pricing: { input: 'Free', output: 'Free' },
  capabilities: ['multimodal', 'vision', 'high_performance', 'open_source'],
  type: 'free'
},
{
  id: 'reka/flash-3:free',
  name: 'Flash 3',
  provider: 'OpenRouter',
  description: 'نموذج Reka Flash 3 بـ 21B معامل مع ترخيص Apache-2.0 - مجاني',
  contextLength: 32000,
  pricing: { input: 'Free', output: 'Free' },
  capabilities: ['instruction_following', 'open_source', 'apache_license'],
  type: 'free'
},
{
  id: 'nous/deephermes-3-llama-3-8b-preview:free',
  name: 'DeepHermes 3 (Llama 3 8B Preview)',
  provider: 'OpenRouter',
  description: 'نموذج DeepHermes 3 مبني على Llama 3 مع أنماط الاستدلال الموحدة والبديهية - مجاني',
  contextLength: 131000,
  pricing: { input: 'Free', output: 'Free' },
  capabilities: ['reasoning', 'unified_modes', 'intuitive', 'chat'],
  type: 'free'
},
{
  id: 'dolphin/dolphin3.0-r1-mistral-24b:free',
  name: 'Dolphin 3.0 R1 Mistral 24B',
  provider: 'OpenRouter',
  description: 'نموذج Dolphin 3.0 للأغراض العامة بـ 24B معامل مع سياق يصل إلى 108K - مجاني',
  contextLength: 108000,
  pricing: { input: 'Free', output: 'Free' },
  capabilities: ['general_purpose', 'instruction_following', 'versatile'],
  type: 'free'
},
{
  id: 'dolphin/dolphin3.0-mistral-24b:free',
  name: 'Dolphin 3.0 Mistral 24B',
  provider: 'OpenRouter',
  description: 'النسخة المستقرة من Dolphin 3.0 بـ 24B معامل - مجاني',
  contextLength: 108000,
  pricing: { input: 'Free', output: 'Free' },
  capabilities: ['stable', 'general_purpose', 'instruction_following'],
  type: 'free'
},
{
  id: 'z-ai/glm-4.5-air:free',
  name: 'GLM 4.5 Air',
  provider: 'OpenRouter',
  description: 'نموذج GLM-4.5 Air خفيف الوزن بـ 21B معامل مع أنماط التفكير المختلفة - مجاني',
  contextLength: 131000,
  pricing: { input: 'Free', output: 'Free' },
  capabilities: ['lightweight', 'thinking_modes', 'efficient', 'MoE'],
  type: 'free'
},
{
  id: 'tngtech/deepseek-r1t-chimera:free',
  name: 'DeepSeek R1T Chimera',
  provider: 'OpenRouter',
  description: 'نسخة Chimera من عائلة DeepSeek R1T مع سياق كبير - مجاني',
  contextLength: 200000,
  pricing: { input: 'Free', output: 'Free' },
  capabilities: ['large_context', 'advanced_reasoning', 'chimera_variant'],
  type: 'free'
},
{
  id: 'qwen/qwen3-4b:free',
  name: 'Qwen3 4B',
  provider: 'OpenRouter',
  description: 'نموذج Qwen3 المبتدئ بـ 4B معامل مفتوح المصدر مع سياق 96K - مجاني',
  contextLength: 96000,
  pricing: { input: 'Free', output: 'Free' },
  capabilities: ['entry_level', 'open_source', 'efficient', 'general_purpose'],
  type: 'free'
}
];

export const gptGodModels: AIModel[] = [
  {
    id: 'o1-preview',
    name: 'GPT o1-Preview',
    provider: 'GPTGOD',
    description: 'نموذج التفكير المتقدم من OpenAI - يظهر خطوات التفكير بالتفصيل قبل الإجابة',
    contextLength: 128000,
    pricing: { input: 'Via GPTGOD', output: 'Via GPTGOD' },
    capabilities: ['reasoning_visible', 'step_by_step', 'advanced_reasoning', 'chain_of_thought'],
    type: 'free'
  },
{
  id: 'o1-mini',
  name: 'GPT o1-Mini',
  provider: 'GPTGOD',
  description: 'إصدار سريع من نموذج التفكير - يظهر عملية التفكير مع أداء أسرع',
  contextLength: 128000,
  pricing: { input: 'Via GPTGOD', output: 'Via GPTGOD' },
  capabilities: ['reasoning_visible', 'step_by_step', 'fast_reasoning', 'chain_of_thought'],
  type: 'free'
},
{
  id: 'gpt-4o',
  name: 'GPT-4o',
  provider: 'GPTGOD',
  description: 'أحدث نموذج من OpenAI مع قدرات متقدمة في النص والصور والصوت - يدعم تحليل الصور',
  contextLength: 128000,
  pricing: { input: 'Via GPTGOD', output: 'Via GPTGOD' },
  capabilities: ['multimodal', 'advanced_reasoning', 'coding', 'vision', 'audio', 'image_analysis'],
  type: 'free'
},
{
  id: 'gpt-3.5-turbo',
  name: 'GPT-3.5 Turbo',
  provider: 'GPTGOD',
  description: 'نموذج سريع وفعال للمحادثات العامة والمهام البسيطة',
  contextLength: 16385,
  pricing: { input: 'Via GPTGOD', output: 'Via GPTGOD' },
  capabilities: ['chat', 'general_purpose', 'fast_response'],
  type: 'free'
},
{
  id: 'gpt-4o-mini',
  name: 'GPT-4o Mini',
  provider: 'GPTGOD',
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
