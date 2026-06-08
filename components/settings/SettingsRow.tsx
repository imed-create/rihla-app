import React from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/store/useSettingsStore';
import { RIHLA } from '@/constants/theme';

export function SettingsNavRow({
  icon,
  iconColor = RIHLA.primary,
  label,
  subtitle,
  value,
  onPress,
  showChevron = true,
  isLast,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  isLast?: boolean;
}) {
  const haptics = useSettingsStore((s) => s.hapticsEnabled);

  return (
    <Pressable
      onPress={() => {
        if (!onPress) return;
        if (haptics) Haptics.selectionAsync();
        onPress();
      }}
      disabled={!onPress}
      style={[styles.row, !isLast && styles.rowBorder]}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconColor + '14' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.label}>{label}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      </View>
      {value ? <Text style={styles.value}>{value}</Text> : null}
      {showChevron && onPress ? (
        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
      ) : null}
    </Pressable>
  );
}

export function SettingsToggleRow({
  icon,
  iconColor = RIHLA.accent,
  label,
  subtitle,
  value,
  onValueChange,
  isLast,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={[styles.iconWrap, { backgroundColor: iconColor + '14' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.label}>{label}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: RIHLA.border, true: RIHLA.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, gap: 2 },
  label: { fontSize: 15, fontFamily: 'mon-sb', color: '#0F172A' },
  sub: { fontSize: 12, fontFamily: 'mon', color: '#64748B', lineHeight: 16 },
  value: { fontSize: 13, fontFamily: 'mon-sb', color: '#64748B', marginRight: 4 },
});
