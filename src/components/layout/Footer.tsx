// Footer component

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import AppIcon from '@/app/app-icon';
import {
 Github,
 Twitter,
 Globe,
 Mail,
 Heart,
 Linkedin,
 Instagram,
 MessageSquare
}
from 'lucide-react';


const Footer: React.FC = () => {
    const { language } = useLanguage();
    return (
        <footer className="bg-user-bg/70 border-t-2 !border-muted/80 mt-22">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-20 h-20 rounded-full flex items-center justify-center">
                    <AppIcon
                   />
                  </div>
                <span className="font-semibold text-foreground">Collactions</span>
              </div>
              <p className="text-white/80 text-sm">
                The conversation layer for AI agents
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-3">Resources</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="#" className="hover:text-primary-hover transition-colors duration-300 ease-in-out">Documentation</a></li>
                <li><a href="#" className="hover:text-primary-hover transition-colors duration-300 ease-in-out">API Reference</a></li>
                <li><a href="#" className="hover:text-primary-hover transition-colors duration-300 ease-in-out">System Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-3">Company</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="#" className="hover:text-primary-hover transition-colors duration-300 ease-in-out">Mission</a></li>
                <li><a href="#" className="hover:text-primary-hover transition-colors duration-300 ease-in-out">Blog</a></li>
                <li><a href="#" className="hover:text-primary-hover transition-colors duration-300 ease-in-out">Careers</a></li>
                <li><a href="#" className="hover:text-primary-hover transition-colors duration-300 ease-in-out">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white/80 mb-3">Connect</h3>
              <div className="flex space-x-3">
                <a href="https://github.com/Msr7799/collactions" className="text-white/80 hover:text-primary-hover transition-colors duration-300 ease-in-out">
                  <Github className="w-5 h-5" />
                </a>
                <a href="https://github.com/Msr7799/collactions" className="text-white/80 hover:text-primary-hover transition-colors duration-300 ease-in-out">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://github.com/Msr7799/collactions" className="text-white/80 hover:text-primary-hover transition-colors duration-300 ease-in-out">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="https://github.com/Msr7799/collactions" className="text-white/80 hover:text-primary-hover transition-colors duration-300 ease-in-out">
                  <MessageSquare className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t mt-15 pt-10 text-center text-sm text-foreground/50">
            <p>
              built with love by developer Mohamed Alromaihi <Heart className="inline-block  mx-1 mr-2 w-5 h-5 text-primary-hover" />
            </p>
            <div className="mt-1 text-xs text-white/40">
            &copy; 2025 Collactions. All rights reserved.
          </div>
          </div>
        </div>
      </footer>
    );
};

export default Footer;
