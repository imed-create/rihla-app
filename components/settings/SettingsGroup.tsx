import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SettingsGroup({
  title,
  children,
  footer,
}: {
  title?: string;
  children: React.ReactNode;
  footer?: string;
}) {
  return (
    <View style={styles.wrap}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.card}>{children}</View>
      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  title: {
    fontSize: 11,
    fontFamily: 'mon-sb',
    color: '#64748B',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  footer: {
    fontSize: 12,
    fontFamily: 'mon',
    color: '#94A3B8',
    marginLeft: 4,
    lineHeight: 17,
  },
});
