/**
 * RIHLA — Beach Satellite Map Screen
 * ------------------------------------
 * Full-screen satellite exploration of a real beach.
 * Shows actual coordinate-based assets on Google Maps satellite view.
 * Users can tap any umbrella/table/parking spot to view details and reserve.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RIHLA } from '@/constants/theme';
import BeachSatelliteMap, {
  type BeachAsset,
  type BeachZoneOverlay,
} from '@/components/beach/BeachSatelliteMap';
import { useTheme } from '@/context/ThemeContext';

// ─────────────────────────────────────────────
// MOCK DATA — Sidi Fredj Beach, Tipaza
// Real coordinates for the Mediterranean coast
// ─────────────────────────────────────────────

const BEACH_CENTER = { latitude: 36.7369, longitude: 2.8658 };

const MOCK_ASSETS: BeachAsset[] = [
  // VIP Zone (front row — closest to sea)
  { id: 'V-01', kind: 'umbrella', lat: 36.7372, lng: 2.8655, price_dzd: 2500, status: 'available', zone: 'vip', distance_to_sea_m: 8, label: 'V1' },
  { id: 'V-02', kind: 'umbrella', lat: 36.7372, lng: 2.8657, price_dzd: 2500, status: 'reserved', zone: 'vip', distance_to_sea_m: 8, label: 'V2' },
  { id: 'V-03', kind: 'umbrella', lat: 36.7372, lng: 2.8659, price_dzd: 2500, status: 'available', zone: 'vip', distance_to_sea_m: 9, label: 'V3' },
  { id: 'V-04', kind: 'table', lat: 36.7371, lng: 2.8655, price_dzd: 3000, status: 'available', zone: 'vip', distance_to_sea_m: 12, label: 'T1' },
  { id: 'V-05', kind: 'table', lat: 36.7371, lng: 2.8659, price_dzd: 3000, status: 'occupied', zone: 'vip', distance_to_sea_m: 12, label: 'T2' },

  // Family Zone (middle rows)
  { id: 'F-01', kind: 'umbrella', lat: 36.7370, lng: 2.8653, price_dzd: 1500, status: 'available', zone: 'family', distance_to_sea_m: 25, label: 'F1' },
  { id: 'F-02', kind: 'umbrella', lat: 36.7370, lng: 2.8655, price_dzd: 1500, status: 'available', zone: 'family', distance_to_sea_m: 25, label: 'F2' },
  { id: 'F-03', kind: 'umbrella', lat: 36.7370, lng: 2.8657, price_dzd: 1500, status: 'occupied', zone: 'family', distance_to_sea_m: 26, label: 'F3' },
  { id: 'F-04', kind: 'umbrella', lat: 36.7370, lng: 2.8659, price_dzd: 1500, status: 'available', zone: 'family', distance_to_sea_m: 26, label: 'F4' },
  { id: 'F-05', kind: 'umbrella', lat: 36.7369, lng: 2.8653, price_dzd: 1500, status: 'available', zone: 'family', distance_to_sea_m: 30, label: 'F5' },
  { id: 'F-06', kind: 'umbrella', lat: 36.7369, lng: 2.8655, price_dzd: 1500, status: 'reserved', zone: 'family', distance_to_sea_m: 30, label: 'F6' },
  { id: 'F-07', kind: 'chair', lat: 36.7369, lng: 2.8657, price_dzd: 800, status: 'available', zone: 'family', distance_to_sea_m: 30, label: 'C1' },
  { id: 'F-08', kind: 'chair', lat: 36.7369, lng: 2.8659, price_dzd: 800, status: 'available', zone: 'family', distance_to_sea_m: 31, label: 'C2' },

  // Free Zone (back rows)
  { id: 'G-01', kind: 'umbrella', lat: 36.7368, lng: 2.8653, price_dzd: 0, status: 'available', zone: 'free', distance_to_sea_m: 45, label: 'G1' },
  { id: 'G-02', kind: 'umbrella', lat: 36.7368, lng: 2.8655, price_dzd: 0, status: 'occupied', zone: 'free', distance_to_sea_m: 45, label: 'G2' },
  { id: 'G-03', kind: 'umbrella', lat: 36.7368, lng: 2.8657, price_dzd: 0, status: 'available', zone: 'free', distance_to_sea_m: 46, label: 'G3' },
  { id: 'G-04', kind: 'chair', lat: 36.7367, lng: 2.8653, price_dzd: 0, status: 'available', zone: 'free', distance_to_sea_m: 55, label: 'G4' },

  // Facilities
  { id: 'PARK-1', kind: 'parking', lat: 36.7366, lng: 2.8652, price_dzd: 500, status: 'available', zone: 'free', distance_to_sea_m: 120, label: '🅿️ P1' },
  { id: 'PARK-2', kind: 'parking', lat: 36.7366, lng: 2.8658, price_dzd: 500, status: 'available', zone: 'free', distance_to_sea_m: 125, label: '🅿️ P2' },
  { id: 'SH-1', kind: 'shower', lat: 36.7367, lng: 2.8656, price_dzd: 0, status: 'available', zone: 'free', distance_to_sea_m: 50, label: '🚿' },
  { id: 'PB-1', kind: 'powerbank', lat: 36.7367, lng: 2.8654, price_dzd: 300, status: 'available', zone: 'free', distance_to_sea_m: 48, label: '🔋' },
];

const ZONE_OVERLAYS: BeachZoneOverlay[] = [
  {
    id: 'vip-zone',
    zone: 'vip',
    coordinates: [
      { latitude: 36.7373, longitude: 2.8653 },
      { latitude: 36.7373, longitude: 2.8660 },
      { latitude: 36.7371, longitude: 2.8660 },
      { latitude: 36.7371, longitude: 2.8653 },
    ],
    label: 'VIP Zone',
  },
  {
    id: 'family-zone',
    zone: 'family',
    coordinates: [
      { latitude: 36.7371, longitude: 2.8651 },
      { latitude: 36.7371, longitude: 2.8660 },
      { latitude: 36.7369, longitude: 2.8660 },
      { latitude: 36.7369, longitude: 2.8651 },
    ],
    label: 'Family Zone',
  },
  {
    id: 'free-zone',
    zone: 'free',
    coordinates: [
      { latitude: 36.7369, longitude: 2.8651 },
      { latitude: 36.7369, longitude: 2.8660 },
      { latitude: 36.7366, longitude: 2.8660 },
      { latitude: 36.7366, longitude: 2.8651 },
    ],
    label: 'Free Zone',
  },
];

// ─────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────

export default function BeachMapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? insets.top + 20 : insets.top + 8;
  const { colors } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 10,
      gap: 12,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerCenter: { flex: 1 },
    headerTitle: { fontSize: 16, fontFamily: 'mon-b', color: colors.text },
    headerSub: { fontSize: 12, fontFamily: 'mon', color: colors.muted },
    infoBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    legendContainer: { padding: 16, gap: 14 },
    legendTitle: { fontSize: 14, fontFamily: 'mon-b', color: colors.text },
    legendGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    legendItem: {
      width: '31%',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 10,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      gap: 4,
    },
    legendEmoji: { fontSize: 22 },
    legendLabel: { fontSize: 11, fontFamily: 'mon-b', color: colors.text },
    legendDesc: { fontSize: 9, fontFamily: 'mon', color: colors.muted, textAlign: 'center' },
    infoCard: {
      flexDirection: 'row',
      gap: 10,
      backgroundColor: '#EFF6FF',
      borderRadius: 12,
      padding: 14,
      marginTop: 4,
    },
    infoCardText: { flex: 1, fontSize: 12, fontFamily: 'mon', color: '#3B82F6', lineHeight: 17 },
  }), [colors]);

  const handleSelectAsset = (asset: BeachAsset) => {
    // TODO: Navigate to booking flow with asset details
    // For now, just log it
  };

  return (
    <View style={styles.root}>

      {/* ── HEADER ── */}
      <View style={[styles.header, { paddingTop: topPad }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Sidi Fredj Beach</Text>
          <Text style={styles.headerSub}>Tipaza · Live satellite view</Text>
        </View>
        <Pressable style={styles.infoBtn}>
          <Ionicons name="information-circle-outline" size={22} color={RIHLA.primary} />
        </Pressable>
      </View>

      {/* ── MAP ── */}
      <BeachSatelliteMap
        assets={MOCK_ASSETS}
        zones={ZONE_OVERLAYS}
        center={BEACH_CENTER}
        beachName="Sidi Fredj"
        onSelectAsset={handleSelectAsset}
        height={520}
      />

      {/* ── LEGEND ── */}
      <ScrollView
        contentContainerStyle={[styles.legendContainer, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.legendTitle}>Asset Types</Text>
        <View style={styles.legendGrid}>
          {[
            { emoji: '☂️', label: 'Umbrella', desc: 'Shade spot with chairs' },
            { emoji: '🪑', label: 'Table', desc: 'Dining table setup' },
            { emoji: '💺', label: 'Chair', desc: 'Single lounge chair' },
            { emoji: '🅿️', label: 'Parking', desc: 'Vehicle parking spot' },
            { emoji: '🚿', label: 'Shower', desc: 'Free beach shower' },
            { emoji: '🔋', label: 'Power Bank', desc: 'Phone charging station' },
          ].map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <Text style={styles.legendEmoji}>{item.emoji}</Text>
              <Text style={styles.legendLabel}>{item.label}</Text>
              <Text style={styles.legendDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="bulb-outline" size={18} color={RIHLA.accent} />
          <Text style={styles.infoCardText}>
            Tap any asset on the map to view details and reserve. VIP zone assets are closest to the sea.
            All reservations update in real time.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
