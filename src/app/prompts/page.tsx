'use client';

import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';
import { Loader2, MessageSquare, Maximize2, Minimize2, RefreshCw, ExternalLink } from 'lucide-react';

export default function PromptsPage() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // تحديد URL الصحيح بناءً على البيئة
  const chatUIUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5173'
    : process.env.NEXT_PUBLIC_CHATUI_URL || 'https://collactions-chat.vercel.app';

  useEffect(() => {
    // إخفاء loading بعد تحميل iframe
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = iframeRef.current.src;
      setTimeout(() => setIsLoading(false), 1500);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const openInNewTab = () => {
    window.open(chatUIUrl, '_blank');
  };

  return (
    <Layout>
      <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : 'h-[calc(100vh-80px)]'} flex flex-col`}>
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6" />
            <div>
              <h1 className="text-lg font-bold">
                {isArabic ? 'واجهة الدردشة المتقدمة' : 'Advanced Chat Interface'}
              </h1>
              <p className="text-xs opacity-90">
                {isArabic ? 'واجهة متقدمة توفر العديد من النماذج ومختلف الشركات الموفرة للنماذج الحديثة' : 'Advanced interface with multiple models from various providers'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title={isArabic ? 'تحديث' : 'Refresh'}
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            {/* Open in New Tab */}
            <button
              onClick={openInNewTab}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title={isArabic ? 'فتح في تبويب جديد' : 'Open in New Tab'}
            >
              <ExternalLink className="w-5 h-5" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title={isArabic ? (isFullscreen ? 'خروج من ملء الشاشة' : 'ملء الشاشة') : (isFullscreen ? 'Exit Fullscreen' : 'Fullscreen')}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-red-500 to-orange-500 rounded-full p-6">
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {isArabic ? 'جارٍ التحميل...' : 'Loading...'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {isArabic ? 'تحضير واجهة الدردشة المتقدمة' : 'Preparing advanced chat interface'}
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-10">
            <div className="text-center p-8 max-w-md">
              <div className="bg-red-100 dark:bg-red-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {isArabic ? 'خطأ في التحميل' : 'Loading Error'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-shadow"
              >
                {isArabic ? 'إعادة المحاولة' : 'Try Again'}
              </button>
            </div>
          </div>
        )}

        {/* Chat-UI iframe */}
        <div className="flex-1 relative overflow-hidden">
          <iframe
            ref={iframeRef}
            src={chatUIUrl}
            className="w-full h-full border-0"
            title="Chat UI"
            allow="clipboard-write; microphone; camera"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError(isArabic 
                ? 'فشل تحميل واجهة الدردشة. تأكد من تشغيل Chat-UI على المنفذ 5173'
                : 'Failed to load chat interface. Make sure Chat-UI is running on port 5173'
              );
            }}
          />
        </div>
      </div>
    </Layout>
  );
}
