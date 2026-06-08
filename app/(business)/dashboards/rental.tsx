/**
 * RIHLA — Rental Business Dashboard
 * ─────────────────────────────────
 * Asset tracking, availability calendar, upcoming handovers.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SAHEL } from '@/constants/theme';

const UPCOMING_HANDOVERS = [
  { id: 'h1', asset: 'Yamaha WaveRunner', type: 'pick-up', date: 'Today 10:00', client: 'Ahmed B.', status: 'pending' },
  { id: 'h2', asset: 'Desert Quad 4x4', type: 'return', date: 'Today 16:30', client: 'Sara L.', status: 'upcoming' },
  { id: 'h3', asset: 'Camping Tent Pro', type: 'pick-up', date: 'Tomorrow 08:00', client: 'Nassim T.', status: 'upcoming' },
];

const ASSETS = [
  { id: 'a1', name: 'Yamaha WaveRunner', category: 'Jet Ski', status: 'rented', nextAvailable: 'Today 18:00' },
  { id: 'a2', name: 'Desert Quad 4x4', category: 'ATV', status: 'rented', nextAvailable: 'Today 16:30' },
  { id: 'a3', name: 'SeaDoo Spark', category: 'Jet Ski', status: 'available', nextAvailable: 'Now' },
  { id: 'a4', name: 'Camping Tent Pro', category: 'Camping', status: 'maintenance', nextAvailable: 'Jun 15' },
];

export default function RentalDashboard() {
  const rentedAssets = ASSETS.filter((a) => a.status === 'rented').length;
  const availableAssets = ASSETS.filter((a) => a.status === 'available').length;
  const pendingHandovers = UPCOMING_HANDOVERS.filter((h) => h.status === 'pending').length;

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
            <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
          </View>
          <Text style={styles.statValue}>{availableAssets}</Text>
          <Text style={styles.statLabel}>Available Now</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: SAHEL.highlight + '15' }]}>
            <Ionicons name="swap-horizontal-outline" size={20} color={SAHEL.highlight} />
          </View>
          <Text style={styles.statValue}>{rentedAssets}</Text>
          <Text style={styles.statLabel}>Currently Rented</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: SAHEL.primary + '15' }]}>
            <Ionicons name="calendar-outline" size={20} color={SAHEL.primary} />
          </View>
          <Text style={styles.statValue}>{pendingHandovers}</Text>
          <Text style={styles.statLabel}>Pending Handovers</Text>
        </View>
      </View>

      {/* ── UPCOMING HANDOVERS ── */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>Today's Handovers</Text>
          <Text style={styles.sectionSubtitle}>Pick-ups & Returns</Text>
        </View>
        <Pressable onPress={() => navigateTo('/(business)/bookings')}>
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      </View>

      <View style={styles.handoverList}>
        {UPCOMING_HANDOVERS.map((handover) => (
          <View key={handover.id} style={styles.handoverCard}>
            <View style={[styles.handoverIcon, { backgroundColor: handover.type === 'pick-up' ? '#EEF2FF' : '#FEF3C7' }]}>
              <Ionicons name={handover.type === 'pick-up' ? 'arrow-up-outline' : 'arrow-down-outline'} size={20} color={handover.type === 'pick-up' ? '#6366F1' : '#F59E0B'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.handoverAsset}>{handover.asset}</Text>
              <Text style={styles.handoverClient}>{handover.date} · {handover.client}</Text>
            </View>
            <View style={[styles.statusBadge, handover.status === 'pending' && styles.statusPending]}>
              <Text style={[styles.statusText, handover.status === 'pending' && styles.statusTextPending]}>
                {handover.type.toUpperCase()}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── ASSET INVENTORY ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Asset Inventory</Text>
        <Text style={styles.sectionSubtitle}>Real-time availability</Text>
      </View>

      <View style={styles.assetList}>
        {ASSETS.map((asset) => (
          <View key={asset.id} style={styles.assetCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.assetName}>{asset.name}</Text>
              <Text style={styles.assetMeta}>{asset.category} · Next: {asset.nextAvailable}</Text>
            </View>
            <View style={[
              styles.assetStatus,
              asset.status === 'available' ? styles.assetAvailable :
              asset.status === 'rented' ? styles.assetRented : styles.assetMaintenance
            ]}>
              <Text style={[
                styles.assetStatusText,
                asset.status === 'available' ? styles.assetAvailableText :
                asset.status === 'rented' ? styles.assetRentedText : styles.assetMaintenanceText
              ]}>
                {asset.status.toUpperCase()}
              </Text>
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
          <Text style={styles.actionText}>Add Asset</Text>
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

  handoverList: { gap: 10 },
  handoverCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  handoverIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  handoverAsset: { fontSize: 14, fontFamily: 'mon-sb', color: SAHEL.dark },
  handoverClient: { fontSize: 12, fontFamily: 'mon', color: SAHEL.mutedText },
  statusBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontFamily: 'mon-b', color: '#64748B' },
  statusPending: { backgroundColor: '#E6FAF7' },
  statusTextPending: { color: SAHEL.primary },

  assetList: { gap: 8 },
  assetCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  assetName: { fontSize: 14, fontFamily: 'mon-sb', color: SAHEL.dark },
  assetMeta: { fontSize: 11, fontFamily: 'mon', color: SAHEL.mutedText, marginTop: 2 },
  assetStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  assetStatusText: { fontSize: 10, fontFamily: 'mon-b' },
  assetAvailable: { backgroundColor: '#D1FAE5' },
  assetAvailableText: { color: '#059669' },
  assetRented: { backgroundColor: '#FEF3C7' },
  assetRentedText: { color: '#B45309' },
  assetMaintenance: { backgroundColor: '#FEE2E2' },
  assetMaintenanceText: { color: '#EF4444' },

  actionsGrid: { flexDirection: 'row', gap: 10 },
  actionCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1,
    borderColor: '#E2E8F0', paddingVertical: 14, alignItems: 'center', gap: 8,
  },
  actionText: { fontSize: 12, fontFamily: 'mon-sb', color: SAHEL.dark },
});
