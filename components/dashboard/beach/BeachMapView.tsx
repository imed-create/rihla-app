/**
 * RIHLA — Beach Map View (Business Dashboard)
 * ────────────────────────────────────────────
 * Interactive beach zone map showing asset locations per zone.
 * Business owner sees exactly where each umbrella, cabana, parking, etc. is.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';

// ── Zone definitions (realistic beach layout) ─────────────────
const ZONES = [
  {
    id: 'vip',
    label: 'VIP Zone',
    description: 'Premium front-row · Cushioned sunbeds · Bottle service',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    icon: 'diamond-outline',
    spots: [
      { id: 'V1', type: 'cabana', label: 'Cabana V1', price: 5000, available: true },
      { id: 'V2', type: 'cabana', label: 'Cabana V2', price: 5000, available: false },
      { id: 'V3', type: 'umbrella', label: 'VIP Bed V3', price: 3500, available: true },
      { id: 'V4', type: 'umbrella', label: 'VIP Bed V4', price: 3500, available: true },
      { id: 'V5', type: 'table', label: 'VIP Table V5', price: 4000, available: false },
      { id: 'V6', type: 'parking', label: 'VIP Parking', price: 2000, available: true },
    ],
  },
  {
    id: 'family',
    label: 'Family Zone',
    description: 'Mid-row · Shaded areas · Kids play area nearby',
    color: '#00a896',
    bgColor: '#F0FDFA',
    icon: 'people-outline',
    spots: [
      { id: 'F1', type: 'umbrella', label: 'Umbrella F1', price: 1500, available: true },
      { id: 'F2', type: 'umbrella', label: 'Umbrella F2', price: 1500, available: true },
      { id: 'F3', type: 'umbrella', label: 'Umbrella F3', price: 1500, available: false },
      { id: 'F4', type: 'umbrella', label: 'Umbrella F4', price: 1500, available: true },
      { id: 'F5', type: 'table', label: 'Family Table F5', price: 2000, available: true },
      { id: 'F6', type: 'table', label: 'Family Table F6', price: 2000, available: false },
      { id: 'F7', type: 'cabana', label: 'Family Cabana F7', price: 3000, available: true },
      { id: 'F8', type: 'cabana', label: 'Family Cabana F8', price: 3000, available: true },
    ],
  },
  {
    id: 'free',
    label: 'Free Zone',
    description: 'Back-row · Self-service · Lower prices',
    color: '#94A3B8',
    bgColor: '#F8FAFC',
    icon: 'leaf-outline',
    spots: [
      { id: 'C1', type: 'umbrella', label: 'Umbrella C1', price: 800, available: true },
      { id: 'C2', type: 'umbrella', label: 'Umbrella C2', price: 800, available: false },
      { id: 'C3', type: 'umbrella', label: 'Umbrella C3', price: 800, available: true },
      { id: 'C4', type: 'parking', label: 'Parking C4', price: 500, available: true },
      { id: 'C5', type: 'parking', label: 'Parking C5', price: 500, available: true },
    ],
  },
];

const TYPE_ICONS: Record<string, string> = {
  umbrella: 'umbrella-outline',
  cabana: 'home-outline',
  table: 'tablet-landscape-outline',
  parking: 'car-outline',
};

const TYPE_LABELS: Record<string, string> = {
  umbrella: 'Umbrella',
  cabana: 'Cabana',
  table: 'Table',
  parking: 'Parking',
};

export default function BeachMapView() {
  const [selectedZone, setSelectedZone] = useState<string>('vip');
  const [selectedSpot, setSelectedSpot] = useState<typeof ZONES[0]['spots'][0] | null>(null);
  const zone = ZONES.find(z => z.id === selectedZone)!;

  const availableCount = zone.spots.filter(s => s.available).length;
  const occupiedCount = zone.spots.filter(s => !s.available).length;
  const zoneRevenue = zone.spots.reduce((sum, s) => sum + s.price, 0);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* ── ZONE TABS ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.zoneTabRow}>
        {ZONES.map(z => (
          <TouchableOpacity
            key={z.id}
            style={[styles.zoneTab, selectedZone === z.id && { backgroundColor: z.color, borderColor: z.color }]}
            onPress={() => { Haptics.selectionAsync(); setSelectedZone(z.id); setSelectedSpot(null); }}
          >
            <View style={[styles.zoneTabDot, { backgroundColor: selectedZone === z.id ? '#fff' : z.color }]} />
            <Text style={[styles.zoneTabText, { color: selectedZone === z.id ? '#fff' : z.color }]}>
              {z.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── ZONE HEADER ── */}
      <View style={[styles.zoneHeader, { backgroundColor: zone.bgColor, borderColor: zone.color + '30' }]}>
        <View style={{ flex: 1 }}>
          <View style={styles.zoneHeaderTop}>
            <View style={[styles.zoneBadge, { backgroundColor: zone.color + '20' }]}>
              <Ionicons name={zone.icon as any} size={14} color={zone.color} />
              <Text style={[styles.zoneBadgeText, { color: zone.color }]}>{zone.label}</Text>
            </View>
          </View>
          <Text style={styles.zoneDesc}>{zone.description}</Text>
        </View>
        <View style={styles.zoneQuickStats}>
          <View style={styles.quickStat}>
            <Text style={[styles.quickStatVal, { color: '#10B981' }]}>{availableCount}</Text>
            <Text style={styles.quickStatLbl}>Free</Text>
          </View>
          <View style={styles.quickStatDiv} />
          <View style={styles.quickStat}>
            <Text style={[styles.quickStatVal, { color: '#EF4444' }]}>{occupiedCount}</Text>
            <Text style={styles.quickStatLbl}>Taken</Text>
          </View>
          <View style={styles.quickStatDiv} />
          <View style={styles.quickStat}>
            <Text style={[styles.quickStatVal, { color: zone.color }]}>{zoneRevenue.toLocaleString()}</Text>
            <Text style={styles.quickStatLbl}>DZD</Text>
          </View>
        </View>
      </View>

      {/* ── BEACH MAP CANVAS ── */}
      <View style={[styles.mapCanvas, { borderColor: zone.color + '40' }]}>
        {/* Water area */}
        <View style={styles.waterArea}>
          <View style={styles.waterWaveRow}>
            {['🌊', '🏄', '🌊', '🌊', '🏊', '🌊', '⛵', '🌊', '🏄', '🌊'].map((e, i) => (
              <Text key={i} style={styles.waveEmoji}>{e}</Text>
            ))}
          </View>
          <Text style={styles.waterLabel}>Mediterranean Sea</Text>
        </View>

        {/* Shoreline */}
        <View style={styles.shoreline}>
          <Text style={styles.shorelineText}>🏖️ {zone.label} Beachfront</Text>
        </View>

        {/* Asset grid on the sand */}
        <View style={styles.sandArea}>
          <View style={styles.assetLegend}>
            {Object.entries(TYPE_ICONS).map(([type, icon]) => (
              <View key={type} style={styles.legendItem}>
                <Ionicons name={icon as any} size={12} color={RIHLA.mutedText} />
                <Text style={styles.legendText}>{TYPE_LABELS[type]}</Text>
              </View>
            ))}
          </View>

          <View style={styles.assetGrid}>
            {zone.spots.map(spot => (
              <TouchableOpacity
                key={spot.id}
                style={[
                  styles.assetPin,
                  {
                    borderColor: spot.available ? '#10B981' : '#EF4444',
                    backgroundColor: spot.available ? '#F0FDF4' : '#FEF2F2',
                  },
                  selectedSpot?.id === spot.id && { borderColor: zone.color, backgroundColor: zone.bgColor },
                ]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedSpot(spot); }}
              >
                <Ionicons
                  name={TYPE_ICONS[spot.type] as any || 'grid-outline'}
                  size={18}
                  color={spot.available ? '#10B981' : '#EF4444'}
                />
                <Text style={[styles.assetPinLabel, { color: spot.available ? '#10B981' : '#EF4444' }]}>
                  {spot.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Zone divider labels */}
          {selectedZone === 'family' && (
            <View style={styles.zoneDivider}>
              <Text style={styles.zoneDividerText}>← VIP Zone | Family Zone →</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── SELECTED SPOT DETAIL ── */}
      {selectedSpot && (
        <View style={[styles.spotDetail, { borderColor: zone.color + '30', backgroundColor: zone.bgColor }]}>
          <View style={styles.spotDetailTop}>
            <View style={[styles.spotDetailIcon, { backgroundColor: zone.color + '20' }]}>
              <Ionicons name={TYPE_ICONS[selectedSpot.type] as any} size={22} color={zone.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.spotDetailName}>{selectedSpot.label}</Text>
              <Text style={styles.spotDetailType}>
                {TYPE_LABELS[selectedSpot.type] || selectedSpot.type} · {zone.label}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.spotDetailPrice}>{selectedSpot.price.toLocaleString()} DZD</Text>
              <View style={[styles.spotDetailStatus, { backgroundColor: selectedSpot.available ? '#D1FAE5' : '#FEE2E2' }]}>
                <Text style={[styles.spotDetailStatusText, { color: selectedSpot.available ? '#059669' : '#DC2626' }]}>
                  {selectedSpot.available ? 'Available' : 'Occupied'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.spotDetailActions}>
            <TouchableOpacity style={[styles.spotAction, { backgroundColor: zone.color }]}>
              <Ionicons name="create-outline" size={14} color="#fff" />
              <Text style={styles.spotActionText}>Edit Spot</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.spotAction, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="camera-outline" size={14} color={RIHLA.dark} />
              <Text style={[styles.spotActionText, { color: RIHLA.dark }]}>Add Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── BEACH PHOTOS ── */}
      <View style={styles.photoSection}>
        <Text style={styles.sectionTitle}>📸 Beach Photos</Text>
        <Text style={styles.sectionSub}>Current images shown to travelers</Text>
        <View style={styles.photoGrid}>
          {[
            { uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400', label: 'Aerial View' },
            { uri: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=400', label: 'VIP Zone' },
            { uri: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=400', label: 'Family Area' },
            { uri: 'https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=400', label: 'Sunset View' },
            { uri: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=400', label: 'Beach Bar' },
            { uri: 'https://images.unsplash.com/photo-1578922746465-3a80a228f223?w=400', label: 'Parking' },
          ].map((photo, i) => (
            <View key={i} style={styles.photoCard}>
              <View style={[styles.photoPlaceholder, { backgroundColor: zone.color + '15' }]}>
                <Ionicons name="image-outline" size={24} color={zone.color} />
              </View>
              <Text style={styles.photoLabel}>{photo.label}</Text>
              <TouchableOpacity style={styles.photoAction}>
                <Ionicons name="trash-outline" size={12} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={[styles.photoAdd, { borderColor: zone.color + '40' }]}>
            <Ionicons name="add-circle-outline" size={28} color={zone.color} />
            <Text style={[styles.photoAddText, { color: zone.color }]}>Add Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── ZONE LEGEND ── */}
      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View style={[styles.legendBlock, { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' }]}>
            <View style={[styles.legendBlockDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendBlockText}>Available</Text>
          </View>
          <View style={[styles.legendBlock, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
            <View style={[styles.legendBlockDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendBlockText}>Occupied</Text>
          </View>
          <View style={[styles.legendBlock, { backgroundColor: zone.bgColor, borderColor: zone.color + '40' }]}>
            <View style={[styles.legendBlockDot, { backgroundColor: zone.color }]} />
            <Text style={styles.legendBlockText}>Selected</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14, paddingBottom: 24 },

  // Zone tabs
  zoneTabRow: { gap: 8, paddingRight: 8 },
  zoneTab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999,
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  zoneTabDot: { width: 8, height: 8, borderRadius: 4 },
  zoneTabText: { fontSize: 13, fontFamily: 'mon-sb' },

  // Zone header
  zoneHeader: {
    borderRadius: 16, borderWidth: 1, padding: 16, gap: 12,
  },
  zoneHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  zoneBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  zoneBadgeText: { fontSize: 12, fontFamily: 'mon-b' },
  zoneDesc: { fontSize: 13, fontFamily: 'mon', color: '#6B7280', lineHeight: 18 },
  zoneQuickStats: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 10 },
  quickStat: { flex: 1, alignItems: 'center', gap: 1 },
  quickStatVal: { fontSize: 16, fontFamily: 'mon-b' },
  quickStatLbl: { fontSize: 9, fontFamily: 'mon', color: '#6B7280' },
  quickStatDiv: { width: 1, height: 24, backgroundColor: '#E5E7EB' },

  // Map canvas
  mapCanvas: { borderRadius: 20, borderWidth: 2, overflow: 'hidden' },
  waterArea: { backgroundColor: '#DBEAFE', paddingVertical: 10, alignItems: 'center', gap: 4 },
  waterWaveRow: { flexDirection: 'row', gap: 6 },
  waveEmoji: { fontSize: 14 },
  waterLabel: { fontSize: 10, fontFamily: 'mon-sb', color: '#1E40AF' },
  shoreline: { backgroundColor: '#FEF3C7', paddingVertical: 6, paddingHorizontal: 16 },
  shorelineText: { fontSize: 11, fontFamily: 'mon-sb', color: '#92400E', textAlign: 'center' },

  // Sand area
  sandArea: { backgroundColor: '#FFFBEB', padding: 16, gap: 12 },
  assetLegend: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendText: { fontSize: 9, fontFamily: 'mon', color: '#6B7280' },
  assetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  assetPin: {
    width: '28%', borderRadius: 12, borderWidth: 1.5, padding: 10,
    alignItems: 'center', gap: 4,
  },
  assetPinLabel: { fontSize: 9, fontFamily: 'mon-b', textAlign: 'center' },
  zoneDivider: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 8, marginTop: 8, alignItems: 'center' },
  zoneDividerText: { fontSize: 9, fontFamily: 'mon', color: '#9CA3AF' },

  // Spot detail
  spotDetail: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  spotDetailTop: { flexDirection: 'row', gap: 12 },
  spotDetailIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  spotDetailName: { fontSize: 15, fontFamily: 'mon-b', color: RIHLA.dark },
  spotDetailType: { fontSize: 12, fontFamily: 'mon', color: '#6B7280', marginTop: 2 },
  spotDetailPrice: { fontSize: 15, fontFamily: 'mon-b', color: RIHLA.primary },
  spotDetailStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
  spotDetailStatusText: { fontSize: 9, fontFamily: 'mon-b' },
  spotDetailActions: { flexDirection: 'row', gap: 8 },
  spotAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12 },
  spotActionText: { fontSize: 12, fontFamily: 'mon-sb', color: '#fff' },

  // Photos
  photoSection: { gap: 8 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.dark },
  sectionSub: { fontSize: 12, fontFamily: 'mon', color: '#6B7280', marginTop: -6 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoCard: {
    width: '30%', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1,
    borderColor: '#E5E7EB', padding: 10, alignItems: 'center', gap: 6,
  },
  photoPlaceholder: { width: '100%', height: 60, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  photoLabel: { fontSize: 9, fontFamily: 'mon-sb', color: RIHLA.dark },
  photoAction: { position: 'absolute', top: 4, right: 4 },
  photoAdd: {
    width: '30%', borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed',
    padding: 10, alignItems: 'center', justifyContent: 'center', gap: 4, aspectRatio: 1,
  },
  photoAddText: { fontSize: 9, fontFamily: 'mon-b' },

  // Legend
  legend: {},
  legendRow: { flexDirection: 'row', gap: 8 },
  legendBlock: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, borderRadius: 10, borderWidth: 1 },
  legendBlockDot: { width: 8, height: 8, borderRadius: 4 },
  legendBlockText: { fontSize: 9, fontFamily: 'mon-sb', color: '#374151' },
});
