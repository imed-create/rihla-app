/**
 * RIHLA — Absolute Dark Design Language
 * High-contrast deep black canvas, crisp white typography,
 * neon proximity status tokens, native DZD currency formatting.
 */
import { StyleSheet } from 'react-native';

export const RIHLA = {
  // ── Canvas / Background Base ──
  /** Pure deep black — primary canvas */
  background: '#0D0D0D',
  /** Deep charcoal — default component containers */
  card: '#121212',
  /** Clean 1px border for containers */
  border: '#222222',

  // ── High-Contrast Highlights ──
  /** Pure crisp white — primary text & highlights */
  white: '#FFFFFF',
  /** Solid black — typography on white surfaces */
  dark: '#000000',
  /** Primary text alias */
  text: '#FFFFFF',
  /** Secondary text on dark surfaces */
  mutedText: '#888888',
  /** Muted surface for inactive elements */
  muted: '#1A1A1A',

  // ── Brand / CTA ──
  /** Primary brand CTA — deep navy */
  primary: '#0a2540',
  primaryDark: '#061a2c',
  /** Accent / beach highlight — teal */
  accent: '#00a896',
  accentDark: '#008f7a',
  /** Highlight / VIP — sun gold */
  highlight: '#f4a261',
  highlightDark: '#e08f47',

  // ── Proximity Status Tokens ──
  /** Online / Live — Neon Green */
  online: '#00FF66',
  /** Busy — Amber */
  busy: '#FFB300',
  /** Offline / Asset — Slate */
  offline: '#888888',

  // ── Semantic ──
  error: '#e53e3e',
  success: '#00FF66',
  beachAccent: '#00a896',
  businessPro: '#0a2540',
  partnerPro: '#f4a261',
} as const;

/** @deprecated Use RIHLA instead */
export const SAHEL = RIHLA;

export const categoryColors = {
  beach: '#00a896',
  desert: '#C56A39',
  mountain: '#2F6B4F',
  historical: '#8A5A44',
  city: '#5B5BD6',
};

export const categoryGradients = {
  beach: ['#00a896', '#0a2540'] as [string, string],
  desert: ['#E76F51', '#C1440E'] as [string, string],
  mountain: ['#2D6A4F', '#1B4332'] as [string, string],
  historical: ['#8B5E3C', '#6B3F1E'] as [string, string],
  city: ['#6C63FF', '#4834D4'] as [string, string],
};

export const lightColors = {
  text: '#FFFFFF',
  foreground: '#FFFFFF',
  background: '#0D0D0D',
  card: '#121212',
  border: '#222222',
  muted: '#1A1A1A',
  mutedForeground: '#888888',
  primary: '#0a2540',
  accent: '#00a896',
  highlight: '#f4a261',
  dark: '#000000',
  beachAccent: '#00a896',
  radius: 16,
};

export const darkColors = {
  text: '#FFFFFF',
  foreground: '#FFFFFF',
  background: '#0D0D0D',
  card: '#121212',
  border: '#222222',
  muted: '#1A1A1A',
  mutedForeground: '#888888',
  primary: '#00a896',
  accent: '#f4a261',
  highlight: '#f4a261',
  dark: '#000000',
  beachAccent: '#00a896',
  radius: 16,
};

export const defaultStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  inputField: {
    height: 44,
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#121212',
    color: '#FFFFFF',
    fontFamily: 'mon',
  },
  btn: {
    backgroundColor: '#00a896',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#000000',
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
    backgroundColor: '#121212',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopColor: '#222222',
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
  online: RIHLA.online,
  busy: RIHLA.busy,
  offline: RIHLA.offline,
  categoryColors,
  categoryGradients,
  light: lightColors,
  darkMode: darkColors,
  rihla: RIHLA,
};
