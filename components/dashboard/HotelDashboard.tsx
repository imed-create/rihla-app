/**
 * RIHLA — Hotel Business Dashboard
 * ─────────────────────────────────
 * Clean layout featuring styled metrics, room inventory levels, and direct actions.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';

const ROOM_TYPES = [
  { id: 'standard', label: 'Standard Room', total: 12, occupied: 9, pricePerNight: 6500 },
  { id: 'double', label: 'Double Room', total: 8, occupied: 5, pricePerNight: 9500 },
  { id: 'suite', label: 'Executive Suite', total: 4, occupied: 3, pricePerNight: 14000 },
  { id: 'family', label: 'Family Suite', total: 3, occupied: 2, pricePerNight: 12000 },
];

const UPCOMING_CHECKINS = [
  { id: '1', guest: 'Ahmed Bouzid', room: 'Room 205 (Double)', checkIn: 'Today 14:00', nights: 3, totalDZD: 28500 },
  { id: '2', guest: 'Meryem Taleb', room: 'Room 301 (Suite)', checkIn: 'Tomorrow 15:00', nights: 2, totalDZD: 28000 },
];

export default function HotelDashboard() {
  const totalRooms = ROOM_TYPES.reduce((s, r) => s + r.total, 0);
  const occupiedRooms = ROOM_TYPES.reduce((s, r) => s + r.occupied, 0);
  const occupancyPct = Math.round((occupiedRooms / totalRooms) * 100);
  const todayRevenue = ROOM_TYPES.reduce((s, r) => s + r.occupied * r.pricePerNight, 0);

  const navigateTo = (path: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(path as any);
  };

  return (
    <View style={styles.container}>
      {/* ── STATS ROW ── */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: RIHLA.accent + '15' }]}>
            <Ionicons name="bed-outline" size={20} color={RIHLA.accent} />
          </View>
          <Text style={styles.statValue}>{occupiedRooms}/{totalRooms}</Text>
          <Text style={styles.statLabel}>Rooms Busy</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: RIHLA.highlight + '15' }]}>
            <Ionicons name="trending-up-outline" size={20} color={RIHLA.highlight} />
          </View>
          <Text style={styles.statValue}>{occupancyPct}%</Text>
          <Text style={styles.statLabel}>Occupancy</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: '#A855F715' }]}>
            <Ionicons name="wallet-outline" size={20} color="#A855F7" />
          </View>
          <Text style={styles.statValue}>{todayRevenue.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Est. Revenue (DZD)</Text>
        </View>
      </View>

      {/* ── ROOM INVENTORY ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Room Availability</Text>
        <Text style={styles.sectionSubtitle}>Real-time inventory levels</Text>
      </View>

      <View style={styles.roomList}>
        {ROOM_TYPES.map((room) => {
          const available = room.total - room.occupied;
          const pct = (room.occupied / room.total) * 100;
          return (
            <View key={room.id} style={styles.roomCard}>
              <View style={styles.roomInfo}>
                <View>
                  <Text style={styles.roomName}>{room.label}</Text>
                  <Text style={styles.roomPrice}>{room.pricePerNight.toLocaleString()} DZD / night</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{available} Available</Text>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${pct}%` as any, backgroundColor: pct > 80 ? '#EF4444' : RIHLA.accent }]} />
                </View>
                <Text style={styles.occupancyText}>{room.occupied} of {room.total} booked</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* ── UPCOMING CHECK-INS ── */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>Upcoming Arrivals</Text>
          <Text style={styles.sectionSubtitle}>Expected check-ins today & tomorrow</Text>
        </View>
        <Pressable onPress={() => navigateTo('/(business)/bookings')}>
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      </View>

      <View style={styles.checkinList}>
        {UPCOMING_CHECKINS.map((booking) => (
          <View key={booking.id} style={styles.checkinCard}>
            <View style={styles.checkinAvatar}>
              <Text style={styles.avatarText}>{booking.guest.charAt(0)}</Text>
            </View>
            <View style={styles.checkinDetails}>
              <Text style={styles.guestName}>{booking.guest}</Text>
              <Text style={styles.bookingRoom}>{booking.room} · {booking.nights} nights</Text>
              <Text style={styles.arrivalTime}>{booking.checkIn}</Text>
            </View>
            <View style={styles.checkinPrice}>
              <Text style={styles.priceValue}>{booking.totalDZD.toLocaleString()} DZD</Text>
              <Text style={styles.statusLabelGreen}>Confirmed</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── QUICK ACTIONS ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
      </View>

      <View style={styles.actionsGrid}>
        <Pressable style={styles.actionCard} onPress={() => navigateTo('/(business)/listings/new')}>
          <Ionicons name="add-circle-outline" size={24} color={RIHLA.primary} />
          <Text style={styles.actionText}>Add Room</Text>
        </Pressable>

        <Pressable style={styles.actionCard} onPress={() => navigateTo('/(business)/analytics')}>
          <Ionicons name="stats-chart-outline" size={24} color={RIHLA.accent} />
          <Text style={styles.actionText}>Analytics</Text>
        </Pressable>

        <Pressable style={styles.actionCard} onPress={() => navigateTo('/(business)/reviews')}>
          <Ionicons name="star-outline" size={24} color={RIHLA.highlight} />
          <Text style={styles.actionText}>Reviews</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  
  // Stats
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.dark },
  statLabel: { fontSize: 10, fontFamily: 'mon', color: RIHLA.mutedText },

  // Sections
  sectionHeader: { gap: 2, marginTop: 4 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.dark },
  sectionSubtitle: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText },
  seeAll: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.accent },

  // Rooms
  roomList: { gap: 10 },
  roomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 12,
  },
  roomInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  roomName: { fontSize: 14, fontFamily: 'mon-sb', color: RIHLA.dark },
  roomPrice: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 2 },
  badge: { backgroundColor: '#E6FAF7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontFamily: 'mon-sb', color: RIHLA.primary },
  
  progressContainer: { gap: 6 },
  progressBarBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  occupancyText: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText },

  // Checkins
  checkinList: { gap: 10 },
  checkinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 12,
  },
  checkinAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.dark },
  checkinDetails: { flex: 1, gap: 2 },
  guestName: { fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.dark },
  bookingRoom: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText },
  arrivalTime: { fontSize: 11, fontFamily: 'mon-sb', color: RIHLA.accent, marginTop: 1 },
  checkinPrice: { alignItems: 'flex-end', gap: 4 },
  priceValue: { fontSize: 13, fontFamily: 'mon-b', color: RIHLA.dark },
  statusLabelGreen: { fontSize: 10, fontFamily: 'mon-sb', color: '#10B981' },

  // Actions
  actionsGrid: { flexDirection: 'row', gap: 10 },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    alignItems: 'center',
    gap: 8,
  },
  actionText: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.dark },
});

