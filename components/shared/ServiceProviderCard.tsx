/**
 * RIHLA — Service Provider Card (Uber DriverCard adaptation)
 * ──────────────────────────────────────────────────────────────
 * Ported from Uber Clone's DriverCard.tsx design.
 * Shows profile image, name, rating, price, ETA, category badge.
 * Used for guides, drivers, photographers, beach attendants, etc.
 */

import React from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { getCategoryDef } from '@/constants/marketplaceCategories';
import { formatTime } from '@/lib/map';

export interface ServiceProvider {
  id: string;
  name: string;
  title: string;
  subtitle?: string;
  category: string;
  rating: number;
  priceDZD: number;
  time?: number; // minutes
  imageUrl?: string;
  carImageUrl?: string;
  seats?: number;
  badge?: string;
  isAvailable?: boolean;
}

interface ServiceProviderCardProps {
  provider: ServiceProvider;
  selected?: boolean;
  onSelect?: () => void;
  onPress?: () => void;
}

export default function ServiceProviderCard({
  provider,
  selected = false,
  onSelect,
  onPress,
}: ServiceProviderCardProps) {
  const { colors } = useTheme();
  const catDef = getCategoryDef(provider.category as any);
  const catColor = catDef?.color || RIHLA.primary;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect?.();
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      style={[
        styles.card,
        { backgroundColor: colors.card },
        selected && {
          borderColor: catColor,
          backgroundColor: catColor + '08',
        },
      ]}
    >
      {/* Profile Image */}
      <View style={[styles.avatarWrap, { backgroundColor: catColor + '15' }]}>
        {provider.imageUrl ? (
          <Image source={{ uri: provider.imageUrl }} style={styles.avatar} />
        ) : (
          <Ionicons name="person" size={22} color={catColor} />
        )}
        {provider.isAvailable !== false && (
          <View style={[styles.onlineDot, { borderColor: colors.card }]} />
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{provider.name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#FFD166" />
            <Text style={[styles.rating, { color: colors.text }]}>{provider.rating}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          {/* Category badge */}
          <View style={[styles.catBadge, { backgroundColor: catColor + '15' }]}>
            <Ionicons name={catDef?.icon as any} size={11} color={catColor} />
            <Text style={[styles.catText, { color: catColor }]}>{catDef?.label || provider.category}</Text>
          </View>

          {/* Badge */}
          {provider.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{provider.badge}</Text>
            </View>
          )}
        </View>

        <View style={styles.metaRow}>
          {/* Price */}
          <Text style={styles.price}>
            {provider.priceDZD.toLocaleString()} <Text style={[styles.priceUnit, { color: colors.muted }]}>DZD</Text>
          </Text>

          {/* Separator */}
          {(provider.time != null || provider.seats) && (
            <Text style={[styles.separator, { color: colors.muted }]}>|</Text>
          )}

          {/* ETA */}
          {provider.time != null && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={12} color={colors.muted} />
              <Text style={[styles.metaText, { color: colors.muted }]}>{formatTime(provider.time)}</Text>
            </View>
          )}

          {/* Seats */}
          {provider.seats != null && (
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={12} color={colors.muted} />
              <Text style={[styles.metaText, { color: colors.muted }]}>{provider.seats} seats</Text>
            </View>
          )}
        </View>
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: RIHLA.border,
    marginBottom: 8,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  info: { flex: 1, gap: 4 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 15,
    fontFamily: 'mon-b',
    color: RIHLA.dark,
    flex: 1,
    marginRight: 8,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  rating: { fontSize: 13, fontFamily: 'mon-b', color: RIHLA.dark },
  detailsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catText: { fontSize: 10, fontFamily: 'mon-b' },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#FEF3C7',
  },
  badgeText: { fontSize: 10, fontFamily: 'mon-b', color: '#D97706' },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    fontFamily: 'mon-b',
    color: RIHLA.primary,
  },
  priceUnit: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  separator: { fontSize: 12, color: '#CBD5E1' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  metaText: { fontSize: 12, fontFamily: 'mon-sb', color: '#64748B' },
});
