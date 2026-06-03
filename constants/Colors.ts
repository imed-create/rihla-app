/**
 * SAHEL — Luxury Mediterranean Escape palette
 * Deep navy authority, teal coastal accent, sun-kissed gold highlights
 */
export const SAHEL = {
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

export const categoryColors = {
  beach: SAHEL.beachAccent,
  desert: '#C56A39',
  mountain: '#2F6B4F',
  historical: '#8A5A44',
  city: '#5B5BD6',
};

export const categoryGradients = {
  beach: [SAHEL.beachAccent, SAHEL.primary] as [string, string],
  desert: ['#E76F51', '#C1440E'] as [string, string],
  mountain: ['#2D6A4F', '#1B4332'] as [string, string],
  historical: ['#8B5E3C', '#6B3F1E'] as [string, string],
  city: ['#6C63FF', '#4834D4'] as [string, string],
};

export const lightColors = {
  text: SAHEL.text,
  foreground: SAHEL.text,
  background: SAHEL.background,
  card: SAHEL.card,
  border: SAHEL.border,
  muted: SAHEL.muted,
  mutedForeground: SAHEL.mutedText,
  primary: SAHEL.primary,
  accent: SAHEL.accent,
  highlight: SAHEL.highlight,
  dark: SAHEL.dark,
  beachAccent: SAHEL.beachAccent,
  radius: 16,
};

export const darkColors = {
  text: SAHEL.background,
  foreground: SAHEL.background,
  background: '#0a2540',
  card: '#0f3050',
  border: '#1e3a5f',
  muted: '#152a45',
  mutedForeground: '#94a3b8',
  primary: SAHEL.accent,
  accent: SAHEL.highlight,
  highlight: SAHEL.highlight,
  dark: SAHEL.dark,
  beachAccent: SAHEL.beachAccent,
  radius: 16,
};

export default {
  primary: SAHEL.primary,
  accent: SAHEL.accent,
  highlight: SAHEL.highlight,
  dark: SAHEL.dark,
  grey: SAHEL.mutedText,
  background: SAHEL.background,
  card: SAHEL.card,
  border: SAHEL.border,
  beachAccent: SAHEL.beachAccent,
  businessPro: SAHEL.businessPro,
  partnerPro: SAHEL.partnerPro,
  categoryColors,
  categoryGradients,
  light: lightColors,
  darkMode: darkColors,
  sahel: SAHEL,
};
