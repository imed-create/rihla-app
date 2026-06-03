import { useColorScheme } from 'react-native';
import colors, { categoryColors, SAHEL } from '@/constants/Colors';
import { useApp } from '@/context/AppContext';

export function useColors() {
  const scheme = useColorScheme();
  const app = useApp();

  const palette = scheme === 'dark' ? colors.darkMode : colors.light;

  const activeColor = categoryColors[app.activeCategory] || categoryColors.beach;

  return {
    ...palette,
    primary: colors.primary,
    accent: colors.accent,
    highlight: colors.highlight,
    dark: colors.dark,
    beachAccent: colors.beachAccent,
    categoryPrimary: activeColor,
    tint: activeColor,
    radius: colors.light.radius,
    sahel: SAHEL,
  };
}
