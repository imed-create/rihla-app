import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ProRole, PRO_THEME } from '@/constants/proNavigation';
import { useProNav } from './NavProvider';
import { safeGoBack } from '@/utils/safeNavigation';
import { useTheme } from '@/context/ThemeContext';

export default function ProTopBar({
  role,
  title,
  subtitle,
  right,
  showBack = false,
  showMenu = true,
  style,
}: {
  role: ProRole;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  showBack?: boolean;
  showMenu?: boolean;
  style?: ViewStyle;
}) {
  const insets = useSafeAreaInsets();
  const { openMenu } = useProNav();
  const theme = PRO_THEME[role];
  const { colors } = useTheme();

  const onMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openMenu();
  };

  const onBack = () => {
    Haptics.selectionAsync();
    safeGoBack(role === 'business' ? '/(business)' : '/(partner)');
  };

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }, style]}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable onPress={onBack} style={[styles.iconBtn, { backgroundColor: colors.bg, borderColor: colors.border }]} accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
        ) : showMenu ? (
          <Pressable
            onPress={onMenu}
            style={[styles.iconBtn, styles.menuBtn, { backgroundColor: colors.card, borderColor: theme.accent + '30' }]}
            accessibilityLabel="Open menu"
          >
            <Ionicons name="menu" size={22} color={theme.accent} />
          </Pressable>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}

        <View style={styles.center}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.muted }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.rightSlot}>{right ?? <View style={styles.iconPlaceholder} />}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  menuBtn: {},
  iconPlaceholder: { width: 40 },
  center: { flex: 1, gap: 2, minWidth: 0 },
  title: { fontSize: 18, fontFamily: 'mon-b' },
  subtitle: { fontSize: 12, fontFamily: 'mon' },
  rightSlot: { minWidth: 40, alignItems: 'flex-end', justifyContent: 'center' },
});
