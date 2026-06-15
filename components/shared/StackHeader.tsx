import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

export default function StackHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const pathname = usePathname();
  const { colors } = useTheme();

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else if (pathname.includes('business')) router.replace('/(business)' as any);
    else if (pathname.includes('partner')) router.replace('/(partner)' as any);
    else router.replace('/(tabs)' as any);
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleBack} activeOpacity={0.8}>
        <Ionicons name="chevron-back" size={22} color={colors.icon} />
      </TouchableOpacity>

      <View style={styles.center}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={[styles.subtitle, { color: colors.muted }]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  center: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontFamily: 'mon-b' },
  subtitle: { fontSize: 12, fontFamily: 'mon' },
  right: { minWidth: 40, alignItems: 'flex-end' },
});
