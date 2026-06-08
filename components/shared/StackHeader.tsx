import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';

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

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else if (pathname.includes('business')) router.replace('/(business)' as any);
    else if (pathname.includes('partner')) router.replace('/(partner)' as any);
    else router.replace('/(tabs)' as any);
  };

  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.8}>
        <Ionicons name="chevron-back" size={22} color="#0F172A" />
      </TouchableOpacity>

      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
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
    backgroundColor: '#fafbfc',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  center: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A' },
  subtitle: { fontSize: 12, fontFamily: 'mon', color: '#64748B' },
  right: { minWidth: 40, alignItems: 'flex-end' },
});

