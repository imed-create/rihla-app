import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ProRole } from '@/constants/proNavigation';
import ProTopBar from './TopBar';
import { useTheme } from '@/context/ThemeContext';

/** Stack screens opened from the hamburger menu (with back + menu). */
export default function ProScreenChrome({
  role,
  title,
  subtitle,
  children,
  headerRight,
}: {
  role: ProRole;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <ProTopBar
        role={role}
        title={title}
        subtitle={subtitle}
        right={headerRight}
        showBack
        showMenu
      />
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1 },
});
