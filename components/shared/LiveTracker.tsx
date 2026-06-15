/**
 * RIHLA — Live Tracker Component (MapLibre / OpenStreetMap)
 * ────────────────────────────────────────────────────────
 * Real-time marker moving along a route between user and destination.
 * Detects Expo Go and shows fallback (MapLibre needs dev build).
 */

import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RIHLA } from '@/constants/theme';
import { formatTime } from '@/lib/map';

// Detect Expo Go
let isExpoGo = false;
try {
  const Constants = require('expo-constants').default;
  isExpoGo = Constants?.executionEnvironment === 'storeClient';
} catch { /* not available */ }

// Lazy-load MapLibre only if NOT in Expo Go
let ML: any = null;
if (!isExpoGo) {
  try { ML = require('@maplibre/maplibre-react-native'); } catch { /* noop */ }
}

interface LiveTrackerProps {
  userLatitude: number;
  userLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  totalEtaMinutes: number;
  providerName?: string;
  category?: string;
  routePoints?: { latitude: number; longitude: number }[];
  height?: number;
  isActive?: boolean;
  color?: string;
}

export default function LiveTracker({
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
  totalEtaMinutes,
  providerName,
  category,
  routePoints,
  height = 200,
  isActive = true,
  color = RIHLA.primary,
}: LiveTrackerProps) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [currentPosition, setCurrentPosition] = useState({
    latitude: userLatitude,
    longitude: userLongitude,
  });

  useEffect(() => {
    if (!isActive || !routePoints || routePoints.length < 2) return;
    const interval = 3000;
    const increment = interval / 60000;
    const timer = setInterval(() => {
      setElapsedMinutes((prev) => {
        const next = Math.min(prev + increment, totalEtaMinutes);
        const progress = next / totalEtaMinutes;
        const routeIndex = Math.floor(Math.min(progress, 1) * (routePoints.length - 1));
        const nextPoint = routePoints[Math.min(routeIndex + 1, routePoints.length - 1)];
        if (nextPoint) setCurrentPosition(nextPoint);
        if (next >= totalEtaMinutes) clearInterval(timer);
        return next;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [isActive, routePoints, totalEtaMinutes]);

  const remainingMinutes = Math.max(totalEtaMinutes - elapsedMinutes, 0);
  const progress = Math.min(elapsedMinutes / totalEtaMinutes, 1);

  const center: [number, number] = useMemo(
    () => [
      (userLongitude + destinationLongitude) / 2,
      (userLatitude + destinationLatitude) / 2,
    ],
    [userLongitude, destinationLongitude, userLatitude, destinationLatitude]
  );

  const zoomLevel = useMemo(() => {
    const latDelta = Math.abs(userLatitude - destinationLatitude);
    const lngDelta = Math.abs(userLongitude - destinationLongitude);
    const maxDelta = Math.max(latDelta, lngDelta);
    if (maxDelta > 0.5) return 10;
    if (maxDelta > 0.1) return 12;
    return 14;
  }, [userLatitude, destinationLatitude, userLongitude, destinationLongitude]);

  // Fallback when MapLibre is not available
  if (!ML) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Ionicons name="navigate-outline" size={36} color="#64748B" />
          <Text style={{ fontSize: 14, fontFamily: 'mon-b', color: '#64748B' }}>Live tracking unavailable</Text>
          <Text style={{ fontSize: 12, fontFamily: 'mon', color: '#94A3B8', textAlign: 'center' }}>
            Maps require a development build
          </Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: '#FFFFFF' }]}>
          <View style={styles.headerRow}>
            <View style={styles.providerInfo}>
              <View style={[styles.liveDot, { backgroundColor: isActive ? '#10B981' : '#CBD5E1' }]} />
              <Text style={styles.providerName}>{providerName || 'Live Tracking'}</Text>
              {category && <Text style={styles.categoryText}>{category}</Text>}
            </View>
            <Text style={styles.etaText}>{formatTime(remainingMinutes)}</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
          </View>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="time-outline" size={13} color="#64748B" />
              <Text style={styles.statText}>ETA: {formatTime(remainingMinutes)}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="flag-outline" size={13} color="#64748B" />
              <Text style={styles.statText}>{Math.round(progress * 100)}% complete</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  const { Map, Marker, Camera } = ML;

  return (
    <View style={[styles.container, { height }]}>
      <Map
        mapStyle="https://tiles.openfreemap.org/styles/positron"
        style={styles.map}
        compass={false}
        scaleBar={false}
        attribution={false}
        logo={false}
        touchRotate={false}
        touchPitch={false}
      >
        <Camera center={center} zoom={zoomLevel} duration={0} />
        <Marker id="live-position" lngLat={[currentPosition.longitude, currentPosition.latitude]}>
          <View style={[styles.liveMarker, { backgroundColor: color }]}>
            <Ionicons name="locate" size={14} color="#fff" />
          </View>
        </Marker>
        <Marker id="destination" lngLat={[destinationLongitude, destinationLatitude]}>
          <View style={styles.destMarker}>
            <Ionicons name="location" size={18} color="#DC2626" />
          </View>
        </Marker>
      </Map>

      <View style={[styles.infoCard, { backgroundColor: '#FFFFFF' }]}>
        <View style={styles.headerRow}>
          <View style={styles.providerInfo}>
            <View style={[styles.liveDot, { backgroundColor: isActive ? '#10B981' : '#CBD5E1' }]} />
            <Text style={styles.providerName}>{providerName || 'Live Tracking'}</Text>
            {category && <Text style={styles.categoryText}>{category}</Text>}
          </View>
          <Text style={styles.etaText}>{formatTime(remainingMinutes)}</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={13} color="#64748B" />
            <Text style={styles.statText}>ETA: {formatTime(remainingMinutes)}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="flag-outline" size={13} color="#64748B" />
            <Text style={styles.statText}>{Math.round(progress * 100)}% complete</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: RIHLA.border, position: 'relative' },
  map: { ...StyleSheet.absoluteFillObject },
  liveMarker: { width: 32, height: 32, borderRadius: 16, borderWidth: 3, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', elevation: 5 },
  destMarker: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FEE2E2', borderWidth: 2, borderColor: '#DC2626', alignItems: 'center', justifyContent: 'center' },
  infoCard: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 14, gap: 8, borderTopWidth: 1, borderTopColor: RIHLA.border },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  providerInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  providerName: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.dark },
  categoryText: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  etaText: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.primary },
  progressBarBg: { height: 4, borderRadius: 2, backgroundColor: '#F1F5F9', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 11, fontFamily: 'mon-sb', color: '#64748B' },
});
