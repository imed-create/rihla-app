/**
 * RIHLA — Live Tracker Component
 * ─────────────────────────────────
 * Real-time marker moving along a route between user and destination.
 * Shows: ETA countdown, progress bar, route stats.
 * Used in: active booking screen, live dispatch tracking.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { RIHLA } from '@/constants/theme';
import { formatTime } from '@/lib/map';

interface LiveTrackerProps {
  userLatitude: number;
  userLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  /** Total ETA in minutes */
  totalEtaMinutes: number;
  /** Service provider name */
  providerName?: string;
  /** Service provider category */
  category?: string;
  /** Route polyline points (lat/lng array) */
  routePoints?: { latitude: number; longitude: number }[];
  /** Height of the tracker card */
  height?: number;
  /** Whether tracking is active */
  isActive?: boolean;
  /** Custom color */
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

  // Move marker along route on interval
  useEffect(() => {
    if (!isActive || !routePoints || routePoints.length < 2) return;

    const interval = 3000; // update every 3 seconds

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

  return (
    <View style={[styles.container, { height }]}>
      {/* Mini map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: (userLatitude + destinationLatitude) / 2,
          longitude: (userLongitude + destinationLongitude) / 2,
          latitudeDelta: Math.abs(userLatitude - destinationLatitude) * 1.5 + 0.02,
          longitudeDelta: Math.abs(userLongitude - destinationLongitude) * 1.5 + 0.02,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
      >
        {/* Live marker at current position */}
        <Marker
          coordinate={currentPosition}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={[styles.liveMarker, { backgroundColor: color }]}>
            <Ionicons name="locate" size={14} color="#fff" />
          </View>
        </Marker>

        {/* Destination marker */}
        <Marker
          coordinate={{ latitude: destinationLatitude, longitude: destinationLongitude }}
          anchor={{ x: 0.5, y: 1 }}
        >
          <View style={styles.destMarker}>
            <Ionicons name="location" size={18} color="#DC2626" />
          </View>
        </Marker>

        {/* Route polyline */}
        {routePoints && routePoints.length > 1 && (
          <Polyline
            coordinates={routePoints}
            strokeColor={color}
            strokeWidth={3}
          />
        )}
      </MapView>

      {/* Overlay info card */}
      <View style={[styles.infoCard, { backgroundColor: '#FFFFFF' }]}>
        <View style={styles.headerRow}>
          <View style={styles.providerInfo}>
            <View style={[styles.liveDot, { backgroundColor: isActive ? '#10B981' : '#CBD5E1' }]} />
            <Text style={styles.providerName}>
              {providerName || 'Live Tracking'}
            </Text>
            {category && (
              <Text style={styles.categoryText}>{category}</Text>
            )}
          </View>
          <Text style={styles.etaText}>
            {formatTime(remainingMinutes)}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progress * 100}%`, backgroundColor: color },
            ]}
          />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={13} color="#64748B" />
            <Text style={styles.statText}>
              ETA: {formatTime(remainingMinutes)}
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="flag-outline" size={13} color="#64748B" />
            <Text style={styles.statText}>
              {Math.round(progress * 100)}% complete
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: RIHLA.border,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  liveMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  destMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 14,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: RIHLA.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  providerName: {
    fontSize: 14,
    fontFamily: 'mon-b',
    color: RIHLA.dark,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: 'mon',
    color: '#94A3B8',
  },
  etaText: {
    fontSize: 18,
    fontFamily: 'mon-b',
    color: RIHLA.primary,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    fontFamily: 'mon-sb',
    color: '#64748B',
  },
});
