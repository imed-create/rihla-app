export const categoryColors = {
  beach: '#007A87',
  desert: '#C56A39',
  mountain: '#2F6B4F',
  historical: '#8A5A44',
  city: '#5B5BD6',
};

export const categoryGradients = {
  beach: ['#0096C7', '#023E58'] as [string, string],
  desert: ['#E76F51', '#C1440E'] as [string, string],
  mountain: ['#2D6A4F', '#1B4332'] as [string, string],
  historical: ['#8B5E3C', '#6B3F1E'] as [string, string],
  city: ['#6C63FF', '#4834D4'] as [string, string],
};

// Design tokens for light mode
export const lightColors = {
  text: '#222222',
  foreground: '#222222',
  background: '#F7F7F7',
  card: '#FFFFFF',
  border: '#DDDDDD',
  muted: '#F2F2F2',
  mutedForeground: '#717171',
  primary: '#FF385C',
  radius: 16,
};

// Design tokens for dark mode
export const darkColors = {
  text: '#F7F7F7',
  foreground: '#F7F7F7',
  background: '#111111',
  card: '#1F1F1F',
  border: '#3A3A3A',
  muted: '#2B2B2B',
  mutedForeground: '#B0B0B0',
  primary: '#FF385C',
  radius: 16,
};

export default {
  primary: '#FF385C',
  grey: '#5E5D5E',
  dark: '#1A1A1A',
  categoryColors,
  categoryGradients,
  light: lightColors,
  darkMode: darkColors,
};
