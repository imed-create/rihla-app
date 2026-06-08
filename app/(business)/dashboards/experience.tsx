/**
 * RIHLA — Experience Business Dashboard
 * ─────────────────────────────────────
 * Multi-day itinerary tracking, group management, inclusions, and scheduling.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SAHEL } from '@/constants/theme';

const UPCOMING_EXPERIENCES = [
  { id: 'x1', title: 'Sahara Star Camp', type: '3 Days / 2 Nights', date: 'Tomorrow 09:00', groupSize: 12, maxGroup: 15, status: 'confirmed', priceDZD: 35000 },
  { id: 'x2', title: 'Culinary Tour of Casbah', type: 'Half-Day', date: 'Today 14:00', groupSize: 6, maxGroup: 8, status: 'active', priceDZD: 5000 },
  { id: 'x3', title: 'Djanet Trekking Expedition', type: '5 Days / 4 Nights', date: 'Jun 20, 08:00', groupSize: 8, maxGroup: 10, status: 'upcoming', priceDZD: 75000 },
];

const REQUIREMENTS = [
  { id: 'r1', label: 'Camping Gear Prep', status: 'done', exp: 'Sahara Star Camp' },
  { id: 'r2', label: 'Local Guide Coordination', status: 'pending', exp: 'Djanet Trekking Expedition' },
  { id: 'r3', label: 'Food & Beverage Supply', status: 'pending', exp: 'Culinary Tour of Casbah' },
];

export default function ExperienceDashboard() {
  const activeExp = UPCOMING_EXPERIENCES.filter((x) => x.status === 'active').length;
  const totalGuests = UPCOMING_EXPERIENCES.reduce((sum, x) => sum + x.groupSize, 0);
  const totalRevenue = UPCOMING_EXPERIENCES.reduce((sum, x) => sum + x.groupSize * x.priceDZD, 0);

  const navigateTo = (path: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(path as any);
  };

  return (
    <View style={styles.container}>
      {/* ── STATS ROW ── */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: '#10B981' + '15' }]}>
            <Ionicons name="sparkles-outline" size={20} color="#10B981" />
          </View>
          <Text style={styles.statValue}>{activeExp}</Text>
          <Text style={styles.statLabel}>Active Now</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: SAHEL.accent + '15' }]}>
            <Ionicons name="people-outline" size={20} color={SAHEL.accent} />
          </View>
          <Text style={styles.statValue}>{totalGuests}</Text>
          <Text style={styles.statLabel}>Total Guests</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: SAHEL.highlight + '15' }]}>
            <Ionicons name="wallet-outline" size={20} color={SAHEL.highlight} />
          </View>
          <Text style={styles.statValue}>{(totalRevenue / 1000).toFixed(0)}K</Text>
          <Text style={styles.statLabel}>Revenue (DZD)</Text>
        </View>
      </View>

      {/* ── UPCOMING EXPERIENCES ── */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>Experience Schedule</Text>
          <Text style={styles.sectionSubtitle}>Upcoming multi-day & day trips</Text>
        </View>
        <Pressable onPress={() => navigateTo('/(business)/bookings')}>
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      </View>

      <View style={styles.expList}>
        {UPCOMING_EXPERIENCES.map((exp) => (
          <View key={exp.id} style={styles.expCard}>
            <View style={styles.expTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.expTitle}>{exp.title}</Text>
                <Text style={styles.expType}>{exp.type} · {exp.date}</Text>
              </View>
              <View style={[styles.statusBadge, exp.status === 'active' && styles.statusActive]}>
                <Text style={[styles.statusText, exp.status === 'active' && styles.statusTextActive]}>
                  {exp.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.expBottom}>
              <View style={styles.groupInfo}>
                <Ionicons name="people" size={14} color={SAHEL.mutedText} />
                <Text style={styles.groupText}>{exp.groupSize}/{exp.maxGroup} joined</Text>
              </View>
              <Text style={styles.expPrice}>{exp.priceDZD.toLocaleString()} DZD</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── PREP & LOGISTICS ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Preparation & Logistics</Text>
        <Text style={styles.sectionSubtitle}>To-do list for upcoming trips</Text>
      </View>

      <View style={styles.reqList}>
        {REQUIREMENTS.map((req) => (
          <View key={req.id} style={styles.reqCard}>
            <Ionicons
              name={req.status === 'done' ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={req.status === 'done' ? '#10B981' : '#CBD5E1'}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.reqLabel, req.status === 'done' && styles.reqDone]}>{req.label}</Text>
              <Text style={styles.reqExp}>{req.exp}</Text>
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
          <Ionicons name="add-circle-outline" size={24} color={SAHEL.primary} />
          <Text style={styles.actionText}>New Experience</Text>
        </Pressable>

        <Pressable style={styles.actionCard} onPress={() => navigateTo('/(business)/analytics')}>
          <Ionicons name="stats-chart-outline" size={24} color={SAHEL.accent} />
          <Text style={styles.actionText}>Analytics</Text>
        </Pressable>

        <Pressable style={styles.actionCard} onPress={() => navigateTo('/(business)/reviews')}>
          <Ionicons name="star-outline" size={24} color={SAHEL.highlight} />
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
  statValue: { fontSize: 18, fontFamily: 'mon-b', color: SAHEL.dark },
  statLabel: { fontSize: 10, fontFamily: 'mon', color: SAHEL.mutedText },

  sectionHeader: { gap: 2, marginTop: 4 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: SAHEL.dark },
  sectionSubtitle: { fontSize: 12, fontFamily: 'mon', color: SAHEL.mutedText },
  seeAll: { fontSize: 12, fontFamily: 'mon-sb', color: SAHEL.accent },

  expList: { gap: 10 },
  expCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0',
    padding: 16, gap: 12,
  },
  expTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  expTitle: { fontSize: 15, fontFamily: 'mon-b', color: SAHEL.dark },
  expType: { fontSize: 12, fontFamily: 'mon', color: SAHEL.mutedText, marginTop: 2 },
  statusBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: 'mon-b', color: '#64748B' },
  statusActive: { backgroundColor: '#D1FAE5' },
  statusTextActive: { color: '#059669' },
  expBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
  groupInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  groupText: { fontSize: 12, fontFamily: 'mon-sb', color: SAHEL.mutedText },
  expPrice: { fontSize: 14, fontFamily: 'mon-b', color: SAHEL.dark },

  reqList: { gap: 8 },
  reqCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  reqLabel: { fontSize: 13, fontFamily: 'mon-sb', color: SAHEL.dark },
  reqDone: { color: '#94A3B8', textDecorationLine: 'line-through' },
  reqExp: { fontSize: 11, fontFamily: 'mon', color: SAHEL.mutedText, marginTop: 2 },

  actionsGrid: { flexDirection: 'row', gap: 10 },
  actionCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1,
    borderColor: '#E2E8F0', paddingVertical: 14, alignItems: 'center', gap: 8,
  },
  actionText: { fontSize: 12, fontFamily: 'mon-sb', color: SAHEL.dark },
});
