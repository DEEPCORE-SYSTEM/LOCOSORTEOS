import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Inicializamos el estado leyendo de localStorage o usando el default (light)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme;
      }
      // Preferencia del sistema (opcional, por ahora por defecto light)
      // if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      //   return 'dark';
      // }
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Removemos ambas clases por si acaso
    root.classList.remove('light', 'dark');
    
    // Agregamos la clase actual
    root.classList.add(theme);
    
    // Guardamos en localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
