'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import styles from './ThemeSwitcher.module.css';

interface ThemeSwitcherProps {
  className?: string;
  placeholderClassName?: string;
}

const ThemeSwitcher = ({ className, placeholderClassName }: ThemeSwitcherProps) => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={placeholderClassName ?? styles.placeholder} />;
  }

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className={className ?? styles.switcher}
      aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
    >
      <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
      <span>{isDark ? 'Tema Claro' : 'Tema Escuro'}</span>
    </button>
  );
};

export default ThemeSwitcher;
