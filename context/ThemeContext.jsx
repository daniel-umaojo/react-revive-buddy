import { createContext, useContext, useState, ReactNode, useEffect } from 'react';



const themes= {
  'Ocean Blue': {
    name: 'Ocean Blue',
    colors: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#60a5fa',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  },
  'Midnight Ocean': {
    name: 'Midnight Ocean',
    colors: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#60a5fa',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  },
  'Forest Green': {
    name: 'Forest Green',
    colors: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#34d399',
      background: '#f0fdf4',
      surface: '#ffffff',
      text: '#064e3b',
      textSecondary: '#6b7280',
      border: '#d1fae5',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  },
  'Dark Forest': {
    name: 'Dark Forest',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#34d399',
      background: '#064e3b',
      surface: '#065f46',
      text: '#ecfdf5',
      textSecondary: '#a7f3d0',
      border: '#047857',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  },
  'Royal Purple': {
    name: 'Royal Purple',
    colors: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      accent: '#a78bfa',
      background: '#faf5ff',
      surface: '#ffffff',
      text: '#581c87',
      textSecondary: '#6b7280',
      border: '#e9d5ff',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  },
  'Cosmic Purple': {
    name: 'Cosmic Purple',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#a78bfa',
      background: '#1e1b4b',
      surface: '#312e81',
      text: '#f3f4f6',
      textSecondary: '#c4b5fd',
      border: '#4c1d95',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  },
  'Sunset Orange': {
    name: 'Sunset Orange',
    colors: {
      primary: '#ea580c',
      secondary: '#f97316',
      accent: '#fb923c',
      background: '#fff7ed',
      surface: '#ffffff',
      text: '#9a3412',
      textSecondary: '#6b7280',
      border: '#fed7aa',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  },
  'Dark Ember': {
    name: 'Dark Ember',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fb923c',
      background: '#431407',
      surface: '#7c2d12',
      text: '#fff7ed',
      textSecondary: '#fed7aa',
      border: '#9a3412',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  },
  'Tropical Teal': {
    name: 'Tropical Teal',
    colors: {
      primary: '#0d9488',
      secondary: '#14b8a6',
      accent: '#5eead4',
      background: '#f0fdfa',
      surface: '#ffffff',
      text: '#134e4a',
      textSecondary: '#6b7280',
      border: '#99f6e4',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  },
  'Deep Ocean': {
    name: 'Deep Ocean',
    colors: {
      primary: '#14b8a6',
      secondary: '#0d9488',
      accent: '#5eead4',
      background: '#042f2e',
      surface: '#134e4a',
      text: '#f0fdfa',
      textSecondary: '#99f6e4',
      border: '#0f766e',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  }
};



const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState('Ocean Blue');

  useEffect(() => {
    const savedTheme = localStorage.getItem('glence_theme');
    if (savedTheme && themes[savedTheme]) {
      setThemeName(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('glence_theme', themeName);
    
    // Apply CSS variables to root
    const theme = themes[themeName];
    const root = document.documentElement;
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, [themeName]);

  const setTheme = (newThemeName) => {
    if (themes[newThemeName]) {
      setThemeName(newThemeName);
    }
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme: themes[themeName],
      themeName,
      setTheme,
      availableThemes: Object.keys(themes)
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}