'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, Check, Clock, AlertCircle, CheckCircle, Calendar, Github } from 'lucide-react';
import { Service } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const { language, isRTL } = useLanguage();
  const {
    name,
    description,
    category,
    status,
    isVerified = false,
    monthlyToolCalls,
    successRate,
    published,
    sourceCode,
    icon
  } = service;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          text: getTranslation('active', language),
          icon: <Check className="w-3 h-3" />,
          className: 'bg-green-500/20 text-green-400 border-green-500/30'
        };
      case 'beta':
        return {
          text: 'Beta',
          icon: <Clock className="w-3 h-3" />,
          className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        };
      case 'coming_soon':
        return {
          text: language === 'ar' ? 'قريباً' : 'Coming Soon',
          icon: <AlertCircle className="w-3 h-3" />,
          className: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        };
      default:
        return {
          text: language === 'ar' ? 'غير معروف' : 'Unknown',
          icon: <AlertCircle className="w-3 h-3" />,
          className: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        };
    }
  };

  return (
    <div 
      className="group p-4 bg-background hover:bg-border border rounded-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="w-12 h-12 rounded-md flex items-center justify-center">
              <img src="/mcp_icon.svg" alt="Service icon" className="w-10 h-10" />
            </div>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {name}
              </h3>
              {isVerified && (
                <CheckCircle className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusConfig(status).className}`}>
                <div className="flex items-center space-x-1">
                  {getStatusConfig(status).icon}
                  <span>{getStatusConfig(status).text}</span>
                </div>
              </span>
              {monthlyToolCalls && (
                <span className="text-xs text-muted">
                  {monthlyToolCalls}
                </span>
              )}
            </div>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-muted group-hover:text-foreground opacity-0 group-hover:opacity-100 transition-all" />
      </div>

      {/* Description */}
      <p className="text-sm text-muted mb-4 line-clamp-2">
        {description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted">
        <div className="flex items-center space-x-4">
          {successRate && (
            <div className="flex items-center space-x-1">
              <span className="text-green-400">✓</span>
              <span>{successRate}</span>
            </div>
          )}
          {published && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{published}</span>
            </div>
          )}
        </div>
        
        {sourceCode && (
          <div className="flex items-center space-x-1">
            <Github className="w-3 h-3" />
            <span>{language === 'ar' ? 'مفتوح المصدر' : 'Open Source'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCard;
