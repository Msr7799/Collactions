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
  // النماذج المجانية من OpenRouter - 54 نموذج محدث
  {
    id: 'x-ai/grok-4-fast:free',
    name: 'xAI Grok 4 Fast',
    provider: 'OpenRouter',
    description: 'نموذج Grok 4 السريع من xAI مع سياق 2M رمز - مجاني',
    contextLength: 2000000,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['fast_inference', 'large_context', 'reasoning', 'chat'],
    type: 'free'
  },
{
    id: 'nvidia/nemotron-nano-9b-v2:free',
    name: 'NVIDIA Nemotron Nano 9B V2',
    provider: 'OpenRouter',
    description: 'نموذج NVIDIA المحسن 9B مع سياق 128K - مجاني',
    contextLength: 128000,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['chat', 'reasoning', 'efficient', 'nvidia_optimized'],
    type: 'free'
  },
  {
    id: 'deepseek/deepseek-chat-v3.1:free',
    name: 'DeepSeek V3.1',
    provider: 'OpenRouter',
    description: 'أحدث إصدار من DeepSeek مع سياق 163K - مجاني',
    contextLength: 163840,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['advanced_reasoning', 'chat', 'problem_solving', 'large_context'],
    type: 'free'
  },
  {
    id: 'openai/gpt-oss-20b:free',
    name: 'OpenAI GPT-OSS 20B',
    provider: 'OpenRouter',
    description: 'نموذج OpenAI مفتوح المصدر 20B - مجاني',
    contextLength: 131072,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['open_source', 'chat', 'reasoning', 'versatile'],
    type: 'free'
  },
// النماذج الـ 54 المجانية من OpenRouter - محدثة حسب القائمة الرسمية
  {
    id: 'z-ai/glm-4.5-air:free',
    name: 'Z.AI GLM 4.5 Air',
    provider: 'OpenRouter',
    description: 'نموذج GLM-4.5 Air خفيف الوزن مع سياق 131K - مجاني',
    contextLength: 131072,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['lightweight', 'thinking_modes', 'efficient', 'MoE'],
    type: 'free'
  },
  {
    id: 'qwen/qwen3-coder:free',
    name: 'Qwen3 Coder 480B A35B',
    provider: 'OpenRouter',
    description: 'نموذج Qwen3 المتخصص في البرمجة مع سياق 262K - مجاني',
    contextLength: 262144,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['coding', 'programming', 'large_context', 'software_development'],
    type: 'free'
  },
  {
    id: 'moonshotai/kimi-k2:free',
    name: 'MoonshotAI Kimi K2 0711',
    provider: 'OpenRouter',
    description: 'نموذج Kimi K2 من MoonshotAI - مجاني',
    contextLength: 32768,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['chat', 'reasoning', 'multilingual'],
    type: 'free'
  },
  {
    id: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
    name: 'Venice Uncensored',
    provider: 'OpenRouter',
    description: 'نموذج Dolphin Mistral غير المقيد من Venice - مجاني',
    contextLength: 32768,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['uncensored', 'creative_writing', 'versatile'],
    type: 'free'
  },
  {
    id: 'google/gemma-3n-e2b-it:free',
    name: 'Google Gemma 3n 2B',
    provider: 'OpenRouter',
    description: 'نموذج Google Gemma 3n الصغير 2B - مجاني',
    contextLength: 8192,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['lightweight', 'efficient', 'multilingual'],
    type: 'free'
  },
  {
    id: 'tencent/hunyuan-a13b-instruct:free',
    name: 'Tencent Hunyuan A13B Instruct',
    provider: 'OpenRouter',
    description: 'نموذج Hunyuan A13B من Tencent - مجاني',
    contextLength: 32768,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['chat', 'instruction_following', 'multilingual'],
    type: 'free'
  },
  {
    id: 'meta-llama/llama-3.3-8b-instruct:free',
    name: 'Meta Llama 3.3 8B Instruct',
    provider: 'OpenRouter',
    description: 'نموذج Llama 3.3 8B من Meta - مجاني',
    contextLength: 128000,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['chat', 'instruction_following', 'reasoning'],
    type: 'free'
  },
  {
    id: 'qwen/qwen3-4b:free',
    name: 'Qwen3 4B',
    provider: 'OpenRouter',
    description: 'نموذج Qwen3 الصغير 4B - مجاني',
    contextLength: 40960,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['lightweight', 'efficient', 'general_purpose'],
    type: 'free'
  },
  {
    id: 'qwen/qwq-32b:free',
    name: 'QwQ 32B',
    provider: 'OpenRouter',
    description: 'نموذج QwQ 32B للاستدلال المنطقي - مجاني',
    contextLength: 32768,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['reasoning', 'logic', 'problem_solving', 'advanced_reasoning'],
    type: 'free'
  },
  {
    id: 'arliai/qwq-32b-arliai-rpr-v1:free',
    name: 'ArliAI QwQ 32B RpR v1',
    provider: 'OpenRouter',
    description: 'نموذج QwQ 32B RpR من ArliAI - مجاني (تم تصحيح الـ ID)',
    contextLength: 32768,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['reasoning', 'roleplay', 'creative_writing'],
    type: 'free'
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1',
    provider: 'OpenRouter',
    description: 'نموذج DeepSeek R1 للاستدلال المتقدم - مجاني',
    contextLength: 163840,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['advanced_reasoning', 'problem_solving', 'large_context'],
    type: 'free'
  },
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Google Gemini 2.0 Flash Experimental',
    provider: 'OpenRouter',
    description: 'نموذج Gemini 2.0 التجريبي مع سياق 1M - مجاني',
    contextLength: 1048576,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['experimental', 'large_context', 'multimodal', 'vision'],
    type: 'free'
  },
  {
    id: 'tngtech/deepseek-r1t2-chimera:free',
    name: 'TNG DeepSeek R1T2 Chimera',
    provider: 'OpenRouter',
    description: 'نموذج DeepSeek R1T2 Chimera من TNG - مجاني',
    contextLength: 163840,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['advanced_reasoning', 'large_context', 'chimera_variant'],
    type: 'free'
  },
  {
    id: 'mistralai/mistral-small-3.2-24b-instruct:free',
    name: 'Mistral Small 3.2 24B',
    provider: 'OpenRouter',
    description: 'نموذج Mistral Small 3.2 24B - مجاني',
    contextLength: 131072,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['chat', 'reasoning', 'instruction_following'],
    type: 'free'
  },
  {
    id: 'moonshotai/kimi-dev-72b:free',
    name: 'MoonshotAI Kimi Dev 72B',
    provider: 'OpenRouter',
    description: 'نموذج Kimi Dev 72B للمطورين - مجاني',
    contextLength: 131072,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['coding', 'development', 'large_scale', 'reasoning'],
    type: 'free'
  },
  {
    id: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
    name: 'DeepSeek R1 0528 Qwen3 8B',
    provider: 'OpenRouter',
    description: 'نموذج DeepSeek R1 مبني على Qwen3 8B - مجاني',
    contextLength: 131072,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['reasoning', 'chat', 'advanced_thinking'],
    type: 'free'
  },
  {
    id: 'deepseek/deepseek-r1-0528:free',
    name: 'DeepSeek R1 0528',
    provider: 'OpenRouter',
    description: 'نموذج DeepSeek R1 للاستدلال المتقدم - مجاني',
    contextLength: 163840,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['advanced_reasoning', 'problem_solving', 'large_context'],
    type: 'free'
  },
  {
    id: 'mistralai/devstral-small-2505:free',
    name: 'Mistral Devstral Small 2505',
    provider: 'OpenRouter',
    description: 'نموذج Mistral المتخصص للمطورين - مجاني',
    contextLength: 32768,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['coding', 'development', 'instruction_following'],
    type: 'free'
  },
  {
    id: 'google/gemma-3n-e4b-it:free',
    name: 'Google Gemma 3n 4B',
    provider: 'OpenRouter',
    description: 'نموذج Google Gemma 3n 4B - مجاني',
    contextLength: 8192,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['efficient', 'multilingual', 'lightweight'],
    type: 'free'
  },
  {
    id: 'qwen/qwen3-30b-a3b:free',
    name: 'Qwen3 30B A3B',
    provider: 'OpenRouter',
    description: 'نموذج Qwen3 30B A3B - مجاني',
    contextLength: 40960,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['large_scale', 'reasoning', 'chat'],
    type: 'free'
  },
  {
    id: 'qwen/qwen3-8b:free',
    name: 'Qwen3 8B',
    provider: 'OpenRouter',
    description: 'نموذج Qwen3 8B - مجاني',
    contextLength: 40960,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['chat', 'reasoning', 'general_purpose'],
    type: 'free'
  },
  {
    id: 'qwen/qwen3-14b:free',
    name: 'Qwen3 14B',
    provider: 'OpenRouter',
    description: 'نموذج Qwen3 14B - مجاني',
    contextLength: 40960,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['chat', 'reasoning', 'advanced_tasks'],
    type: 'free'
  },
  {
    id: 'qwen/qwen3-235b-a22b:free',
    name: 'Qwen3 235B A22B',
    provider: 'OpenRouter',
    description: 'نموذج Qwen3 235B الضخم - مجاني',
    contextLength: 131072,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['large_scale', 'advanced_reasoning', 'complex_tasks'],
    type: 'free'
  },
  {
    id: 'microsoft/mai-ds-r1:free',
    name: 'Microsoft MAI DS R1',
    provider: 'OpenRouter',
    description: 'نموذج Microsoft MAI DS R1 - مجاني',
    contextLength: 163840,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['reasoning', 'microsoft_optimized', 'enterprise'],
    type: 'free'
  },
  {
    id: 'shisa-ai/shisa-v2-llama3.3-70b:free',
    name: 'Shisa AI Shisa V2 Llama 3.3 70B',
    provider: 'OpenRouter',
    description: 'نموذج Shisa V2 مبني على Llama 3.3 70B - مجاني',
    contextLength: 32768,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['large_scale', 'multilingual', 'advanced_reasoning'],
    type: 'free'
  },
  {
    id: 'agentica-org/deepcoder-14b-preview:free',
    name: 'Agentica Deepcoder 14B Preview',
    provider: 'OpenRouter',
    description: 'نموذج Deepcoder 14B للبرمجة من Agentica - مجاني',
    contextLength: 96000,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['coding', 'programming', 'preview', 'agentic'],
    type: 'free'
  },
  {
    id: 'moonshotai/kimi-vl-a3b-thinking:free',
    name: 'MoonshotAI Kimi VL A3B Thinking',
    provider: 'OpenRouter',
    description: 'نموذج Kimi متعدد الوسائط مع التفكير - مجاني',
    contextLength: 131072,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['vision', 'multimodal', 'thinking', 'visual_reasoning'],
    type: 'free'
  },
  {
    id: 'meta-llama/llama-4-maverick:free',
    name: 'Meta Llama 4 Maverick',
    provider: 'OpenRouter',
    description: 'نموذج Llama 4 Maverick من Meta - مجاني',
    contextLength: 128000,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['advanced_reasoning', 'large_context', 'next_generation'],
    type: 'free'
  },
  {
    id: 'meta-llama/llama-4-scout:free',
    name: 'Meta Llama 4 Scout',
    provider: 'OpenRouter',
    description: 'نموذج Llama 4 Scout من Meta - مجاني',
    contextLength: 128000,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['efficient', 'fast_inference', 'optimized'],
    type: 'free'
  },
  {
    id: 'qwen/qwen2.5-vl-32b-instruct:free',
    name: 'Qwen2.5 VL 32B Instruct',
    provider: 'OpenRouter',
    description: 'نموذج Qwen2.5 متعدد الوسائط 32B - مجاني',
    contextLength: 8192,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['vision', 'multimodal', 'image_analysis', 'visual_qa'],
    type: 'free'
  },
  {
    id: 'deepseek/deepseek-chat-v3-0324:free',
    name: 'DeepSeek V3 0324',
    provider: 'OpenRouter',
    description: 'نموذج DeepSeek V3 0324 - مجاني',
    contextLength: 163840,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['advanced_reasoning', 'chat', 'problem_solving'],
    type: 'free'
  },
  {
    id: 'mistralai/mistral-small-3.1-24b-instruct:free',
    name: 'Mistral Small 3.1 24B',
    provider: 'OpenRouter',
    description: 'نموذج Mistral Small 3.1 24B - مجاني',
    contextLength: 128000,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['chat', 'reasoning', 'instruction_following'],
    type: 'free'
  },
  {
    id: 'google/gemma-3-4b-it:free',
    name: 'Google Gemma 3 4B',
    provider: 'OpenRouter',
    description: 'نموذج Google Gemma 3 4B - مجاني',
    contextLength: 32768,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['efficient', 'multilingual', 'chat'],
    type: 'free'
  },
  {
    id: 'google/gemma-3-12b-it:free',
    name: 'Google Gemma 3 12B',
    provider: 'OpenRouter',
    description: 'نموذج Google Gemma 3 12B - مجاني',
    contextLength: 32768,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['advanced_reasoning', 'multilingual', 'chat'],
    type: 'free'
  },
  {
    id: 'google/gemma-3-27b-it:free',
    name: 'Google Gemma 3 27B',
    provider: 'OpenRouter',
    description: 'نموذج Google Gemma 3 27B الأقوى - مجاني',
    contextLength: 96000,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['high_performance', 'advanced_reasoning', 'large_context'],
    type: 'free'
  },
  {
    id: 'nousresearch/deephermes-3-llama-3-8b-preview:free',
    name: 'Nous DeepHermes 3 Llama 3 8B Preview',
    provider: 'OpenRouter',
    description: 'نموذج DeepHermes 3 مبني على Llama 3 - مجاني',
    contextLength: 131072,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['reasoning', 'chat', 'unified_modes'],
    type: 'free'
  },
  {
    id: 'cognitivecomputations/dolphin3.0-r1-mistral-24b:free',
    name: 'Dolphin 3.0 R1 Mistral 24B',
    provider: 'OpenRouter',
    description: 'نموذج Dolphin 3.0 R1 Mistral 24B - مجاني',
    contextLength: 32768,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['versatile', 'general_purpose', 'uncensored'],
    type: 'free'
  },
  {
    id: 'cognitivecomputations/dolphin3.0-mistral-24b:free',
    name: 'Dolphin 3.0 Mistral 24B',
    provider: 'OpenRouter',
    description: 'نموذج Dolphin 3.0 Mistral 24B - مجاني',
    contextLength: 32768,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['stable', 'general_purpose', 'instruction_following'],
    type: 'free'
  },
  {
    id: 'qwen/qwen2.5-vl-72b-instruct:free',
    name: 'Qwen2.5 VL 72B Instruct',
    provider: 'OpenRouter',
    description: 'نموذج Qwen2.5 VL 72B متعدد الوسائط - مجاني',
    contextLength: 32768,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['vision', 'multimodal', 'large_scale', 'visual_qa'],
    type: 'free'
  },
  {
    id: 'mistralai/mistral-small-24b-instruct-2501:free',
    name: 'Mistral Small 3',
    provider: 'OpenRouter',
    description: 'نموذج Mistral Small 3 الجديد - مجاني',
    contextLength: 32768,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['chat', 'reasoning', 'latest_version'],
    type: 'free'
  },
  {
    id: 'deepseek/deepseek-r1-distill-llama-70b:free',
    name: 'DeepSeek R1 Distill Llama 70B',
    provider: 'OpenRouter',
    description: 'نموذج DeepSeek R1 مقطر على Llama 70B - مجاني',
    contextLength: 8192,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['distilled', 'efficient', 'reasoning'],
    type: 'free'
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Meta Llama 3.3 70B Instruct',
    provider: 'OpenRouter',
    description: 'نموذج Llama 3.3 70B الكبير - مجاني',
    contextLength: 65536,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['large_scale', 'advanced_reasoning', 'instruction_following'],
    type: 'free'
  },
  {
    id: 'qwen/qwen-2.5-coder-32b-instruct:free',
    name: 'Qwen2.5 Coder 32B Instruct',
    provider: 'OpenRouter',
    description: 'نموذج Qwen2.5 Coder 32B للبرمجة - مجاني',
    contextLength: 32768,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['coding', 'programming', 'software_development'],
    type: 'free'
  },
  {
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    name: 'Meta Llama 3.2 3B Instruct',
    provider: 'OpenRouter',
    description: 'نموذج Llama 3.2 3B صغير وسريع - مجاني',
    contextLength: 131072,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['lightweight', 'efficient', 'fast_inference'],
    type: 'free'
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct:free',
    name: 'Qwen2.5 72B Instruct',
    provider: 'OpenRouter',
    description: 'نموذج Qwen2.5 72B الكبير - مجاني',
    contextLength: 32768,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['large_scale', 'advanced_reasoning', 'high_performance'],
    type: 'free'
  },
  {
    id: 'meta-llama/llama-3.1-405b-instruct:free',
    name: 'Meta Llama 3.1 405B Instruct',
    provider: 'OpenRouter',
    description: 'نموذج Llama 3.1 405B الضخم - مجاني',
    contextLength: 65536,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['massive_scale', 'state_of_art', 'complex_reasoning'],
    type: 'free'
  },
  {
    id: 'mistralai/mistral-nemo:free',
    name: 'Mistral Nemo',
    provider: 'OpenRouter',
    description: 'نموذج Mistral Nemo - مجاني',
    contextLength: 131072,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['efficient', 'balanced', 'large_context'],
    type: 'free'
  },
  {
    id: 'google/gemma-2-9b-it:free',
    name: 'Google Gemma 2 9B',
    provider: 'OpenRouter',
    description: 'نموذج Google Gemma 2 9B - مجاني',
    contextLength: 8192,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['efficient', 'instruction_following', 'open_source'],
    type: 'free'
  },
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'Mistral 7B Instruct',
    provider: 'OpenRouter',
    description: 'نموذج Mistral 7B الكلاسيكي - مجاني',
    contextLength: 32768,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['classical', 'reliable', 'instruction_following'],
    type: 'free'
  },
  {
    id: 'tngtech/deepseek-r1t-chimera:free',
    name: 'TNG DeepSeek R1T Chimera',
    provider: 'OpenRouter',
    description: 'نموذج DeepSeek R1T Chimera من TNG - مجاني',
    contextLength: 163840,
    pricing: { input: 'Free', output: 'Free' },
    capabilities: ['advanced_reasoning', 'large_context', 'chimera_variant'],
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

// Set default to Google Gemini 2.0 Flash (supports vision, large context, and is completely free)
export const defaultModel = openRouterModels.find(m => m.id === 'google/gemini-2.0-flash-exp:free') || openRouterModels[0];

export const getModelsByProvider = (provider: string): AIModel[] => {
  return allModels.filter(model => model.provider === provider);
};

export const getModelById = (id: string): AIModel | undefined => {
  return allModels.find(model => model.id === id);
};

export const getFreeModels = (): AIModel[] => {
  return allModels.filter(model => model.type === 'free');
};
