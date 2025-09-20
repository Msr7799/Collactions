'use client';

import React from 'react';
import TransparentLayout from '@/components/layout/TransparentLayout';
import { StarsLayout } from '@/components/layout/StarsLayout';
import { User, Mail, Calendar, Globe, Shield, Activity, Edit } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';

const ProfilePage: React.FC = () => {
  const { language, isRTL } = useLanguage();
  const { isSignedIn, user, isLoaded } = useUser();
  
  // Show loading while auth is loading
  if (!isLoaded) {
    return (
      <StarsLayout>
        <TransparentLayout title="Collactions" showSearch={false}>
          <div className="min-h-screen text-foreground py-8">
            <div className="max-w-6xl mx-auto px-6">
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
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <User className="w-16 h-16 text-muted mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">{getTranslation('sign_in_required', language)}</h2>
                  <p className="text-muted">{getTranslation('please_sign_in_to_view_profile', language)}</p>
                </div>
              </div>
            </div>
          </div>
        </TransparentLayout>
      </StarsLayout>
    );
  }

  // Calculate days since joining
  const daysSinceJoining = user?.createdAt ? 
    Math.floor((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const stats = [
    { 
      label: getTranslation('services_used', language), 
      value: '12', 
      icon: <Activity className="w-5 h-5" /> 
    },
    { 
      label: getTranslation('api_calls', language), 
      value: '2.3K', 
      icon: <Globe className="w-5 h-5" /> 
    },
    { 
      label: getTranslation('active_projects', language), 
      value: '5', 
      icon: <Shield className="w-5 h-5" /> 
    },
    { 
      label: getTranslation('active_days', language), 
      value: daysSinceJoining.toString(), 
      icon: <Calendar className="w-5 h-5" /> 
    }
  ];

  // Generate recent activity based on user data
  const recentActivity = [
    { 
      action: getTranslation('used_context7_service', language), 
      time: getTranslation('minutes_ago', language), 
      status: 'success' 
    },
    { 
      action: getTranslation('created_new_project', language), 
      time: getTranslation('hour_ago', language), 
      status: 'info' 
    },
    ...(user?.lastSignInAt ? [{
      action: getTranslation('new_login', language),
      time: new Date(user.lastSignInAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: 'success' as const
    }] : []),
    { 
      action: getTranslation('account_created' as any, language), 
      time: user?.createdAt ? new Date(user.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
        month: 'short',
        day: 'numeric'
      }) : getTranslation('unknown' as any, language), 
      status: 'info' 
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400 bg-green-400/20';
      case 'info': return 'text-blue-400 bg-blue-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/20';
      default: return 'text-muted bg-border';
    }
  };

  return (
    <StarsLayout>
      <TransparentLayout title="Collactions" showSearch={false}>
        <div className="min-h-screen text-foreground py-8">
          <div className="max-w-6xl mx-auto px-6">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">{getTranslation('profile', language)}</h1>
            <p className="text-muted">
              {getTranslation('profile_subtitle', language)}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Profile Info */}
            <div className="lg:col-span-1 bg-user-bg/50 space-y-6">
              
              {/* User Card */}
              <div className=" border rounded-lg p-6">
                <div className="text-center">
                  {user?.imageUrl ? (
                    <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-primary/20">
                      <img 
                        src={user.imageUrl} 
                        alt={user.fullName || user.firstName || 'User'} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-black">
                        {(user?.firstName?.[0] || user?.fullName?.[0] || 'U').toUpperCase()}
                      </span>
                    </div>
                  )}
                  <h2 className="text-xl font-semibold text-foreground mb-1">
                    {user?.fullName || user?.firstName || getTranslation('user', language)}
                  </h2>
                  <p className="text-muted mb-4">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                  <button 
                    onClick={() => window.open('https://accounts.clerk.dev', '_blank')}
                    className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-black rounded-md font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{getTranslation('edit_profile', language)}</span>
                  </button>
                </div>
              </div>

              {/* Account Details */}
              <div className=" border  rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">{getTranslation('account_details', language)}</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted">{getTranslation('email', language)}</p>
                      <p className="text-foreground">{user?.primaryEmailAddress?.emailAddress || getTranslation('not_specified', language)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted">{getTranslation('join_date', language)}</p>
                      <p className="text-foreground">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : getTranslation('not_specified', language)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted">{getTranslation('account_status', language)}</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        user?.primaryEmailAddress?.verification?.status === 'verified' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {user?.primaryEmailAddress?.verification?.status === 'verified' 
                          ? getTranslation('active_verified', language)
                          : getTranslation('pending_verification' as any, language)
                        }
                      </span>
                    </div>
                  </div>
                  
                  {/* Last Sign In */}
                  {user?.lastSignInAt && (
                    <div className="flex items-center space-x-3">
                      <Activity className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted">{getTranslation('last_sign_in' as any, language)}</p>
                        <p className="text-foreground">
                          {new Date(user.lastSignInAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* User ID */}
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted">{getTranslation('user_id' as any, language)}</p>
                      <p className="text-foreground font-mono text-xs break-all">
                        {user?.id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 bg-user-bg/60 space-y-6">
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className=" border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="text-primary">
                        {stat.icon}
                      </div>
                      <p className="text-sm text-muted">{stat.label}</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className=" border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">{getTranslation('recent_activity', language)}</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(activity.status).split(' ')[1]}`}></div>
                        <div>
                          <p className="text-foreground font-medium">{activity.action}</p>
                          <p className="text-sm text-muted">{activity.time}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(activity.status)}`}>
                        {activity.status === 'success' ? getTranslation('success', language) :
                         activity.status === 'info' ? getTranslation('info', language) :
                         activity.status === 'warning' ? getTranslation('warning', language) :
                         activity.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* API Usage */}
              <div className=" border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">{getTranslation('api_usage', language)}</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-foreground">{getTranslation('monthly_usage_label', language)}</span>
                      <span className="text-muted">2,340 / 10,000</span>
                    </div>
                    <div className="w-full bg-[--background] rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '23.4%' }}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">23%</p>
                      <p className="text-sm text-muted">{getTranslation('of_limit', language)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">7,660</p>
                      <p className="text-sm text-muted">{getTranslation('requests_remaining', language)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </TransparentLayout>
    </StarsLayout>
  );
};export default ProfilePage;
