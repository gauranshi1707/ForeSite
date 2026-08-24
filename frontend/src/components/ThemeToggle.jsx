import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('foresite_theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('foresite_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('foresite_theme', 'light');
    }
    window.dispatchEvent(new Event('foresite_theme_change'));
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-1.5 rounded-sm text-stone-500 hover:text-stone-800 hover:bg-stone-100 border border-transparent transition-colors"
      title="Toggle Dark Mode"
    >
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}
