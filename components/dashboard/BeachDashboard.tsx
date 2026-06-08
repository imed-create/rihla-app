/**
 * RIHLA — Beach Business Dashboard
 * ─────────────────────────────────
 * Rich tabbed dashboard: Overview · Map View · Spots · Gallery
 * Each tab gives the beach owner real management tools.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import BeachMapView from './beach/BeachMapView';
import BeachGallery from './beach/BeachGallery';

const BEACH_COLOR = '#00a896';

const TABS = [
  { key: 'overview', label: 'Overview', icon: 'grid-outline' },
  { key: 'map', label: 'Map View', icon: 'map-outline' },
  { key: 'spots', label: 'Spots', icon: 'umbrella-outline' },
  { key: 'gallery', label: 'Gallery', icon: 'images-outline' },
] as const;

export default function BeachDashboard() {
  const [tab, setTab] = useState<string>('overview');
  const { assets, getMyAssets } = useBusinessAssets();
  const spots = getMyAssets('beach', 'spot');

  const totalAssets = spots.length;
  const available = spots.filter(s => s.available).length;
  const totalValue = spots.reduce((s, a) => s + a.priceDZD, 0);
  const zones = [...new Set(spots.map(s => s.fields.zone as string))];

  return (
    <View style={styles.root}>
      {/* ── KPI STRIP ── */}
      {tab === 'overview' && (
        <View style={styles.kpiRow}>
          <View style={[styles.kpi, { backgroundColor: '#F0FDFA' }]}>
            <Text style={[styles.kpiVal, { color: BEACH_COLOR }]}>{totalAssets}</Text>
            <Text style={styles.kpiLbl}>Total Assets</Text>
          </View>
          <View style={[styles.kpi, { backgroundColor: '#F0FDF4' }]}>
            <Text style={[styles.kpiVal, { color: '#10B981' }]}>{available}</Text>
            <Text style={styles.kpiLbl}>Available</Text>
          </View>
          <View style={[styles.kpi, { backgroundColor: '#FEF2F2' }]}>
            <Text style={[styles.kpiVal, { color: '#EF4444' }]}>{totalAssets - available}</Text>
            <Text style={styles.kpiLbl}>Occupied</Text>
          </View>
          <View style={[styles.kpi, { backgroundColor: '#FFFBEB' }]}>
            <Text style={[styles.kpiVal, { color: '#F59E0B' }]}>{zones.length}</Text>
            <Text style={styles.kpiLbl}>Zones</Text>
          </View>
        </View>
      )}

      {/* ── INNER TAB BAR ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabContent}>
        {TABS.map(t => (
          <Pressable
            key={t.key}
            style={[styles.tabPill, tab === t.key && { backgroundColor: BEACH_COLOR }]}
            onPress={() => { Haptics.selectionAsync(); setTab(t.key); }}
          >
            <Ionicons
              name={t.icon as any}
              size={14}
              color={tab === t.key ? '#fff' : BEACH_COLOR}
            />
            <Text style={[styles.tabPillText, tab === t.key && { color: '#fff' }]}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* ── TAB CONTENT ── */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'overview' && (
          <View style={styles.overviewContent}>
            {/* Revenue card */}
            <View style={styles.revenueCard}>
              <View style={styles.revenueTop}>
                <Ionicons name="cash-outline" size={20} color={BEACH_COLOR} />
                <Text style={styles.revenueTitle}>Today's Revenue</Text>
              </View>
              <Text style={styles.revenueValue}>{totalValue.toLocaleString()} DZD</Text>
              <View style={styles.revenueMeta}>
                <View style={styles.revenuePill}>
                  <Ionicons name="trending-up-outline" size={12} color="#10B981" />
                  <Text style={styles.revenuePillText}>+8% vs yesterday</Text>
                </View>
                <Text style={styles.revenueNote}>From {totalAssets - available} occupied spots</Text>
              </View>
            </View>

            {/* Zone overview cards */}
            <Text style={styles.sectionTitle}>Zone Overview</Text>
            <View style={styles.zoneGrid}>
              {[
                { id: 'vip', label: 'VIP Zone', color: '#F59E0B', bg: '#FFFBEB', icon: 'diamond-outline', spots: 12, available: 5, price: 3500 },
                { id: 'family', label: 'Family Zone', color: BEACH_COLOR, bg: '#F0FDFA', icon: 'people-outline', spots: 24, available: 14, price: 1500 },
                { id: 'free', label: 'Free Zone', color: '#94A3B8', bg: '#F8FAFC', icon: 'leaf-outline', spots: 18, available: 10, price: 800 },
              ].map(z => (
                <View key={z.id} style={[styles.zoneCard, { backgroundColor: z.bg, borderColor: z.color + '30' }]}>
                  <View style={styles.zoneCardTop}>
                    <View style={[styles.zoneCardIcon, { backgroundColor: z.color + '20' }]}>
                      <Ionicons name={z.icon as any} size={18} color={z.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.zoneCardLabel}>{z.label}</Text>
                      <Text style={styles.zoneCardSub}>{z.spots} spots · {z.available} free</Text>
                    </View>
                    <View style={styles.zoneCardPrice}>
                      <Text style={[styles.zoneCardPriceVal, { color: z.color }]}>{z.price.toLocaleString()}</Text>
                      <Text style={styles.zoneCardPriceUnit}>DZD</Text>
                    </View>
                  </View>
                  {/* Occupancy bar */}
                  <View style={styles.occBar}>
                    <View style={[styles.occFill, { width: `${((z.spots - z.available) / z.spots) * 100}%`, backgroundColor: z.color }]} />
                  </View>
                  <View style={styles.zoneCardStats}>
                    <Text style={styles.zoneCardStat}>{Math.round(((z.spots - z.available) / z.spots) * 100)}% occupied</Text>
                    <Text style={styles.zoneCardStat}>{(z.spots - z.available) * z.price} DZD</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Quick actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsRow}>
              <Pressable style={styles.actionBtn}>
                <Ionicons name="add-circle-outline" size={20} color={BEACH_COLOR} />
                <Text style={styles.actionBtnText}>Add Spot</Text>
              </Pressable>
              <Pressable style={styles.actionBtn}>
                <Ionicons name="camera-outline" size={20} color={BEACH_COLOR} />
                <Text style={styles.actionBtnText}>Upload Photo</Text>
              </Pressable>
              <Pressable style={styles.actionBtn}>
                <Ionicons name="stats-chart-outline" size={20} color={BEACH_COLOR} />
                <Text style={styles.actionBtnText}>Analytics</Text>
              </Pressable>
            </View>
          </View>
        )}

        {tab === 'map' && <BeachMapView />}
        {tab === 'spots' && <BeachSpotsList />}
        {tab === 'gallery' && <BeachGallery />}
      </ScrollView>
    </View>
  );
}

// ── Inline Spots list for the "Spots" tab ──
function BeachSpotsList() {
  const { assets, getMyAssets, toggleAvailable } = useBusinessAssets();
  const spots = getMyAssets('beach', 'spot');

  if (spots.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Ionicons name="umbrella-outline" size={48} color="#94A3B8" />
        <Text style={styles.emptyTitle}>No spots added yet</Text>
        <Text style={styles.emptySub}>Add umbrellas, cabanas, tables for your beach.</Text>
      </View>
    );
  }

  const ZONE_COLORS: Record<string, string> = { family: BEACH_COLOR, vip: '#F59E0B', free: '#94A3B8' };
  const TYPE_ICONS: Record<string, string> = { umbrella: 'umbrella-outline', table: 'tablet-landscape-outline', cabana: 'home-outline', parking: 'car-outline', 'vip-bed': 'bed-outline' };

  return (
    <View style={styles.spotListContent}>
      {spots.map(spot => (
        <View key={spot.id} style={styles.spotCard}>
          <View style={styles.spotHeader}>
            <View style={[styles.spotIcon, { backgroundColor: (ZONE_COLORS[spot.fields.zone] || '#94A3B8') + '15' }]}>
              <Ionicons name={(TYPE_ICONS[spot.fields.assetType] || 'grid-outline') as any} size={20} color={ZONE_COLORS[spot.fields.zone] || '#94A3B8'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.spotName}>{spot.name}</Text>
              <Text style={styles.spotType}>{spot.fields.assetType?.replace('-', ' ')} · {spot.fields.zone} zone</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.spotPrice}>{spot.priceDZD.toLocaleString()} DZD</Text>
              <Pressable style={[styles.spotStatusDot, { backgroundColor: spot.available ? '#10B981' : '#EF4444' }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleAvailable(spot.id); }} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 0 },

  // KPI
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  kpi: { flex: 1, borderRadius: 14, padding: 10, alignItems: 'center', gap: 2 },
  kpiVal: { fontSize: 20, fontFamily: 'mon-b' },
  kpiLbl: { fontSize: 9, fontFamily: 'mon-sb', color: '#6B7280' },

  // Tab bar
  tabBar: { marginBottom: 16 },
  tabContent: { gap: 8, paddingRight: 8 },
  tabPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabPillText: { fontSize: 13, fontFamily: 'mon-sb', color: '#6B7280' },

  content: { gap: 16, paddingBottom: 32 },

  // Overview
  overviewContent: { gap: 16 },
  revenueCard: {
    backgroundColor: '#F0FDFA', borderRadius: 20, padding: 20, gap: 6,
    borderWidth: 1, borderColor: BEACH_COLOR + '30',
  },
  revenueTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  revenueTitle: { fontSize: 14, fontFamily: 'mon-sb', color: '#0F172A' },
  revenueValue: { fontSize: 32, fontFamily: 'mon-b', color: BEACH_COLOR },
  revenueMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  revenuePill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: '#D1FAE5' },
  revenuePillText: { fontSize: 11, fontFamily: 'mon-sb', color: '#059669' },
  revenueNote: { fontSize: 11, fontFamily: 'mon', color: '#6B7280' },

  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A' },

  // Zone cards
  zoneGrid: { gap: 10 },
  zoneCard: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 8 },
  zoneCardTop: { flexDirection: 'row', gap: 10 },
  zoneCardIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  zoneCardLabel: { fontSize: 14, fontFamily: 'mon-b', color: '#0F172A' },
  zoneCardSub: { fontSize: 11, fontFamily: 'mon', color: '#6B7280', marginTop: 2 },
  zoneCardPrice: { alignItems: 'flex-end' },
  zoneCardPriceVal: { fontSize: 16, fontFamily: 'mon-b' },
  zoneCardPriceUnit: { fontSize: 9, fontFamily: 'mon', color: '#6B7280' },
  occBar: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
  occFill: { height: '100%', borderRadius: 3 },
  zoneCardStats: { flexDirection: 'row', justifyContent: 'space-between' },
  zoneCardStat: { fontSize: 10, fontFamily: 'mon', color: '#6B7280' },

  // Quick actions
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14,
    alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#E5E7EB',
  },
  actionBtnText: { fontSize: 10, fontFamily: 'mon-sb', color: '#0F172A' },

  // Empty
  emptyBox: { alignItems: 'center', gap: 10, paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A' },
  emptySub: { fontSize: 13, fontFamily: 'mon', color: '#6B7280', textAlign: 'center' },

  // Spot list
  spotListContent: { gap: 10 },
  spotCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14 },
  spotHeader: { flexDirection: 'row', gap: 12 },
  spotIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  spotName: { fontSize: 14, fontFamily: 'mon-b', color: '#0F172A' },
  spotType: { fontSize: 11, fontFamily: 'mon', color: '#6B7280', marginTop: 2, textTransform: 'capitalize' },
  spotPrice: { fontSize: 14, fontFamily: 'mon-b', color: BEACH_COLOR },
  spotStatusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
});
