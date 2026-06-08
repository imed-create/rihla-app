import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ProRole } from '@/constants/proNavigation';
import ProTopBar from './TopBar';

/** Wrapper for bottom-tab screens: clean top bar + scrollable body. */
export default function ProTabShell({
  role,
  title,
  subtitle,
  headerRight,
  children,
}: {
  role: ProRole;
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.root}>
      <ProTopBar role={role} title={title} subtitle={subtitle} right={headerRight} />
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fafbfc' },
  body: { flex: 1 },
});
