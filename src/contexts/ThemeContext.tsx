'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setThemeState(initialTheme);
    updateDocumentTheme(initialTheme);
  }, []);

  // Update document class and CSS variables when theme changes
  const updateDocumentTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add new theme class
    root.classList.add(newTheme);
    
    // Update CSS custom properties
    if (newTheme === 'light') {
      root.style.setProperty('--user-bg', '#f7f8f9');
      root.style.setProperty('--very-dark-bg', '#e8eaed');
      root.style.setProperty('--background', '#f7f8f9');
      root.style.setProperty('--high-light-bg', '#761800');
      root.style.setProperty('--bg-dark', '#e8eaed');
      root.style.setProperty('--foreground', '#161515ff');
      root.style.setProperty('--primary', '#761800');
      root.style.setProperty('--primary-glow', 'rgba(0, 0, 0, 0.4)');
      root.style.setProperty('--primary-hover', '#de4d29c7');
      root.style.setProperty('--secondary', '#000000');
      root.style.setProperty('--border', '#e0e0e0');
      root.style.setProperty('--muted', '#666666');
      root.style.setProperty('--input', '#ffffff');
      root.style.setProperty('--danger', '#e91822');
      root.style.setProperty('--warning', '#b8b500');
      root.style.setProperty('--success', '#4caf50');
      root.style.setProperty('--light', '#2a2a2a');
      root.style.setProperty('--glow', '0 0 3px rgba(40, 40, 40, 0.4), 0 0 4px rgba(50, 50, 50, 0.3)');
      
      // CodeBlock Colors - Light Mode
      root.style.setProperty('--codeblock-bg', '#ffffff');
      root.style.setProperty('--codeblock-header-bg', '#f6f8fa');
      root.style.setProperty('--codeblock-text', '#24292f');
      root.style.setProperty('--codeblock-text-muted', '#656d76');
      root.style.setProperty('--codeblock-border', '#d0d7de');
      root.style.setProperty('--codeblock-button-bg', '#f6f8fa');
      root.style.setProperty('--codeblock-button-hover', '#f3f4f6');
      root.style.setProperty('--codeblock-editor-bg', '#ffffff');
      
      // Syntax Highlighting - Light Mode
      root.style.setProperty('--syntax-keyword', '#0066cc');
      root.style.setProperty('--syntax-string', '#d73a49');
      root.style.setProperty('--syntax-comment', '#6a737d');
      root.style.setProperty('--syntax-number', '#005cc5');
      root.style.setProperty('--syntax-function', '#6f42c1');
      root.style.setProperty('--syntax-variable', '#24292e');
      root.style.setProperty('--syntax-operator', '#d73a49');
      root.style.setProperty('--syntax-bracket', '#24292e');
    } else {
      root.style.setProperty('--user-bg', '#0c1012');
      root.style.setProperty('--very-dark-bg', '#0a0a0a');
      root.style.setProperty('--background', '#0c1012');
      root.style.setProperty('--high-light-bg', '#0e0e0e');
      root.style.setProperty('--bg-dark', '#0d1315');
      root.style.setProperty('--foreground', '#ededed');
      root.style.setProperty('--primary', '#761800');
      root.style.setProperty('--primary-glow', 'rgba(255, 255, 255, 0.4)');
      root.style.setProperty('--primary-hover', '#e54d27bb');
      root.style.setProperty('--secondary', '#ffffff');
      root.style.setProperty('--border', '#2a2a2a');
      root.style.setProperty('--muted', '#4a4a4a');
      root.style.setProperty('--input', '#1e1f1c');
      root.style.setProperty('--danger', '#e91822');
      root.style.setProperty('--warning', '#cdca00');
      root.style.setProperty('--success', 'hsla(122, 48%, 56%, 0.976)');
      root.style.setProperty('--light', 'rgba(230, 237, 237, 0.862)');
      root.style.setProperty('--glow', '0 0 3px rgba(227, 237, 236, 0.625), 0 0 4px rgba(236, 240, 247, 0.667)');
      
      // CodeBlock Colors - Dark Mode
      root.style.setProperty('--codeblock-bg', '#1e1e1e');
      root.style.setProperty('--codeblock-header-bg', '#212121');
      root.style.setProperty('--codeblock-text', '#e0e6ed');
      root.style.setProperty('--codeblock-text-muted', '#b8b8b8');
      root.style.setProperty('--codeblock-border', '#3e3e3e');
      root.style.setProperty('--codeblock-button-bg', '#2d2d30');
      root.style.setProperty('--codeblock-button-hover', '#3e3e42');
      root.style.setProperty('--codeblock-editor-bg', '#1e1e1e');
      
      // Syntax Highlighting - Dark Mode
      root.style.setProperty('--syntax-keyword', '#569cd6');
      root.style.setProperty('--syntax-string', '#ce9178');
      root.style.setProperty('--syntax-comment', '#87ceeb');
      root.style.setProperty('--syntax-number', '#b5cea8');
      root.style.setProperty('--syntax-function', '#dcdcaa');
      root.style.setProperty('--syntax-variable', '#53bfb8');
      root.style.setProperty('--syntax-operator', '#d4d4d4');
      root.style.setProperty('--syntax-bracket', '#d4d4d4');
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    updateDocumentTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
