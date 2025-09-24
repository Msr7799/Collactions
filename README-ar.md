# كولاكشنز — بوابة الذكاء الاصطناعي ومنصة الدردشة الذكية

  <p align="center">
  <img src="public/app-icon-red.svg" alt="App Icon" width="300" height="300">
</p>

[![Next.js Version](https://img.shields.io/badge/Next.js-14.0+-blue.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0+-blue.svg)](https://tailwindcss.com/)

[![Read in English](https://img.shields.io/badge/Read%20in%20English-%E2%9C%85-white?style=for-the-badge&logo=readme&logoColor=white)](README.md)

[![Releases](https://img.shields.io/badge/Releases-green?style=for-the-badge&logo=github)](https://github.com/your-repo/releases)

## نظرة عامة

كولاكشنز هو بوابة ذكاء اصطناعي متقدمة ومنصة دردشة ذكية مبنية بـ Next.js و TypeScript. يوفر وصولاً موحداً لعدة مقدمي خدمات الذكاء الاصطناعي (OpenRouter, GPTGOD, Hugging Face)، تكامل خوادم MCP، تحسين وترجمة النصوص بالذكاء الاصطناعي، كود بلوك متقدم مع تمييز الصيغة، إنتاج صور مجاني بالذكاء الاصطناعي، ومحاكي تيرمينال واقعي (nano + zsh) — كل ذلك داخل واجهة متجاوبة ومتحركة مع دعم العربية والإنجليزية.

<p align="center">
  <img src="public/collaction_gif.gif" alt="App Icon" width="800" height="400">
</p>

## ✨ المميزات الرئيسية

<p align="right">
  <img src="public/small_icon_lime.svg" alt="App Icon" width="150" height="150">
</p>

### 🤖 **بوابة الذكاء الاصطناعي متعددة المقدمين**
- **54+ نموذج مجاني**: وصول موحد لنماذج OpenRouter, GPTGOD, و Hugging Face
- **توجيه ذكي**: آلية تبديل تلقائية وحدود معدل الاستخدام
- **مراقبة الحالة**: مراقبة حالة النماذج في الوقت الفعلي
- **تكوين مخصص**: إعدادات النماذج حسب تفضيلات المستخدم

### 🔗 **تكامل خوادم MCP**
- **عمليات نظام الملفات**: إدارة الملفات وعمليات Git ونظم الذاكرة
- **بنية خوادم قابلة للتوسيع**: اكتشاف تلقائي وتكامل للأدوات
- **مراقبة الاتصال**: مراقبة حالة الخوادم وإدارة الاتصالات

### 💬 **واجهة دردشة ذكية**
- **تحسين النصوص**: تحسين تلقائي للنصوص والترجمة بين العربية والإنجليزية
- **حفظ الجلسات**: حفظ تلقائي وإدارة تاريخ المحادثات
- **عرض متقدم للرسائل**: رسوم متحركة للكتابة ودعم المحتوى الغني

### 🛠️ **أدوات المطورين**
- **كود بلوك متقدم**: تمييز الصيغة، اكتشاف اللغة، ووظائف النسخ/التحميل
- **محاكي تيرمينال**: محاكاة تيرمينال مع محرر nano وموجه zsh
- **تكامل Git**: عمليات Git وإدارة نظام الملفات عبر خوادم MCP

### 🎨 **إنتاج الصور**
- **إنتاج صور مجاني**: إنشاء صور بالذكاء الاصطناعي باستخدام نماذج Hugging Face
- **تحسين الوصف**: تحسين أوصاف الصور بـ GPT-4o لجودة أفضل
- **تكامل سلس**: إدراج الصور مباشرة في المحادثات

### 🎨 **واجهة مستخدم عصرية**
- **تصميم متجاوب**: تصميم Tailwind CSS مع رسوم متحركة Framer Motion
- **دعم الثيمات**: دعم الثيم المظلم/الفاتح مع انتقالات سلسة
- **واجهة ثنائية اللغة**: واجهة عربية/إنجليزية مع دعم RTL

### 🔒 **الأمان والأداء**
- **مصادقة آمنة**: مصادقة Clerk مع إدارة الجلسات الآمنة
- **حدود معدل API**: حدود تلقائية وآليات احتياطية
- **إدارة مفاتيح API**: تكوين آمن قائم على البيئة
- **أداء محسن**: تحسين React مع الاستيراد الديناميكي

## تشغيل سريع

### المتطلبات

- Node.js >= 20
- pnpm
- Git

### التشغيل محليًا

```bash
git clone https://github.com/Msr7799/collactions.git
cd collactions
pnpm install
cp .env.example .env.local
# عدّل .env.local لتضع مفاتيح Clerk و (اختياري) مفاتيح الذكاء الاصطناعي
pnpm dev

# افتح http://localhost:3000
```

ملاحظات:
- تكامل MCP موجود في `src/lib/mcp.ts` ونقاط نهاية MCP تحت `src/app/api/mcp`.
- البرنامج يدعم الآن 54+ نموذج مجاني من OpenRouter وHugging Face وGPTGOD.
- طبقة خدمات الذكاء الاصطناعي قابلة للتبديل ومُكوّنة عبر متغيرات البيئة.

## بنية المشروع (باختصار)

```
src/
├─ app/                # Next.js App Router (صفحات ونقاط API والتيرمينال)
├─ components/         # مكونات الواجهة (ai، layout، prompts، providers)
├─ contexts/           # سياقات React (LanguageContext، ThemeContext)
├─ lib/                # الأدوات والمساعدات (api، mcp، models، translations)
├─ config/             # تكوين MCP (`mcp-servers.json`)
└─ styles/             # CSS والخطوط
```

## ملفات مهمة

- `src/app/terminal/page.tsx` — محاكي التيرمينال وسلوك محرّر nano
- `src/app/prompts/CodeBlock.tsx` — واجهة الكود المتقدمة
- `src/app/api/mcp/templates/route.ts` — API قوالب MCP
- `src/lib/mcp.ts` — أدوات تكامل MCP

## متغيرات البيئة

ضع `.env.local` مع القيم التالية:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# مفاتيح خدمات الذكاء الاصطناعي (اختياري)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## التقنيات المستخدمة

- Next.js (App Router)
- React 19 + TypeScript
- Tailwind CSS
- Framer Motion (الأنيمشن)
- Clerk (المصادقة)
- Model Context Protocol (MCP) (`@modelcontextprotocol/sdk`)
- تكامل مع نماذج ذكاء اصطناعي مجانية (قابلة للتكوين)
- Zustand (إدارة الحالة)
- Lucide، MUI للرموز/المكونات

## ملاحظات تطويرية

- خزّن وحرّر قوالب MCP في `src/app/api/mcp/templates` وحدث `config/mcp-servers.json` عند الحاجة.
- نظام اللغة يستخدم ملف تعريف cookie و`middleware.ts` للعمل بشكل صحيح مع SSR.
- أضف باك إند AI جديد عبر `src/lib/api.ts` ونقاط النهاية الآمنة داخل `src/app/api`.

## المساهمة

المساهمات مرحب بها — قم بعمل fork ثم فتح طلب سحب. حافظ على دعم اللغات والاختبارات.

## الترخيص

MIT — راجع ملف [LICENSE](LICENSE)

---

إذا أردت، أستطيع إضافة قسم صغير يوضّح كيف تكتب اختبارات، أوأوامر lint/test، وكيف تضيف قوالب MCP برمجياً.
### الرسم بمساعدة الذكاء الاصطناعي
