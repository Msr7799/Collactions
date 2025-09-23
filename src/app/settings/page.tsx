'use client';

import React from 'react';
import TransparentLayout from '@/components/layout/TransparentLayout';
import { StarsLayout } from '@/components/layout/StarsLayout';
import { Settings, User, Bell, Shield, Globe, Palette, Database, Key, ChevronRight, ExternalLink } from 'lucide-react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { useRouter } from 'next/navigation';

const SettingsPage: React.FC = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { openUserProfile } = useClerk();
  const { language, isRTL } = useLanguage();
  const router = useRouter();

  // كشف متصفح Brave
  const isBrave = () => {
    return (navigator as any)?.brave && (navigator as any)?.brave?.isBrave;
  };

  // Show loading while auth is loading
  if (!isLoaded) {
    return (
      <StarsLayout>
        <TransparentLayout title="Collactions" showSearch={false}>
          <div className="min-h-screen text-foreground py-8">
            <div className="max-w-4xl mx-auto px-6">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted">{getTranslation('loading', language)}</p>
                </div>
              </div>
            </div>
          </div>
        </TransparentLayout>
      </StarsLayout>
    );
  }

  // Show sign-in prompt if not signed in
  if (!isSignedIn) {
    return (
      <StarsLayout>
        <TransparentLayout title="Collactions" showSearch={false}>
          <div className="min-h-screen text-foreground py-8">
            <div className="max-w-4xl mx-auto px-6">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <Settings className="w-16 h-16 text-muted mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">{getTranslation('sign_in_required', language)}</h2>
                  <p className="text-muted">{getTranslation('please_sign_in_to_access_settings' as any, language)}</p>
                </div>
              </div>
            </div>
          </div>
        </TransparentLayout>
      </StarsLayout>
    );
  }

  // Handler for clicking settings items
  const handleSettingsClick = (action: string) => {
    switch (action) {
      case 'profile':
        router.push('/profile');
        break;
      case 'manage-account':
        // استخدم نفس الطريقة المستخدمة في صفحة Profile
        window.open('https://accounts.clerk.dev', '_blank');
        break;
      default:
        // For other items, do nothing (coming soon)
        break;
    }
  };

  const settingsCategories = [
    {
      title: getTranslation('account', language),
      icon: <User className="w-5 h-5" />,
      items: [
        { 
          name: language === 'ar' ? 'معلومات الملف الشخصي' : 'Profile Information', 
          description: language === 'ar' ? 'تحديث اسمك وصورتك الشخصية' : 'Update your name and profile picture',
          action: 'profile',
          available: true
        },
        { 
          name: language === 'ar' ? 'إدارة الحساب' : 'Manage Account', 
          description: language === 'ar' ? 'إدارة عناوين بريدك الإلكتروني وكلمة المرور' : 'Manage your email addresses and password',
          action: 'manage-account',
          available: true
        }
      ]
    },
    {
      title: getTranslation('notifications', language),
      icon: <Bell className="w-5 h-5" />,
      items: [
        { 
          name: language === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications', 
          description: language === 'ar' ? 'التحكم في الإشعارات المرسلة إليك' : 'Control email notifications sent to you',
          available: false
        },
        { 
          name: language === 'ar' ? 'إشعارات المتصفح' : 'Browser Notifications', 
          description: language === 'ar' ? 'السماح للإشعارات في المتصفح' : 'Allow browser notifications',
          available: false
        },
        { 
          name: language === 'ar' ? 'إشعارات الخدمات' : 'Service Notifications', 
          description: language === 'ar' ? 'تنبيهات حول حالة الخدمات' : 'Alerts about service status',
          available: false
        }
      ]
    },
    {
      title: getTranslation('security_privacy', language),
      icon: <Shield className="w-5 h-5" />,
      items: [
        { 
          name: language === 'ar' ? 'المصادقة الثنائية' : 'Two-Factor Authentication', 
          description: language === 'ar' ? 'حماية إضافية لحسابك' : 'Additional protection for your account',
          available: false
        },
        { 
          name: language === 'ar' ? 'الجلسات النشطة' : 'Active Sessions', 
          description: language === 'ar' ? 'إدارة الأجهزة المتصلة' : 'Manage connected devices',
          available: false
        },
        { 
          name: language === 'ar' ? 'سجل النشاط' : 'Activity Log', 
          description: language === 'ar' ? 'عرض تاريخ تسجيل الدخول' : 'View login history',
          available: false
        }
      ]
    },
    {
      title: getTranslation('preferences', language),
      icon: <Palette className="w-5 h-5" />,
      items: [
        { 
          name: language === 'ar' ? 'المظهر' : 'Appearance', 
          description: language === 'ar' ? 'المظهر الفاتح أو الداكن' : 'Light or dark theme',
          available: false
        },
        { 
          name: getTranslation('language', language), 
          description: language === 'ar' ? 'تغيير لغة الواجهة' : 'Change interface language',
          available: false
        },
        { 
          name: language === 'ar' ? 'المنطقة الزمنية' : 'Timezone', 
          description: language === 'ar' ? 'تعيين المنطقة الزمنية' : 'Set your timezone',
          available: false
        }
      ]
    },
    {
      title: getTranslation('api_developers', language),
      icon: <Key className="w-5 h-5" />,
      items: [
        { 
          name: language === 'ar' ? 'مفاتيح API' : 'API Keys', 
          description: language === 'ar' ? 'إدارة مفاتيح الوصول للـ API' : 'Manage API access keys',
          available: false
        },
        { 
          name: 'Webhooks', 
          description: language === 'ar' ? 'تكوين webhooks للتطبيقات' : 'Configure webhooks for applications',
          available: false
        },
        { 
          name: language === 'ar' ? 'الاستخدام' : 'Usage', 
          description: language === 'ar' ? 'عرض إحصائيات الاستخدام' : 'View usage statistics',
          available: false
        }
      ]
    }
  ];

  return (
    <StarsLayout>
      <TransparentLayout title="Collactions" showSearch={false}>
        <div className="min-h-screen text-foreground py-8">

          <div className="max-w-4xl mx-auto px-6">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold z-10 text-foreground mb-2">{getTranslation('settings', language)}</h1>
            <p className="text-muted">
              {getTranslation('settings_subtitle', language)}
            </p>
            
            {/* تنبيه متصفح Brave */}
            {typeof window !== 'undefined' && isBrave() && (
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <div className="text-yellow-400 mt-0.5">⚠️</div>
                  <div>
                    <p className="text-sm font-medium text-yellow-400">
                      {language === 'ar' ? 'ملاحظة لمستخدمي Brave' : 'Note for Brave Users'}
                    </p>
                    <p className="text-xs text-muted mt-1">
                      {language === 'ar' 
                        ? 'قد لا تظهر نوافذ إدارة الحساب بسبب إعدادات الحماية. ستفتح الروابط في نافذة جديدة.'
                        : 'Account management modals may not appear due to privacy settings. Links will open in new tabs.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Info Card */}
          {user && (
            <div className="border-3 !border-[var(--user-border)] bg-user-bg/60 rounded-lg p-6 mb-8">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                {user?.imageUrl ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-3 !border-[var(--muted)]/90">
                    <img 
                      src={user.imageUrl} 
                      alt={user.fullName || user.firstName || 'User'} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-primary rounded-full border-3 !border-[var(--muted)]/90 flex items-center justify-center">
                    <span className="text-2xl font-bold text-black">
                      {(user?.firstName?.[0] || user?.fullName?.[0] || 'U').toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {user.fullName || user.firstName || getTranslation('user', language)}
                  </h2>
                  <p className="text-muted">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse mt-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      user?.primaryEmailAddress?.verification?.status === 'verified' 
                        ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
                        : 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400'
                    }`}>
                      {user?.primaryEmailAddress?.verification?.status === 'verified' 
                        ? getTranslation('connected', language)
                        : getTranslation('pending_verification' as any, language)
                      }
                    </span>
                    {user?.createdAt && (
                      <span className="text-xs text-muted">
                        {getTranslation('joined' as any, language)} {new Date(user.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                          year: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Categories */}
          <div className="space-y-8">
            {settingsCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-4">
                <div className="flex items-center  space-x-3 mb-4">
                  <div className="text-primary">
                    {category.icon}
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {category.title}
                  </h2>
                </div>

                <div className="bg-user-bg/60 border-4 rounded-lg divide-y">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className={`p-4 border-2 transition-colors ${
                      item.available !== false ? 'hover:bg-muted/40 cursor-pointer' : 'cursor-not-allowed opacity-75'
                    }`}>
                      <button 
                        className="w-full text-left flex items-center justify-between"
                        onClick={() => item.action && handleSettingsClick(item.action)}
                        disabled={item.available === false}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                            <h3 className="font-medium text-foreground">
                              {item.name}
                            </h3>
                            {item.available === false && (
                              <span className="text-xs px-2 py-1 bg-muted/30 text-muted rounded">
                                {getTranslation('coming_soon' as any, language)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted">
                            {item.description}
                          </p>
                        </div>
                        <div className="text-muted ml-4 rtl:ml-0 rtl:mr-4">
                          {item.available !== false ? (
                            <ChevronRight className="w-4 h-4" />
                          ) : (
                            <div className="w-4 h-4"></div>
                          )}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Danger Zone */}
          <div className="mt-12 pt-8 border-t">
            <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>{getTranslation('danger_zone', language)}</span>
            </h2>
            <div className="bg-red-500/10 border !border-red-500/50 rounded-lg p-4">
              <h3 className="font-medium text-red-400 mb-2">{getTranslation('delete_account', language)}</h3>
              <p className="text-sm text-muted mb-4">
                {getTranslation('delete_account_description', language)}
              </p>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors">
                {getTranslation('delete_account', language)}
              </button>
            </div>
          </div>
        </div>
        </div>
      </TransparentLayout>
    </StarsLayout>
  );
};

export default SettingsPage;
