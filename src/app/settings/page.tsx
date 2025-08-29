'use client';

import React from 'react';
import Layout from '@/components/layout/Layout';
import { Settings, User, Bell, Shield, Globe, Palette, Database, Key } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';

const SettingsPage: React.FC = () => {
  const { user } = useUser();
  const { language, isRTL } = useLanguage();

  const settingsCategories = [
    {
      title: getTranslation('account', language),
      icon: <User className="w-5 h-5" />,
      items: [
        { 
          name: language === 'ar' ? 'معلومات الملف الشخصي' : 'Profile Information', 
          description: language === 'ar' ? 'تحديث اسمك وصورتك الشخصية' : 'Update your name and profile picture' 
        },
        { 
          name: language === 'ar' ? 'البريد الإلكتروني' : 'Email Address', 
          description: language === 'ar' ? 'إدارة عناوين بريدك الإلكتروني' : 'Manage your email addresses' 
        },
        { 
          name: language === 'ar' ? 'كلمة المرور' : 'Password', 
          description: language === 'ar' ? 'تغيير كلمة المرور الخاصة بك' : 'Change your password' 
        }
      ]
    },
    {
      title: getTranslation('notifications', language),
      icon: <Bell className="w-5 h-5" />,
      items: [
        { 
          name: language === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications', 
          description: language === 'ar' ? 'التحكم في الإشعارات المرسلة إليك' : 'Control email notifications sent to you' 
        },
        { 
          name: language === 'ar' ? 'إشعارات المتصفح' : 'Browser Notifications', 
          description: language === 'ar' ? 'السماح للإشعارات في المتصفح' : 'Allow browser notifications' 
        },
        { 
          name: language === 'ar' ? 'إشعارات الخدمات' : 'Service Notifications', 
          description: language === 'ar' ? 'تنبيهات حول حالة الخدمات' : 'Alerts about service status' 
        }
      ]
    },
    {
      title: getTranslation('security_privacy', language),
      icon: <Shield className="w-5 h-5" />,
      items: [
        { 
          name: language === 'ar' ? 'المصادقة الثنائية' : 'Two-Factor Authentication', 
          description: language === 'ar' ? 'حماية إضافية لحسابك' : 'Additional protection for your account' 
        },
        { 
          name: language === 'ar' ? 'الجلسات النشطة' : 'Active Sessions', 
          description: language === 'ar' ? 'إدارة الأجهزة المتصلة' : 'Manage connected devices' 
        },
        { 
          name: language === 'ar' ? 'سجل النشاط' : 'Activity Log', 
          description: language === 'ar' ? 'عرض تاريخ تسجيل الدخول' : 'View login history' 
        }
      ]
    },
    {
      title: getTranslation('preferences', language),
      icon: <Palette className="w-5 h-5" />,
      items: [
        { 
          name: language === 'ar' ? 'المظهر' : 'Appearance', 
          description: language === 'ar' ? 'المظهر الفاتح أو الداكن' : 'Light or dark theme' 
        },
        { 
          name: getTranslation('language', language), 
          description: language === 'ar' ? 'تغيير لغة الواجهة' : 'Change interface language' 
        },
        { 
          name: language === 'ar' ? 'المنطقة الزمنية' : 'Timezone', 
          description: language === 'ar' ? 'تعيين المنطقة الزمنية' : 'Set your timezone' 
        }
      ]
    },
    {
      title: getTranslation('api_developers', language),
      icon: <Key className="w-5 h-5" />,
      items: [
        { 
          name: language === 'ar' ? 'مفاتيح API' : 'API Keys', 
          description: language === 'ar' ? 'إدارة مفاتيح الوصول للـ API' : 'Manage API access keys' 
        },
        { 
          name: 'Webhooks', 
          description: language === 'ar' ? 'تكوين webhooks للتطبيقات' : 'Configure webhooks for applications' 
        },
        { 
          name: language === 'ar' ? 'الاستخدام' : 'Usage', 
          description: language === 'ar' ? 'عرض إحصائيات الاستخدام' : 'View usage statistics' 
        }
      ]
    }
  ];

  return (
    <Layout title="Collactions" showSearch={false}>
      <div className="min-h-screen bg-background text-foreground py-8">
        <div className="max-w-4xl mx-auto px-6">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">{getTranslation('settings', language)}</h1>
            <p className="text-muted">
              {getTranslation('settings_subtitle', language)}
            </p>
          </div>

          {/* User Info Card */}
          {user && (
            <div className="border rounded-lg p-6 mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {user.fullName || 'المستخدم'}
                  </h2>
                  <p className="text-muted">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                  <span className="inline-block mt-2 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                    {getTranslation('connected', language)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Settings Categories */}
          <div className="space-y-8">
            {settingsCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-primary">
                    {category.icon}
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {category.title}
                  </h2>
                </div>
                
                <div className="bg-bg-dark border rounded-lg divide-y">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="p-4 hover:bg-border transition-colors">
                      <button className="w-full text-left flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-foreground mb-1">
                            {item.name}
                          </h3>
                          <p className="text-sm text-muted">
                            {item.description}
                          </p>
                        </div>
                        <div className="text-muted">
                          →
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
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
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
    </Layout>
  );
};

export default SettingsPage;
