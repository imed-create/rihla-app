/**
 * RIHLA — Guide Business Dashboard
 * ─────────────────────────────────
 * Tour schedule, languages, certifications, booking pipeline, quick actions.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';

const UPCOMING_TOURS = [
  { id: 't1', title: 'Casbah Walking Tour', date: 'Today 10:00', guests: 6, maxGuests: 8, durationH: 2.5, priceDZD: 3000 },
  { id: 't2', title: 'Roman Ruins of Tipaza', date: 'Today 14:00', guests: 4, maxGuests: 12, durationH: 4, priceDZD: 5000 },
  { id: 't3', title: 'M\'zab Valley Heritage', date: 'Tomorrow 08:00', guests: 10, maxGuests: 10, durationH: 6, priceDZD: 8000 },
  { id: 't4', title: 'Tlemcen Ottoman Walk', date: 'Jun 17, 09:00', guests: 0, maxGuests: 15, durationH: 3, priceDZD: 2500 },
];

const LANGUAGES = ['Arabic', 'French', 'English', 'Tamazight'];
const CERTIFICATIONS = ['Licensed Tour Guide', 'First Aid Certified', 'UNESCO Heritage'];

export default function GuideDashboard() {
  const totalBookings = UPCOMING_TOURS.reduce((s, t) => s + t.guests, 0);
  const upcomingCount = UPCOMING_TOURS.filter((t) => t.guests < t.maxGuests).length;
  const todayRevenue = UPCOMING_TOURS.filter((t) => t.date.includes('Today'))
    .reduce((s, t) => s + t.guests * t.priceDZD, 0);

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
            <Ionicons name="compass-outline" size={20} color={RIHLA.accent} />
          </View>
          <Text style={styles.statValue}>{UPCOMING_TOURS.length}</Text>
          <Text style={styles.statLabel}>Tours Scheduled</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: '#6366F1' + '15' }]}>
            <Ionicons name="people-outline" size={20} color="#6366F1" />
          </View>
          <Text style={styles.statValue}>{totalBookings}</Text>
          <Text style={styles.statLabel}>Total Guests</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: RIHLA.highlight + '15' }]}>
            <Ionicons name="wallet-outline" size={20} color={RIHLA.highlight} />
          </View>
          <Text style={styles.statValue}>{todayRevenue.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Today (DZD)</Text>
        </View>
      </View>

      {/* ── LANGUAGES & CERTS ── */}
      <View style={styles.tagSection}>
        <View style={styles.tagRow}>
          <Ionicons name="language-outline" size={16} color={RIHLA.accent} />
          {LANGUAGES.map((lang) => (
            <View key={lang} style={styles.tag}>
              <Text style={styles.tagText}>{lang}</Text>
            </View>
          ))}
        </View>
        <View style={styles.tagRow}>
          <Ionicons name="ribbon-outline" size={16} color={RIHLA.highlight} />
          {CERTIFICATIONS.map((cert) => (
            <View key={cert} style={[styles.tag, styles.certTag]}>
              <Text style={[styles.tagText, styles.certTagText]}>{cert}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── TOUR SCHEDULE ── */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>Tour Schedule</Text>
          <Text style={styles.sectionSubtitle}>Upcoming bookings</Text>
        </View>
        <Pressable onPress={() => navigateTo('/(business)/bookings')}>
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      </View>

      <View style={styles.tourList}>
        {UPCOMING_TOURS.map((tour) => {
          const isFull = tour.guests >= tour.maxGuests;
          return (
            <View key={tour.id} style={styles.tourCard}>
              <View style={styles.tourTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tourName}>{tour.title}</Text>
                  <Text style={styles.tourDate}>{tour.date} · {tour.durationH}h</Text>
                </View>
                <View style={[styles.capacityBadge, isFull && styles.capacityFull]}>
                  <Text style={[styles.capacityText, isFull && styles.capacityFullText]}>
                    {isFull ? 'Full' : `${tour.maxGuests - tour.guests} spots`}
                  </Text>
                </View>
              </View>
              <View style={styles.tourBottom}>
                <Text style={styles.tourGuests}>{tour.guests}/{tour.maxGuests} guests</Text>
                <Text style={styles.tourPrice}>{tour.priceDZD.toLocaleString()} DZD/pp</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* ── QUICK ACTIONS ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
      </View>

      <View style={styles.actionsGrid}>
        <Pressable style={styles.actionCard} onPress={() => navigateTo('/(business)/listings/new')}>
          <Ionicons name="add-circle-outline" size={24} color={RIHLA.primary} />
          <Text style={styles.actionText}>New Tour</Text>
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

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#E2E8F0', gap: 8,
  },
  iconContainer: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.dark },
  statLabel: { fontSize: 10, fontFamily: 'mon', color: RIHLA.mutedText },

  tagSection: { gap: 10 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  tag: { backgroundColor: RIHLA.accent + '12', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  tagText: { fontSize: 11, fontFamily: 'mon-sb', color: RIHLA.accent },
  certTag: { backgroundColor: RIHLA.highlight + '12' },
  certTagText: { color: RIHLA.highlight },

  sectionHeader: { gap: 2, marginTop: 4 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.dark },
  sectionSubtitle: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText },
  seeAll: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.accent },

  tourList: { gap: 10 },
  tourCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0',
    padding: 16, gap: 10,
  },
  tourTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tourName: { fontSize: 14, fontFamily: 'mon-sb', color: RIHLA.dark },
  tourDate: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 2 },
  capacityBadge: { backgroundColor: '#E6FAF7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  capacityText: { fontSize: 11, fontFamily: 'mon-sb', color: RIHLA.primary },
  capacityFull: { backgroundColor: '#FEE2E2' },
  capacityFullText: { color: '#EF4444' },
  tourBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tourGuests: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText },
  tourPrice: { fontSize: 13, fontFamily: 'mon-b', color: RIHLA.dark },

  actionsGrid: { flexDirection: 'row', gap: 10 },
  actionCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1,
    borderColor: '#E2E8F0', paddingVertical: 14, alignItems: 'center', gap: 8,
  },
  actionText: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.dark },
});
