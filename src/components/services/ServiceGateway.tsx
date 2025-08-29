'use client';

import React, { useState } from 'react';
import { Search, Filter, ExternalLink, Zap, Globe, Shield, Database, MessageSquare, Bot, Code, Workflow, BarChart, Settings, FileText, Brain, Activity, Github } from 'lucide-react';
import ServiceCard from './ServiceCard';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import AnimatedDotsBackground from '../ui/AnimatedDotsBackground';

interface ServiceType {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'beta' | 'coming_soon';
  isVerified?: boolean;
  monthlyToolCalls?: string;
  successRate?: string;
  published?: string;
  sourceCode?: string;
  icon?: React.ReactNode;
}

interface ServiceCategoryType {
  id: string;
  name: string;
  description: string;
  services: ServiceType[];
}

const ServiceGateway: React.FC = () => {
  const { language, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');

  const categories: ServiceCategoryType[] = [
    {
      id: 'reference_servers',
      name: 'Reference Servers',
      description: 'Official MCP servers demonstrating core features',
      services: [
        {
          id: 'fetch',
          name: 'Fetch',
          description: 'Web content fetching and conversion for efficient LLM usage.',
          category: 'web',
          status: 'active',
          isVerified: true,
          monthlyToolCalls: 'Official',
          successRate: 'Stable',
          published: '2024',
          sourceCode: 'https://github.com/modelcontextprotocol/servers/tree/main/src/fetch',
          icon: <Globe className="w-5 h-5 text-black" />
        },
        {
          id: 'filesystem',
          name: 'Filesystem',
          description: 'Secure file operations with configurable access controls.',
          category: 'files',
          status: 'active',
          isVerified: true,
          monthlyToolCalls: 'Official',
          successRate: 'Stable',
          published: '2024',
          sourceCode: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
          icon: <FileText className="w-5 h-5 text-black" />
        },
        {
          id: 'memory',
          name: 'Memory',
          description: 'Knowledge graph-based persistent memory system.',
          category: 'memory',
          status: 'active',
          isVerified: true,
          monthlyToolCalls: 'Official',
          successRate: 'Stable',
          published: '2024',
          sourceCode: 'https://github.com/modelcontextprotocol/servers/tree/main/src/memory',
          icon: <Brain className="w-5 h-5 text-black" />
        },
        {
          id: 'git',
          name: 'Git',
          description: 'Tools to read, search, and manipulate Git repositories.',
          category: 'development',
          status: 'active',
          isVerified: true,
          monthlyToolCalls: 'Official',
          successRate: 'Stable',
          published: '2024',
          sourceCode: 'https://github.com/modelcontextprotocol/servers/tree/main/src/git',
          icon: <Code className="w-5 h-5 text-black" />
        }
      ]
    },
    {
      id: 'development_tools',
      name: 'Development Tools',
      description: 'Code and development focused MCP servers',
      services: [
        {
          id: 'sequential_thinking',
          name: 'Sequential Thinking',
          description: 'Dynamic and reflective problem-solving through thought sequences.',
          category: 'ai',
          status: 'active',
          isVerified: true,
          monthlyToolCalls: 'Official',
          successRate: 'Stable',
          published: '2024',
          sourceCode: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking',
          icon: <Brain className="w-5 h-5 text-black" />
        },
        {
          id: 'time',
          name: 'Time',
          description: 'Time and timezone conversion capabilities.',
          category: 'utility',
          status: 'active',
          isVerified: true,
          monthlyToolCalls: 'Official',
          successRate: 'Stable',
          published: '2024',
          sourceCode: 'https://github.com/modelcontextprotocol/servers/tree/main/src/time',
          icon: <Activity className="w-5 h-5 text-black" />
        },
        {
          id: 'everything',
          name: 'Everything',
          description: 'Reference / test server with prompts, resources, and tools.',
          category: 'reference',
          status: 'active',
          isVerified: true,
          monthlyToolCalls: 'Official',
          successRate: 'Stable',
          published: '2024',
          sourceCode: 'https://github.com/modelcontextprotocol/servers/tree/main/src/everything',
          icon: <Settings className="w-5 h-5 text-black" />
        }
      ]
    },
    {
      id: 'community_servers',
      name: 'Community Servers',
      description: 'Community-developed MCP servers',
      services: [
        {
          id: 'airtable',
          name: 'Airtable',
          description: 'Read and write access to Airtable databases, with schema inspection.',
          category: 'database',
          status: 'active',
          monthlyToolCalls: 'Community',
          successRate: 'Varies',
          published: '2024',
          sourceCode: 'https://github.com/felores/airtable-mcp',
          icon: <Database className="w-5 h-5 text-black" />
        },
        {
          id: 'anki',
          name: 'Anki',
          description: 'An MCP server for interacting with your Anki decks and cards.',
          category: 'learning',
          status: 'active',
          monthlyToolCalls: 'Community',
          successRate: 'Varies',
          published: '2024',
          sourceCode: 'https://github.com/nietus/anki-mcp',
          icon: <Brain className="w-5 h-5 text-black" />
        },
        {
          id: 'ableton_live',
          name: 'Ableton Live',
          description: 'an MCP server to control Ableton Live.',
          category: 'music',
          status: 'beta',
          monthlyToolCalls: 'Community',
          successRate: 'Varies',
          published: '2024',
          sourceCode: 'https://github.com/Simon-Kansara/ableton-live-mcp-server',
          icon: <Activity className="w-5 h-5 text-black" />
        },
        {
          id: 'algorand',
          name: 'Algorand',
          description: 'A comprehensive MCP server for tooling interactions and resource accessibility for the Algorand blockchain.',
          category: 'blockchain',
          status: 'active',
          monthlyToolCalls: 'Community',
          successRate: 'Varies',
          published: '2024',
          sourceCode: 'https://github.com/GoPlausible/algorand-mcp',
          icon: <Shield className="w-5 h-5 text-black" />
        }
      ]
    },
  ];

  const filteredCategories = categories.map(category => ({
    ...category,
    services: category.services.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.services.length > 0);

  const categoriesList = [
    { name: getTranslation('all_categories', language), count: 24, icon: <Filter className="w-4 h-4" /> },
    { name: getTranslation('ai_services', language), count: 8, icon: <Bot className="w-4 h-4" /> },
    { name: getTranslation('development', language), count: 6, icon: <Code className="w-4 h-4" /> },
    { name: getTranslation('productivity', language), count: 4, icon: <Workflow className="w-4 h-4" /> },
    { name: getTranslation('communication', language), count: 3, icon: <MessageSquare className="w-4 h-4" /> },
    { name: getTranslation('data_analysis', language), count: 2, icon: <BarChart className="w-4 h-4" /> },
    { name: getTranslation('automation', language), count: 1, icon: <Zap className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Hero Section */}
        <AnimatedDotsBackground />
      <div className="relative overflow-hidden">
        {/* Content */}
        <div className="relative z-10 border-b-5 !border-[#EF7E1C] ">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <div className="text-center space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                {getTranslation('gateway_title', language)}
              </h1>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                {getTranslation('gateway_subtitle', language)}
              </p>
              
              {/* Search */}
              <div className="max-w-2xl mx-auto pt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/90 z-10" />
                  <input
                    type="text"
                    placeholder={getTranslation('search_placeholder', language)}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#040708]/80 backdrop-blur-sm border-2 border-muted/30 rounded-lg px-4 py-3 pl-10 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-12">
          {filteredCategories.map((category) => (
            <div key={category.id} className="space-y-6">
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    {category.name}
                  </h2>
                  <p className="text-muted text-sm">
                    {category.description}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted">
                    View All
                  </span>
                  <button className="text-primary hover:text-primary/80 text-sm">
                    →
                  </button>
                </div>
              </div>

              {/* Service Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.services.map((service) => (
                  <Link key={service.id} href={`/service/${service.id}`}>
                    <ServiceCard
                      service={service}
                    />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
    
    </div>
  );
};

export default ServiceGateway;
