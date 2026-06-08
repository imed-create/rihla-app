/**
 * RIHLA — Marketplace Category Grid
 * -----------------------------------
 * Reusable component showing all 10 marketplace categories as tappable cards.
 * Used on the home screen and destination hubs.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { RIHLA } from '@/constants/theme';
import { MARKETPLACE_CATEGORIES } from '@/constants/marketplaceCategories';
import { MOCK_LISTINGS } from '@/constants/mockListings';
import { hapticLight } from '@/utils/haptics';

export default function MarketplaceCategoryGrid() {
  return (
    <View style={styles.grid}>
      {MARKETPLACE_CATEGORIES.map((cat) => {
        const count = MOCK_LISTINGS.filter((l) => l.is_active && l.category === cat.key).length;
        return (
          <Pressable
            key={cat.key}
            style={styles.card}
            onPress={() => {
              hapticLight();
              router.push(`/marketplace/${cat.key}` as any);
            }}
          >
            <View style={[styles.iconWrap, { backgroundColor: cat.color + '15' }]}>
              <Ionicons name={cat.icon as any} size={24} color={cat.color} />
            </View>
            <Text style={styles.label}>{cat.labelPlural}</Text>
            <Text style={styles.count}>
              {count > 0 ? `${count} listing${count !== 1 ? 's' : ''}` : 'Explore'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '30%',
    minWidth: 100,
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: RIHLA.border,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 11, fontFamily: 'mon-sb', color: RIHLA.dark, textAlign: 'center' },
  count: { fontSize: 10, fontFamily: 'mon', color: RIHLA.mutedText },
});
