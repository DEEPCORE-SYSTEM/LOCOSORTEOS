import React from 'react';
import { useTheme } from '../Contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 ${
        isDarkMode ? 'text-yellow-400' : 'text-slate-500 hover:text-amber-500'
      }`}
      aria-label="Toggle Dark Mode"
      title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 transition-transform duration-300 rotate-0 scale-100" />
      ) : (
        <Moon className="w-5 h-5 transition-transform duration-300 -rotate-90 scale-100" />
      )}
    </button>
  );
}
