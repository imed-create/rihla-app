/**
 * RIHLA — Map With Directions (MapLibre / OpenStreetMap)
 * ─────────────────────────────────────────────────────
 * Open-source map using MapLibre + OpenFreeMap tiles.
 * Detects Expo Go and shows fallback (MapLibre needs dev build).
 */

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, PanResponder, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Line, Circle, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, interpolate, Extrapolate } from 'react-native-reanimated';
import { useLocationStore, type ServiceMarker } from '@/store/useLocationStore';
import { getCategoryDef } from '@/constants/marketplaceCategories';
import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const MAP_STYLES = {
  dark: 'https://tiles.openfreemap.org/styles/liberty',
  light: 'https://tiles.openfreemap.org/styles/positron',
} as const;

// Detect Expo Go — MapLibre native modules aren't available there
let isExpoGo = false;
try {
  const Constants = require('expo-constants').default;
  isExpoGo = Constants?.executionEnvironment === 'storeClient';
} catch { /* not available */ }

// Lazy-load MapLibre only if NOT in Expo Go
let MapLibreMap: any = null;
let loadError = false;

if (!isExpoGo) {
  try {
    MapLibreMap = require('./MapLibreMap').default;
  } catch (e) {
    console.warn('[MapWithDirections] Failed to load MapLibre:', (e as Error).message);
    loadError = true;
  }
}

interface MapWithDirectionsProps {
  height?: number;
  markers?: ServiceMarker[];
  onMarkerPress?: (marker: ServiceMarker) => void;
  showUserLocation?: boolean;
  showDirections?: boolean;
  autoCalculateTimes?: boolean;
  darkMode?: boolean;
  mapStyleType?: 'streets' | 'satellite';
  initialCenter?: [number, number];
  initialZoom?: number;
}

function MapFallback({
  height,
  markers = [],
  onMarkerPress,
  showUserLocation = true,
  initialCenter,
  initialZoom = 13,
}: {
  height?: number;
  markers?: ServiceMarker[];
  onMarkerPress?: (marker: ServiceMarker) => void;
  showUserLocation?: boolean;
  initialCenter?: [number, number];
  initialZoom?: number;
}) {
  const { colors, isDark } = useTheme();
  
  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  const center: [number, number] = useMemo(() => {
    if (initialCenter) return initialCenter;
    if (userLongitude != null && userLatitude != null) return [userLongitude, userLatitude];
    return [3.0588, 36.7538];
  }, [initialCenter, userLongitude, userLatitude]);

  const [zoom, setZoom] = useState(initialZoom);
  const [centerLng, setCenterLng] = useState(center[0]);
  const [centerLat, setCenterLat] = useState(center[1]);

  useEffect(() => {
    setCenterLng(center[0]);
    setCenterLat(center[1]);
  }, [center]);

  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width - 32,
    height: height || 300,
  });

  const onLayout = (event: any) => {
    const { width, height: layoutHeight } = event.nativeEvent.layout;
    setDimensions({ width, height: layoutHeight });
  };

  const zoomFactor = Math.pow(2, zoom - 11);
  const scale = 25000 * zoomFactor;

  const getXY = (lng: number, lat: number) => {
    const x = dimensions.width / 2 + (lng - centerLng) * scale;
    const y = dimensions.height / 2 - (lat - centerLat) * scale;
    return { x, y };
  };

  const dragStartRef = useRef<{ lng: number; lat: number }>({ lng: 0, lat: 0 });
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStartRef.current = { lng: centerLng, lat: centerLat };
      },
      onPanResponderMove: (evt, gestureState) => {
        const zF = Math.pow(2, zoom - 11);
        const sc = 25000 * zF;
        const dLng = -gestureState.dx / sc;
        const dLat = gestureState.dy / sc;
        setCenterLng(dragStartRef.current.lng + dLng);
        setCenterLat(dragStartRef.current.lat + dLat);
      },
    })
  ).current;

  // Grid Lines
  const gridLines = useMemo(() => {
    const lines = [];
    const step = 0.01 / Math.max(1, Math.floor(zoomFactor));
    const startLng = Math.floor((centerLng - 0.15) * 100) / 100;
    const endLng = Math.ceil((centerLng + 0.15) * 100) / 100;
    const startLat = Math.floor((centerLat - 0.15) * 100) / 100;
    const endLat = Math.ceil((centerLat + 0.15) * 100) / 100;

    for (let l = startLng; l <= endLng; l += 0.005) {
      const xy1 = getXY(l, startLat);
      const xy2 = getXY(l, endLat);
      lines.push(<Line key={`lng-${l}`} x1={xy1.x} y1={xy1.y} x2={xy2.x} y2={xy2.y} stroke={colors.border} strokeWidth={1} opacity={0.3} />);
    }
    for (let l = startLat; l <= endLat; l += 0.005) {
      const xy1 = getXY(startLng, l);
      const xy2 = getXY(endLng, l);
      lines.push(<Line key={`lat-${l}`} x1={xy1.x} y1={xy1.y} x2={xy2.x} y2={xy2.y} stroke={colors.border} strokeWidth={1} opacity={0.3} />);
    }
    return lines;
  }, [centerLng, centerLat, zoom, dimensions, colors.border]);

  // Coastline of Algiers Gulf
  const seaElement = useMemo(() => {
    const coastPoints = [
      [2.85, 36.65],
      [2.92, 36.70],
      [2.98, 36.75],
      [3.04, 36.80],
      [3.12, 36.82],
      [3.22, 36.78],
      [3.30, 36.76],
      [3.42, 36.80],
      [3.55, 36.82],
    ];

    let pathD = '';
    coastPoints.forEach((pt, i) => {
      const xy = getXY(pt[0], pt[1]);
      if (i === 0) pathD += `M ${xy.x} ${xy.y}`;
      else pathD += ` L ${xy.x} ${xy.y}`;
    });

    const seaPathD = pathD + ` L ${dimensions.width + 200} -200 L -200 -200 Z`;

    return (
      <G>
        <Path d={seaPathD} fill={isDark ? '#0284C715' : '#E0F2FE70'} />
        <Path d={pathD} stroke={isDark ? '#0284C7' : '#0369A1'} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.8} />
      </G>
    );
  }, [centerLng, centerLat, zoom, dimensions, isDark]);

  // High capacity transit corridors
  const roads = useMemo(() => {
    const road1 = [
      [2.85, 36.68],
      [3.00, 36.72],
      [3.08, 36.74],
      [3.20, 36.71],
      [3.35, 36.73],
      [3.55, 36.75],
    ];
    const road2 = [
      [3.08, 36.60],
      [3.08, 36.74],
      [3.11, 36.81],
    ];

    let d1 = '';
    road1.forEach((pt, i) => {
      const xy = getXY(pt[0], pt[1]);
      if (i === 0) d1 += `M ${xy.x} ${xy.y}`;
      else d1 += ` L ${xy.x} ${xy.y}`;
    });

    let d2 = '';
    road2.forEach((pt, i) => {
      const xy = getXY(pt[0], pt[1]);
      if (i === 0) d2 += `M ${xy.x} ${xy.y}`;
      else d2 += ` L ${xy.x} ${xy.y}`;
    });

    const stroke = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';

    return (
      <G>
        <Path d={d1} stroke={stroke} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d={d2} stroke={stroke} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </G>
    );
  }, [centerLng, centerLat, zoom, dimensions, isDark]);

  // User location pulsing DOT
  const userPulseScale = useSharedValue(1);
  useEffect(() => {
    userPulseScale.value = withRepeat(
      withSequence(
        withTiming(2.2, { duration: 1500 }),
        withTiming(1, { duration: 0 })
      ),
      -1,
      false
    );
  }, []);

  const userPulseAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: userPulseScale.value }],
    opacity: interpolate(userPulseScale.value, [1, 2.2], [0.8, 0], Extrapolate.CLAMP),
  }));

  const userLocationNode = useMemo(() => {
    if (!showUserLocation || userLongitude == null || userLatitude == null) return null;
    const xy = getXY(userLongitude, userLatitude);
    return (
      <View style={[styles.markerContainer, { left: xy.x - 20, top: xy.y - 20 }]}>
        <Animated.View style={[styles.pulseRing, userPulseAnimStyle]} />
        <View style={styles.userDot} />
      </View>
    );
  }, [userLongitude, userLatitude, centerLng, centerLat, zoom, dimensions, showUserLocation]);

  // Ride booking route indicator
  const directionLine = useMemo(() => {
    if (destinationLatitude == null || destinationLongitude == null || userLatitude == null || userLongitude == null) return null;
    const xy1 = getXY(userLongitude, userLatitude);
    const xy2 = getXY(destinationLongitude, destinationLatitude);

    return (
      <Line
        x1={xy1.x}
        y1={xy1.y}
        x2={xy2.x}
        y2={xy2.y}
        stroke={RIHLA.primary}
        strokeWidth={3}
        strokeDasharray="6, 6"
        opacity={0.9}
      />
    );
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude, centerLng, centerLat, zoom, dimensions]);

  // Interactive Pins overlays
  const markerOverlayElements = useMemo(() => {
    return markers.map((m) => {
      const xy = getXY(m.longitude, m.latitude);
      const isInside = xy.x >= -30 && xy.x <= dimensions.width + 30 && xy.y >= -30 && xy.y <= dimensions.height + 30;
      if (!isInside) return null;

      const catDef = getCategoryDef(m.category as any);
      const catColor = catDef?.color || RIHLA.primary;

      return (
        <TouchableOpacity
          key={m.id}
          style={[styles.pinWrapper, { left: xy.x - 14, top: xy.y - 28 }]}
          onPress={() => onMarkerPress?.(m)}
          activeOpacity={0.85}
        >
          <View style={[styles.pinBubble, { backgroundColor: catColor, borderColor: '#FFFFFF' }]}>
            <Ionicons name={(catDef?.icon || 'location-outline') as any} size={12} color="#FFFFFF" />
          </View>
          {m.priceDZD != null && (
            <View style={styles.pinLabel}>
              <Text style={styles.pinLabelText}>{Math.round(m.priceDZD / 100) / 10}k</Text>
            </View>
          )}
          <View style={[styles.pinTip, { borderTopColor: catColor }]} />
        </TouchableOpacity>
      );
    });
  }, [markers, centerLng, centerLat, zoom, dimensions, onMarkerPress]);

  // Destination Marker
  const destinationMarkerNode = useMemo(() => {
    if (destinationLatitude == null || destinationLongitude == null) return null;
    const xy = getXY(destinationLongitude, destinationLatitude);
    return (
      <View style={[styles.pinWrapper, { left: xy.x - 14, top: xy.y - 28 }]}>
        <View style={[styles.pinBubble, { backgroundColor: '#EF4444', borderColor: '#FFFFFF' }]}>
          <Ionicons name="flag" size={12} color="#FFFFFF" />
        </View>
        <View style={[styles.pinTip, { borderTopColor: '#EF4444' }]} />
      </View>
    );
  }, [destinationLatitude, destinationLongitude, centerLng, centerLat, zoom, dimensions]);

  return (
    <View
      style={[
        styles.container,
        height ? { height } : styles.fill,
        { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', position: 'relative' },
      ]}
      onLayout={onLayout}
      {...panResponder.panHandlers}
    >
      <Svg style={StyleSheet.absoluteFill}>
        {gridLines}
        {roads}
        {seaElement}
        {directionLine}
      </Svg>

      {markerOverlayElements}
      {destinationMarkerNode}
      {userLocationNode}

      {/* Floating Zoom Controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={[styles.zoomBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setZoom(prev => Math.min(18, prev + 0.5))}
        >
          <Ionicons name="add" size={18} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.zoomBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setZoom(prev => Math.max(10, prev - 0.5))}
        >
          <Ionicons name="remove" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Watermark indicating Expo Go fallback */}
      <View style={styles.watermark}>
        <Ionicons name="navigate-outline" size={10} color={colors.muted} />
        <Text style={[styles.watermarkText, { color: colors.muted }]}>RIHLA Vector Map (Expo Go)</Text>
      </View>
    </View>
  );
}

export default function MapWithDirections({
  height,
  markers: externalMarkers,
  onMarkerPress,
  showUserLocation = true,
  darkMode = false,
  mapStyleType = 'streets',
  initialCenter,
  initialZoom = 13,
}: MapWithDirectionsProps) {
  const { colors } = useTheme();
  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
    serviceMarkers: storeMarkers,
  } = useLocationStore();

  const markers = externalMarkers || storeMarkers;

  const center: [number, number] = useMemo(() => {
    if (initialCenter) return initialCenter;
    if (userLongitude != null && userLatitude != null) return [userLongitude, userLatitude];
    return [3.0588, 36.7538];
  }, [initialCenter, userLongitude, userLatitude]);

  if (isExpoGo || loadError || !MapLibreMap) {
    return (
      <MapFallback
        height={height}
        markers={markers}
        onMarkerPress={onMarkerPress}
        showUserLocation={showUserLocation}
        initialCenter={initialCenter}
        initialZoom={initialZoom}
      />
    );
  }

  return (
    <MapLibreMap
      height={height}
      markers={markers}
      onMarkerPress={onMarkerPress}
      showUserLocation={showUserLocation}
      center={center}
      zoom={initialZoom}
      darkMode={darkMode}
      mapStyleType={mapStyleType}
      destinationLatitude={destinationLatitude}
      destinationLongitude={destinationLongitude}
      colors={colors}
    />
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 16, overflow: 'hidden' },
  fill: { flex: 1 },
  
  // Custom marker styles
  markerContainer: {
    position: 'absolute',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
  },
  userDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },

  // Custom pin styles
  pinWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  pinBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  pinTip: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  pinLabel: {
    position: 'absolute',
    top: -14,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  pinLabelText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontFamily: 'mon-b',
  },

  // Zoom controls styling
  zoomControls: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    gap: 6,
  },
  zoomBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  // Watermark styling
  watermark: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.65,
  },
  watermarkText: {
    fontSize: 8,
    fontFamily: 'mon-sb',
  },
});
