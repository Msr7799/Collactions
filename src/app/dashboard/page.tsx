'use client';

import React from 'react';
import Layout from '@/components/layout/Layout';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity, 
  Globe, 
  Zap, 
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';
// Temporarily disabled to fix Next.js 15 headers() error
// import { useUser } from '@clerk/nextjs';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation, formatTranslation } from '@/lib/translations';

const DashboardPage: React.FC = () => {
  // Temporarily disabled to fix Next.js 15 headers() error
  // const { user } = useUser();
  const user = null;
  const { language, isRTL } = useLanguage();

  const stats = [
    {
      title: getTranslation('total_requests', language),
      value: '12,847',
      change: '+12.5%',
      changeType: 'positive',
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      title: getTranslation('active_services', language),
      value: '8',
      change: '+2',
      changeType: 'positive', 
      icon: <Activity className="w-6 h-6" />
    },
    {
      title: getTranslation('success_rate', language),
      value: '98.7%',
      change: '+0.3%',
      changeType: 'positive',
      icon: <CheckCircle className="w-6 h-6" />
    },
    {
      title: getTranslation('response_time', language),
      value: '245ms',
      change: '-15ms',
      changeType: 'positive',
      icon: <Clock className="w-6 h-6" />
    }
  ];

  const recentServices = [
    { 
      name: 'Context7', 
      status: 'active', 
      calls: language === 'ar' ? '3.2أ طلب' : '3.2K calls', 
      success: language === 'ar' ? '99.1% معدل نجاح' : '99.1% success'
    },
    { 
      name: 'Eva Search', 
      status: 'active', 
      calls: language === 'ar' ? '2.8أ طلب' : '2.8K calls', 
      success: language === 'ar' ? '98.9% معدل نجاح' : '98.9% success'
    },
    { 
      name: 'Database MCP', 
      status: 'warning', 
      calls: language === 'ar' ? '1.5أ طلب' : '1.5K calls', 
      success: language === 'ar' ? '97.2% معدل نجاح' : '97.2% success'
    },
    { 
      name: 'Browser Tools', 
      status: 'active', 
      calls: language === 'ar' ? '985 طلب' : '985 calls', 
      success: language === 'ar' ? '99.5% معدل نجاح' : '99.5% success'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/20';
      case 'error': return 'text-red-400 bg-red-400/20';
      default: return 'text-muted bg-border';
    }
  };

  const getChangeColor = (changeType: string) => {
    return changeType === 'positive' ? 'text-green-400' : 'text-red-400';
  };

  return (
    <Layout title="Collactions" showSearch={true}>
      <div className="min-h-screen bg-background text-foreground py-8">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {getTranslation('dashboard', language)}
            </h1>
            <p className="text-muted">
              {getTranslation('dashboard_subtitle', language)}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-bg-dark border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-primary">
                    {stat.icon}
                  </div>
                  <span className={`text-sm font-medium ${getChangeColor(stat.changeType)}`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">
                  {stat.value}
                </h3>
                <p className="text-muted text-sm">
                  {stat.title}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="bg-bg-dark border rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">{getTranslation('recent_services', language)}</h2>
                  <button className="text-primary hover:text-primary/80 text-sm font-medium">
                    {getTranslation('view_all', language)}
                  </button>
                </div>
                
                <div className="space-y-4">
                  {recentServices.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                          <Globe className="w-5 h-5 text-black" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{service.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(service.status)}`}>
                              {service.status === 'active' ? getTranslation('active', language) : getTranslation('warning', language)}
                            </span>
                            <span className="text-sm text-muted">
                              {service.calls}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{service.success}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions & Alerts */}
            <div className="space-y-6">
              
              {/* Quick Actions */}
              <div className="bg-bg-dark border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">{getTranslation('quick_actions', language)}</h3>
                <div className="space-y-3">
                  <button className="w-full p-3 bg-primary hover:bg-primary/80 text-black rounded-lg font-medium transition-colors flex items-center justify-between">
                    <span>{getTranslation('add_new_service', language)}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <button className="w-full p-3 bg-background hover:bg-border text-primary rounded-lg font-medium transition-colors border">
                    {getTranslation('view_detailed_stats', language)}
                  </button>
                  <button className="w-full p-3 bg-background hover:bg-border text-primary rounded-lg font-medium transition-colors border">
                    {getTranslation('manage_api_keys', language)}
                  </button>
                </div>
              </div>

              {/* Alerts */}
              <div className="bg-bg-dark border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">{getTranslation('alerts', language)}</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-400">{getTranslation('high_usage', language)}</p>
                      <p className="text-xs text-muted mt-1">
                        {getTranslation('high_usage_warning', language)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-400">{getTranslation('update_available', language)}</p>
                      <p className="text-xs text-muted mt-1">
                        {getTranslation('update_available_msg', language)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Chart */}
              <div className="bg-bg-dark border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">{getTranslation('monthly_usage', language)}</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-foreground">{getTranslation('api_calls', language)}</span>
                      <span className="text-muted">8,240 / 10,000</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '82.4%' }}></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-xl font-bold text-primary">82%</p>
                      <p className="text-xs text-muted">{getTranslation('used', language)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-green-400">1,760</p>
                      <p className="text-xs text-muted">{getTranslation('remaining', language)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
