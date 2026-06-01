import { useColorScheme } from "react-native";
import colors, { categoryColors } from "@/constants/Colors";
import { useApp } from "@/context/AppContext";

export function useColors() {
  const scheme = useColorScheme();
  const app = useApp();
  
  // Use light mode colors by default, fall back gracefully
  const palette = scheme === "dark" ? colors.darkMode : colors.light;
  
  const activeColor = categoryColors[app.activeCategory] || categoryColors.beach;

  return {
    ...palette,
    primary: colors.primary,
    categoryPrimary: activeColor,
    tint: activeColor,
    radius: colors.light.radius,
  };
}
