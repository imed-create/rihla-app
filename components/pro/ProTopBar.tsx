import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ProRole, PRO_THEME } from '@/constants/proNavigation';
import { useProNav } from './ProNavProvider';
import { safeGoBack } from '@/utils/safeNavigation';

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

  const onMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openMenu();
  };

  const onBack = () => {
    Haptics.selectionAsync();
    safeGoBack(role === 'business' ? '/(business)' : '/(partner)');
  };

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }, style]}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable onPress={onBack} style={styles.iconBtn} accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </Pressable>
        ) : showMenu ? (
          <Pressable
            onPress={onMenu}
            style={[styles.iconBtn, styles.menuBtn, { borderColor: theme.accent + '30' }]}
            accessibilityLabel="Open menu"
          >
            <Ionicons name="menu" size={22} color={theme.accent} />
          </Pressable>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}

        <View style={styles.center}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
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
    backgroundColor: '#fafbfc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuBtn: {
    backgroundColor: '#FFFFFF',
  },
  iconPlaceholder: { width: 40 },
  center: { flex: 1, gap: 2, minWidth: 0 },
  title: { fontSize: 18, fontFamily: 'mon-b', color: '#0F172A' },
  subtitle: { fontSize: 12, fontFamily: 'mon', color: '#64748B' },
  rightSlot: { minWidth: 40, alignItems: 'flex-end', justifyContent: 'center' },
});
