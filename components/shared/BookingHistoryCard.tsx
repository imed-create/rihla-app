/**
 * RIHLA — Booking History Card (Uber RideCard adaptation)
 * ──────────────────────────────────────────────────────────
 * Ported from Uber Clone's RideCard.tsx design.
 * Shows mini-map thumbnail, origin/destination, date/time,
 * service info, payment status.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RIHLA } from '@/constants/theme';
import { getCategoryDef } from '@/constants/marketplaceCategories';

interface BookingHistoryItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  originAddress?: string;
  destinationAddress: string;
  date: string;
  time: string;
  price: number;
  status: 'completed' | 'active' | 'cancelled' | 'upcoming';
  rating?: number;
}

interface BookingHistoryCardProps {
  booking: BookingHistoryItem;
  onPress?: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: 'Completed', color: '#10B981', bg: '#DCFCE7' },
  active: { label: 'Active', color: '#3B82F6', bg: '#DBEAFE' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: '#FEE2E2' },
  upcoming: { label: 'Upcoming', color: '#F59E0B', bg: '#FEF3C7' },
};

export default function BookingHistoryCard({
  booking,
  onPress,
}: BookingHistoryCardProps) {
  const catDef = getCategoryDef(booking.category as any);
  const catColor = catDef?.color || RIHLA.primary;
  const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.completed;

  return (
    <Pressable
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.mainRow}>
        {/* Mini-map thumbnail placeholder */}
        <View style={[styles.mapThumb, { backgroundColor: catColor + '15' }]}>
          <Ionicons name={catDef?.icon as any} size={24} color={catColor} />
          <View style={styles.mapOverlay}>
            <Ionicons name="navigate" size={10} color="#fff" />
          </View>
        </View>

        {/* Origin → Destination */}
        <View style={styles.routeCol}>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.routeText} numberOfLines={1}>
              {booking.originAddress || 'Your location'}
            </Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.routeText} numberOfLines={1}>
              {booking.destinationAddress}
            </Text>
          </View>
        </View>
      </View>

      {/* Info rows */}
      <View style={[styles.infoGrid, { backgroundColor: '#F8FAFC' }]}>
        {/* Date & Time */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Date & Time</Text>
          <Text style={styles.infoValue}>
            {booking.date}, {booking.time}
          </Text>
        </View>

        {/* Service */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Service</Text>
          <View style={styles.catBadgeRow}>
            <View style={[styles.catBadge, { backgroundColor: catColor + '15' }]}>
              <Ionicons name={catDef?.icon as any} size={11} color={catColor} />
              <Text style={[styles.catText, { color: catColor }]}>{catDef?.label || booking.category}</Text>
            </View>
            <Text style={styles.infoValue}>{booking.title}</Text>
          </View>
        </View>

        {/* Price + Status */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total Paid</Text>
          <View style={styles.priceStatusRow}>
            <Text style={styles.priceValue}>
              {booking.price.toLocaleString()} DZD
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
              <Text style={[styles.statusText, { color: statusCfg.color }]}>
                {statusCfg.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Rating */}
        {booking.rating != null && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rating</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color="#FFD166" />
              <Text style={styles.ratingText}>{booking.rating}</Text>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: RIHLA.border,
    overflow: 'hidden',
    marginBottom: 10,
  },
  mainRow: {
    flexDirection: 'row',
    padding: 14,
    gap: 14,
    alignItems: 'center',
  },
  mapThumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeCol: { flex: 1, gap: 2 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeDot: { width: 8, height: 8, borderRadius: 4 },
  routeLine: {
    width: 2,
    height: 14,
    backgroundColor: '#CBD5E1',
    marginLeft: 3,
    marginVertical: 1,
  },
  routeText: {
    fontSize: 13,
    fontFamily: 'mon-sb',
    color: RIHLA.dark,
    flex: 1,
  },
  infoGrid: {
    borderTopWidth: 1,
    borderTopColor: RIHLA.border,
    padding: 14,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'mon',
    color: '#64748B',
  },
  infoValue: {
    fontSize: 12,
    fontFamily: 'mon-b',
    color: RIHLA.dark,
  },
  catBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  catText: { fontSize: 9, fontFamily: 'mon-b' },
  priceStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceValue: {
    fontSize: 13,
    fontFamily: 'mon-b',
    color: RIHLA.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'mon-b',
    textTransform: 'uppercase',
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 13, fontFamily: 'mon-b', color: RIHLA.dark },
});
