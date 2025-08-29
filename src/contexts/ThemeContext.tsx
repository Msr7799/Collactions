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
      root.style.setProperty('--background', '#ffffff');
      root.style.setProperty('--high-light-bg', '#f8f9fa');
      root.style.setProperty('--bg-dark', '#f5f5f5');
      root.style.setProperty('--foreground', '#1a1a1a');
      root.style.setProperty('--primary', '#f57c52');
      root.style.setProperty('--primary-glow', 'rgba(0, 0, 0, 0.4)');
      root.style.setProperty('--primary-hover', '#e76a3f');
      root.style.setProperty('--secondary', '#000000');
      root.style.setProperty('--border', '#e0e0e0');
      root.style.setProperty('--muted', '#666666');
      root.style.setProperty('--input', '#ffffff');
      root.style.setProperty('--danger', '#e91822');
      root.style.setProperty('--warning', '#b8b500');
      root.style.setProperty('--success', '#4caf50');
      root.style.setProperty('--light', '#2a2a2a');
      root.style.setProperty('--glow', '0 0 3px rgba(40, 40, 40, 0.4), 0 0 4px rgba(50, 50, 50, 0.3)');
    } else {
      root.style.setProperty('--background', '#0c1012');
      root.style.setProperty('--high-light-bg', '#0e0e0e');
      root.style.setProperty('--bg-dark', '#0d1315');
      root.style.setProperty('--foreground', '#ededed');
      root.style.setProperty('--primary', '#f57c52');
      root.style.setProperty('--primary-glow', 'rgba(255, 255, 255, 0.4)');
      root.style.setProperty('--primary-hover', '#fff017');
      root.style.setProperty('--secondary', '#ffffff');
      root.style.setProperty('--border', '#2a2a2a');
      root.style.setProperty('--muted', '#4a4a4a');
      root.style.setProperty('--input', '#1e1f1c');
      root.style.setProperty('--danger', '#e91822');
      root.style.setProperty('--warning', '#cdca00');
      root.style.setProperty('--success', 'hsla(122, 48%, 56%, 0.976)');
      root.style.setProperty('--light', 'rgba(230, 237, 237, 0.862)');
      root.style.setProperty('--glow', '0 0 3px rgba(227, 237, 236, 0.625), 0 0 4px rgba(236, 240, 247, 0.667)');
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
