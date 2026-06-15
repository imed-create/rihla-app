/**
 * RIHLA — Theme Context
 * ──────────────────────
 * Provides color tokens based on dark/light mode.
 * Wraps the app so every screen can access `useTheme()`.
 */

import React, { createContext, useContext, type ReactNode } from 'react';
import { Appearance } from 'react-native';
import { useThemeStore, type ThemeMode } from '@/store/useThemeStore';

type ThemeColors = {
  /** Canvas background */
  bg: string;
  /** Card / container surface */
  card: string;
  /** Border color */
  border: string;
  /** Primary text */
  text: string;
  /** Secondary / muted text */
  muted: string;
  /** Icon tint for headers */
  icon: string;
  /** StatusBar style */
  statusBar: 'light-content' | 'dark-content';
};

const DARK: ThemeColors = {
  bg: '#0D0D0D',
  card: '#121212',
  border: '#222222',
  text: '#FFFFFF',
  muted: '#888888',
  icon: '#FFFFFF',
  statusBar: 'light-content',
};

const LIGHT: ThemeColors = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  muted: '#64748B',
  icon: '#0F172A',
  statusBar: 'dark-content',
};

type ThemeContextType = {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useThemeStore((s) => s.mode);
  const toggleMode = useThemeStore((s) => s.toggleMode);
  const setMode = useThemeStore((s) => s.setMode);

  const colors = mode === 'dark' ? DARK : LIGHT;
  const isDark = mode === 'dark';

  // Sync OS appearance
  Appearance.setColorScheme(mode);

  return (
    <ThemeContext.Provider value={{ mode, colors, isDark, toggleMode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
