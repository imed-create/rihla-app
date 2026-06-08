import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ProRole } from '@/constants/proNavigation';
import ProTopBar from './TopBar';

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
  return (
    <View style={styles.root}>
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
  root: { flex: 1, backgroundColor: '#fafbfc' },
  body: { flex: 1 },
});
