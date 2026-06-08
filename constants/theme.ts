/**
 * RIHLA — Luxury Mediterranean Escape palette
 * Deep navy authority, teal coastal accent, sun-kissed gold highlights
 */
import { StyleSheet } from 'react-native';

export const RIHLA = {
  /** Primary / brand CTA / business pro */
  primary: '#0a2540',
  primaryDark: '#061a2c',
  /** Accent / beach highlight / action icons */
  accent: '#00a896',
  accentDark: '#008f7a',
  /** Highlight / VIP / partner pro */
  highlight: '#f4a261',
  highlightDark: '#e08f47',
  /** Surfaces */
  background: '#fafbfc',
  card: '#ffffff',
  white: '#ffffff',
  /** Typography & chrome */
  dark: '#1a1a1a',
  text: '#1a1a1a',
  border: '#e2e8f0',
  muted: '#f1f5f9',
  mutedText: '#888888',
  /** Semantic aliases */
  beachAccent: '#00a896',
  businessPro: '#0a2540',
  partnerPro: '#f4a261',
  error: '#e53e3e',
  success: '#00a896',
} as const;

/** @deprecated Use RIHLA instead */
export const SAHEL = RIHLA;

export const categoryColors = {
  beach: RIHLA.beachAccent,
  desert: '#C56A39',
  mountain: '#2F6B4F',
  historical: '#8A5A44',
  city: '#5B5BD6',
};

export const categoryGradients = {
  beach: [RIHLA.beachAccent, RIHLA.primary] as [string, string],
  desert: ['#E76F51', '#C1440E'] as [string, string],
  mountain: ['#2D6A4F', '#1B4332'] as [string, string],
  historical: ['#8B5E3C', '#6B3F1E'] as [string, string],
  city: ['#6C63FF', '#4834D4'] as [string, string],
};

export const lightColors = {
  text: RIHLA.text,
  foreground: RIHLA.text,
  background: RIHLA.background,
  card: RIHLA.card,
  border: RIHLA.border,
  muted: RIHLA.muted,
  mutedForeground: RIHLA.mutedText,
  primary: RIHLA.primary,
  accent: RIHLA.accent,
  highlight: RIHLA.highlight,
  dark: RIHLA.dark,
  beachAccent: RIHLA.beachAccent,
  radius: 16,
};

export const darkColors = {
  text: RIHLA.background,
  foreground: RIHLA.background,
  background: '#0a2540',
  card: '#0f3050',
  border: '#1e3a5f',
  muted: '#152a45',
  mutedForeground: '#94a3b8',
  primary: RIHLA.accent,
  accent: RIHLA.highlight,
  highlight: RIHLA.highlight,
  dark: RIHLA.dark,
  beachAccent: RIHLA.beachAccent,
  radius: 16,
};

export const defaultStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RIHLA.background,
  },
  inputField: {
    height: 44,
    borderWidth: 1,
    borderColor: RIHLA.border,
    borderRadius: 8,
    padding: 10,
    backgroundColor: RIHLA.card,
  },
  btn: {
    backgroundColor: RIHLA.primary,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'mon-b',
  },
  btnIcon: {
    position: 'absolute',
    left: 16,
  },
  footer: {
    position: 'absolute',
    height: 100,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: RIHLA.card,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopColor: RIHLA.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

export default {
  primary: RIHLA.primary,
  accent: RIHLA.accent,
  highlight: RIHLA.highlight,
  dark: RIHLA.dark,
  grey: RIHLA.mutedText,
  background: RIHLA.background,
  card: RIHLA.card,
  border: RIHLA.border,
  beachAccent: RIHLA.beachAccent,
  businessPro: RIHLA.businessPro,
  partnerPro: RIHLA.partnerPro,
  categoryColors,
  categoryGradients,
  light: lightColors,
  darkMode: darkColors,
  rihla: RIHLA,
};
