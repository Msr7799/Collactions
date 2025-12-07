'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';
import { Loader2, MessageSquare, Maximize2, Minimize2, RefreshCw, ExternalLink, LogIn, X } from 'lucide-react';

export default function PromptsPage() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginPopup, setLoginPopup] = useState<Window | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // تحديد URL الصحيح بناءً على البيئة
  const chatUIUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5173'
    : process.env.NEXT_PUBLIC_CHATUI_URL || 'https://chat-ui-nine-sooty.vercel.app';

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

  // فتح popup للـ login
  const openLoginPopup = useCallback(() => {
    const width = 500;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      chatUIUrl,
      'ChatUI_Login',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    
    setLoginPopup(popup);

    // مراقبة إغلاق النافذة
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        setLoginPopup(null);
        setIsLoggedIn(true);
        // تحديث الـ iframe
        if (iframeRef.current) {
          iframeRef.current.src = iframeRef.current.src;
        }
      }
    }, 500);
  }, [chatUIUrl]);

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
            {/* Login Button */}
            {!isLoggedIn && (
              <button
                onClick={openLoginPopup}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                title={isArabic ? 'تسجيل الدخول' : 'Login'}
              >
                <LogIn className="w-4 h-4" />
                {isArabic ? 'تسجيل الدخول' : 'Login'}
              </button>
            )}

            {/* Logged In Indicator */}
            {isLoggedIn && (
              <div className="flex items-center gap-1.5 bg-green-500/30 px-3 py-1.5 rounded-lg text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                {isArabic ? 'متصل' : 'Connected'}
              </div>
            )}

            {/* Divider */}
            <div className="w-px h-6 bg-white/30"></div>

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

        {/* Login Popup Overlay */}
        {loginPopup && !loginPopup.closed && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800 px-4 py-2 flex items-center justify-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-sm text-blue-800 dark:text-blue-200">
              {isArabic 
                ? 'جارٍ تسجيل الدخول... أكمل في النافذة المنبثقة ثم أغلقها' 
                : 'Logging in... Complete in popup window then close it'}
            </span>
          </div>
        )}

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
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-top-navigation allow-top-navigation-by-user-activation"
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
