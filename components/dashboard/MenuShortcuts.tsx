import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { getProMenuItems, PRO_THEME, ProRole } from '@/constants/proNavigation';
import { useTranslation } from '@/context/I18nContext';
import { useTheme } from '@/context/ThemeContext';

export default function ProMenuShortcuts({ role }: { role: ProRole }) {
  const items = getProMenuItems(role);
  const theme = PRO_THEME[role];
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.text }]}>{t('pro.moreFromMenu')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => {
              Haptics.selectionAsync();
              router.push(item.href as any);
            }}
            style={[styles.chip, { backgroundColor: colors.card, borderColor: theme.accent + '35' }]}
          >
            <Ionicons name={item.icon} size={16} color={theme.accent} />
            <Text style={[styles.chipText, { color: theme.accentDark }]}>{item.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  label: { fontSize: 16, fontFamily: 'mon-b' },
  row: { gap: 8, paddingRight: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontFamily: 'mon-sb' },
});
