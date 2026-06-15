/**
 * RIHLA — Beach Satellite Map Component (MapLibre / OpenStreetMap)
 * ----------------------------------------------------------------
 * Open-source satellite-style map with beach assets (umbrellas, tables,
 * parking spots, VIP zones) overlaid on actual coordinates.
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';

// Detect Expo Go — MapLibre crashes in Expo Go (TurboModuleRegistry.getEnforcing)
let isExpoGo = false;
try {
  const Constants = require('expo-constants').default;
  isExpoGo = Constants?.executionEnvironment === 'storeClient';
} catch { /* not available */ }

let ML: any = null;
if (!isExpoGo) {
  try { ML = require('@maplibre/maplibre-react-native'); } catch { /* noop */ }
}

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type BeachAssetKind = 'umbrella' | 'table' | 'chair' | 'parking' | 'vip_spot' | 'family_spot' | 'shower' | 'powerbank';

export type BeachZone = 'vip' | 'family' | 'free';

export type BeachAsset = {
  id: string;
  kind: BeachAssetKind;
  lat: number;
  lng: number;
  price_dzd: number;
  status: 'available' | 'reserved' | 'occupied' | 'maintenance';
  zone: BeachZone;
  /** Distance to sea in meters (for popup display) */
  distance_to_sea_m?: number;
  /** Label shown on the map pin */
  label?: string;
};

export type BeachZoneOverlay = {
  id: string;
  zone: BeachZone;
  coordinates: { latitude: number; longitude: number }[];
  label: string;
};

type Props = {
  assets: BeachAsset[];
  zones: BeachZoneOverlay[];
  center: { latitude: number; longitude: number };
  beachName: string;
  onSelectAsset?: (asset: BeachAsset) => void;
  /** Show zone filter tabs */
  showZoneFilter?: boolean;
  /** Map height — defaults to 420 */
  height?: number;
};

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const ASSET_ICONS: Record<BeachAssetKind, string> = {
  umbrella: '☂️',
  table: '🪑',
  chair: '💺',
  parking: '🅿️',
  vip_spot: '⭐',
  family_spot: '👨‍👩‍👧',
  shower: '🚿',
  powerbank: '🔋',
};

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  available: { bg: '#D1FAE5', border: '#10B981', text: '#065F46' },
  reserved: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
  occupied: { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' },
  maintenance: { bg: '#E2E8F0', border: '#94A3B8', text: '#475569' },
};

const ZONE_COLORS: Record<BeachZone, { fill: string; stroke: string; label: string }> = {
  vip: { fill: 'rgba(244,162,97,0.15)', stroke: '#f4a261', label: '⭐ VIP Zone' },
  family: { fill: 'rgba(0,168,150,0.12)', stroke: '#00a896', label: '👨‍👩‍👧 Family Zone' },
  free: { fill: 'rgba(10,37,64,0.08)', stroke: '#0a2540', label: 'Free Zone' },
};

const { width: SCREEN_W } = Dimensions.get('window');

// ─────────────────────────────────────────────
// ASSET PIN (custom marker view)
// ─────────────────────────────────────────────

function AssetPin({ asset, isSelected }: { asset: BeachAsset; isSelected: boolean }) {
  const colors = STATUS_COLORS[asset.status];
  return (
    <View
      style={[
        styles.assetPin,
        {
          backgroundColor: isSelected ? RIHLA.primary : colors.bg,
          borderColor: isSelected ? RIHLA.accent : colors.border,
          transform: [{ scale: isSelected ? 1.25 : 1 }],
        },
      ]}
    >
      <Text style={styles.assetEmoji}>{ASSET_ICONS[asset.kind]}</Text>
      {asset.label && (
        <Text style={[styles.assetLabel, { color: isSelected ? '#fff' : colors.text }]} numberOfLines={1}>
          {asset.label}
        </Text>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function BeachSatelliteMap({
  assets,
  zones,
  center,
  beachName,
  onSelectAsset,
  showZoneFilter = true,
  height = 420,
}: Props) {
  const cameraRef = useRef<any>(null);
  const [selectedAsset, setSelectedAsset] = useState<BeachAsset | null>(null);
  const [zoneFilter, setZoneFilter] = useState<BeachZone | 'all'>('all');

  const filteredAssets = useMemo(() => {
    if (zoneFilter === 'all') return assets;
    return assets.filter((a) => a.zone === zoneFilter);
  }, [assets, zoneFilter]);

  const stats = useMemo(() => {
    const available = assets.filter((a) => a.status === 'available').length;
    const occupied = assets.filter((a) => a.status === 'occupied' || a.status === 'reserved').length;
    return { total: assets.length, available, occupied };
  }, [assets]);

  const handleAssetPress = useCallback(
    (asset: BeachAsset) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedAsset(asset);
      onSelectAsset?.(asset);
      cameraRef.current?.easeTo({
        center: [asset.lng, asset.lat],
        zoom: 18,
        duration: 300,
      });
    },
    [onSelectAsset]
  );

  const handleAssetCalloutPress = useCallback(
    (asset: BeachAsset) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSelectAsset?.(asset);
    },
    [onSelectAsset]
  );

  const zonesGeoJSON = useMemo(() => {
    if (zones.length === 0) return null;
    return {
      type: 'FeatureCollection' as const,
      features: zones.map((zone) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [
            zone.coordinates.map((c) => [c.longitude, c.latitude]),
          ],
        },
        properties: { zone: zone.zone, id: zone.id },
      })),
    };
  }, [zones]);

  const SATELLITE_STYLE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  if (!ML) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Text style={{ fontSize: 14, fontFamily: 'mon-b', color: '#64748B' }}>Map unavailable</Text>
          <Text style={{ fontSize: 12, fontFamily: 'mon', color: '#94A3B8', textAlign: 'center' }}>
            Maps require a development build
          </Text>
        </View>
      </View>
    );
  }

  const { Map, Marker, Camera, GeoJSONSource, Layer, Callout } = ML;

  return (
    <View style={[styles.container, { height }]}>
      {/* ── MAP ── */}
      <Map
        mapStyle={SATELLITE_STYLE as any}
        style={styles.map}
        compass={false}
        scaleBar={false}
        attribution={false}
        logo={false}
        touchRotate={false}
        touchPitch={false}
      >
        <Camera
          ref={cameraRef}
          center={[center.longitude, center.latitude]}
          zoom={17}
          duration={0}
        />

        {/* Zone polygon overlays */}
        {zonesGeoJSON && (
          <GeoJSONSource id="zones-source" data={zonesGeoJSON}>
            <Layer
              id="zones-fill"
              type="fill"
              source="zones-source"
              paint={{
                'fill-color': ['match', ['get', 'zone'],
                  'vip', 'rgba(244,162,97,0.15)',
                  'family', 'rgba(0,168,150,0.12)',
                  'rgba(10,37,64,0.08)'
                ],
                'fill-outline-color': ['match', ['get', 'zone'],
                  'vip', '#f4a261',
                  'family', '#00a896',
                  '#0a2540'
                ],
              }}
            />
            <Layer
              id="zones-line"
              type="line"
              source="zones-source"
              paint={{
                'line-color': ['match', ['get', 'zone'],
                  'vip', '#f4a261',
                  'family', '#00a896',
                  '#0a2540'
                ],
                'line-width': 2,
              }}
            />
          </GeoJSONSource>
        )}

        {/* Asset markers */}
        {filteredAssets.map((asset) => (
          <Marker
            key={asset.id}
            id={asset.id}
            lngLat={[asset.lng, asset.lat]}
            onPress={() => handleAssetPress(asset)}
          >
            <View>
              <AssetPin asset={asset} isSelected={selectedAsset?.id === asset.id} />
              <Callout title={`${ASSET_ICONS[asset.kind]} ${asset.id}`}>
                <View style={styles.calloutContent}>
                  <Text style={styles.calloutZone}>{ZONE_COLORS[asset.zone].label}</Text>
                  {asset.distance_to_sea_m != null && (
                    <Text style={styles.calloutDetail}>{asset.distance_to_sea_m}m to sea</Text>
                  )}
                  <Text style={styles.calloutPrice}>
                    {asset.price_dzd === 0 ? 'Free' : `${asset.price_dzd.toLocaleString()} DZD`}
                  </Text>
                  <Text style={styles.calloutStatus}>{asset.status}</Text>
                  {asset.status === 'available' && (
                    <Text style={styles.calloutBtn}>Book Now →</Text>
                  )}
                </View>
              </Callout>
            </View>
          </Marker>
        ))}
      </Map>

      {/* ── ZONE FILTER TABS ── */}
      {showZoneFilter && (
        <View style={styles.zoneFilterRow}>
          {(['all', 'vip', 'family', 'free'] as const).map((z) => (
            <Pressable
              key={z}
              style={[
                styles.zoneFilterChip,
                zoneFilter === z && styles.zoneFilterChipActive,
                z !== 'all' && zoneFilter === z && { backgroundColor: ZONE_COLORS[z].stroke },
              ]}
              onPress={() => setZoneFilter(z)}
            >
              <Text
                style={[
                  styles.zoneFilterText,
                  zoneFilter === z && styles.zoneFilterTextActive,
                ]}
              >
                {z === 'all' ? 'All' : z === 'vip' ? '⭐ VIP' : z === 'family' ? '👨‍👩‍👧 Family' : 'Free'}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* ── STATS BAR ── */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.statText}>{stats.available} available</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.statText}>{stats.occupied} occupied</Text>
        </View>
        <Text style={styles.statTotal}>{stats.total} total</Text>
      </View>

      {/* ── SELECTED ASSET DETAIL SHEET ── */}
      {selectedAsset && (
        <Animated.View style={styles.detailSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetContent}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>
                  {ASSET_ICONS[selectedAsset.kind]} {selectedAsset.id}
                </Text>
                <Text style={styles.sheetSub}>
                  {ZONE_COLORS[selectedAsset.zone].label} ·{' '}
                  {selectedAsset.distance_to_sea_m != null
                    ? `${selectedAsset.distance_to_sea_m}m to sea`
                    : selectedAsset.kind}
                </Text>
              </View>
              <Pressable
                onPress={() => setSelectedAsset(null)}
                style={styles.sheetClose}
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </Pressable>
            </View>

            <View style={styles.sheetDetails}>
              <View style={[styles.sheetDetailPill, { backgroundColor: STATUS_COLORS[selectedAsset.status].bg }]}>
                <View style={[styles.statDot, { backgroundColor: STATUS_COLORS[selectedAsset.status].border }]} />
                <Text style={[styles.sheetDetailText, { color: STATUS_COLORS[selectedAsset.status].text }]}>
                  {selectedAsset.status.charAt(0).toUpperCase() + selectedAsset.status.slice(1)}
                </Text>
              </View>
              <Text style={styles.sheetPrice}>
                {selectedAsset.price_dzd === 0
                  ? 'Free'
                  : `${selectedAsset.price_dzd.toLocaleString()} DZD`}
              </Text>
            </View>

            {selectedAsset.status === 'available' && (
              <Pressable
                style={styles.bookButton}
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  onSelectAsset?.(selectedAsset);
                }}
              >
                <LinearGradient colors={[RIHLA.primary, RIHLA.accent]} style={styles.bookGradient}>
                  <Text style={styles.bookText}>
                    Reserve {selectedAsset.id} ·{' '}
                    {selectedAsset.price_dzd === 0 ? 'Free' : `${selectedAsset.price_dzd.toLocaleString()} DZD`}
                  </Text>
                </LinearGradient>
              </Pressable>
            )}

            {selectedAsset.status !== 'available' && (
              <View style={styles.unavailableNotice}>
                <Ionicons name="information-circle-outline" size={16} color="#94A3B8" />
                <Text style={styles.unavailableText}>
                  {selectedAsset.status === 'occupied'
                    ? 'This spot is currently occupied'
                    : selectedAsset.status === 'reserved'
                    ? 'This spot is being reserved by another guest'
                    : 'This spot is under maintenance'}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: RIHLA.border,
    backgroundColor: RIHLA.card,
  },
  map: { width: '100%', height: '100%' },

  // Asset pins
  assetPin: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  assetEmoji: { fontSize: 18 },
  assetLabel: { fontSize: 8, fontFamily: 'mon-sb', marginTop: 1 },

  // Callout tooltip
  callout: { width: 200 },
  calloutCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: RIHLA.border,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  calloutTitle: { fontSize: 15, fontFamily: 'mon-b', color: RIHLA.dark },
  calloutContent: { padding: 4 },
  calloutZone: { fontSize: 11, fontFamily: 'mon-sb', color: RIHLA.mutedText, marginTop: 2 },
  calloutDetail: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 2 },
  calloutPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  calloutPrice: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.primary },
  calloutStatus: { fontSize: 10, fontFamily: 'mon-sb', textTransform: 'capitalize', color: '#64748B', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10, fontFamily: 'mon-sb', textTransform: 'capitalize' },
  calloutBtn: {
    marginTop: 8,
    backgroundColor: RIHLA.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  calloutBtnText: { fontSize: 12, fontFamily: 'mon-b', color: '#fff' },
  calloutArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
    alignSelf: 'center',
  },

  // Zone filter
  zoneFilterRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 6,
    zIndex: 10,
  },
  zoneFilterChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: RIHLA.border,
  },
  zoneFilterChipActive: {
    backgroundColor: RIHLA.primary,
    borderColor: RIHLA.primary,
  },
  zoneFilterText: { fontSize: 11, fontFamily: 'mon-sb', color: '#475569' },
  zoneFilterTextActive: { color: '#fff' },

  // Stats bar
  statsBar: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    zIndex: 10,
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statDot: { width: 7, height: 7, borderRadius: 4 },
  statText: { fontSize: 12, fontFamily: 'mon-sb', color: '#475569' },
  statTotal: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8', marginLeft: 'auto' },

  // Detail sheet
  detailSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
    zIndex: 20,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginTop: 8,
  },
  sheetContent: { padding: 16 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sheetTitle: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.dark },
  sheetSub: { fontSize: 13, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 2 },
  sheetClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: RIHLA.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  sheetDetailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  sheetDetailText: { fontSize: 12, fontFamily: 'mon-sb' },
  sheetPrice: { fontSize: 22, fontFamily: 'mon-b', color: RIHLA.primary },
  bookButton: { marginTop: 14, borderRadius: 14, overflow: 'hidden' },
  bookGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 14 },
  bookText: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },
  unavailableNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: RIHLA.muted,
  },
  unavailableText: { flex: 1, fontSize: 13, fontFamily: 'mon', color: '#64748B' },
});
