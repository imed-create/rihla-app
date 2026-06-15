/**
 * RIHLA — MapLibre Map (separate module boundary)
 * This file imports MapLibre at the top level.
 * It's loaded via React.lazy() from MapWithDirections.tsx
 * so if it crashes in Expo Go, the ErrorBoundary catches it.
 */

import React, { useMemo, memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Map, Marker, UserLocation, Camera } from '@maplibre/maplibre-react-native';
import { Ionicons } from '@expo/vector-icons';
import { RIHLA } from '@/constants/theme';
import type { ServiceMarker } from '@/store/useLocationStore';

const MAP_STYLES = {
  dark: 'https://tiles.openfreemap.org/styles/liberty',
  light: 'https://tiles.openfreemap.org/styles/positron',
} as const;

const SATELLITE_STYLE = {
  version: 8,
  sources: {
    'satellite-tiles': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: 'Tiles &copy; Esri &mdash; World Imagery'
    }
  },
  layers: [
    {
      id: 'satellite-layer',
      type: 'raster',
      source: 'satellite-tiles',
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

export function getCategoryPinStyle(category: string): { color: string; icon: string } {
  switch (category) {
    case 'hotel':
      return { color: '#0a2540', icon: 'bed-outline' };
    case 'restaurant':
      return { color: '#c56a39', icon: 'restaurant-outline' };
    case 'beach':
      return { color: '#00a896', icon: 'umbrella-outline' };
    case 'driver':
      return { color: '#000000', icon: 'car-outline' };
    case 'rental':
      return { color: '#6c63ff', icon: 'home-outline' };
    case 'event':
      return { color: '#ef4444', icon: 'musical-notes-outline' };
    case 'guide':
      return { color: '#1a6b3a', icon: 'compass-outline' };
    case 'photographer':
      return { color: '#ff499e', icon: 'camera-outline' };
    case 'experience':
      return { color: '#8b5e3c', icon: 'sparkles-outline' };
    case 'activity':
      return { color: '#E76F51', icon: 'bicycle-outline' };
    default:
      return { color: '#0a2540', icon: 'location-outline' };
  }
}

const ServiceMarkerPin = memo(function ServiceMarkerPin({
  marker,
  onPress,
  cardColor,
}: {
  marker: ServiceMarker;
  onPress: (m: ServiceMarker) => void;
  cardColor: string;
}) {
  const pinStyle = getCategoryPinStyle(marker.category);

  return (
    <Marker
      id={marker.id}
      lngLat={[marker.longitude, marker.latitude]}
      onPress={() => onPress(marker)}
    >
      <View style={[styles.markerPin, { backgroundColor: pinStyle.color, borderColor: cardColor }]}>
        <Ionicons name={pinStyle.icon as any} size={13} color="#fff" />
      </View>
    </Marker>
  );
});

interface MapLibreMapProps {
  height?: number;
  markers: ServiceMarker[];
  onMarkerPress?: (marker: ServiceMarker) => void;
  showUserLocation: boolean;
  center: [number, number];
  zoom: number;
  darkMode: boolean;
  mapStyleType?: 'streets' | 'satellite';
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
  colors: any;
}

export default function MapLibreMap({
  height,
  markers,
  onMarkerPress,
  showUserLocation,
  center,
  zoom,
  darkMode,
  mapStyleType = 'streets',
  destinationLatitude,
  destinationLongitude,
  colors,
}: MapLibreMapProps) {
  const renderedMarkers = useMemo(
    () =>
      markers.map((marker) => (
        <ServiceMarkerPin
          key={marker.id}
          marker={marker}
          onPress={(m) => onMarkerPress?.(m)}
          cardColor={colors.card}
        />
      )),
    [markers, onMarkerPress, colors.card]
  );

  const styleJSON = useMemo(() => {
    if (mapStyleType === 'satellite') {
      return SATELLITE_STYLE;
    }
    return darkMode ? MAP_STYLES.dark : MAP_STYLES.light;
  }, [mapStyleType, darkMode]);

  return (
    <View style={[styles.container, height ? { height } : styles.fill]}>
      <Map
        mapStyle={styleJSON as any}
        style={styles.map}
        compass={false}
        scaleBar={false}
        attribution={false}
        logo={false}
        touchRotate={false}
        touchPitch={false}
      >
        <Camera center={center} zoom={zoom} duration={0} />
        {showUserLocation && <UserLocation />}
        {renderedMarkers}
        {destinationLatitude != null && destinationLongitude != null && (
          <Marker id="destination" lngLat={[destinationLongitude, destinationLatitude]}>
            <View style={styles.destinationPin}>
              <Ionicons name="location" size={18} color="#DC2626" />
            </View>
          </Marker>
        )}
      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 16, overflow: 'hidden' },
  map: { width: '100%', height: '100%' },
  fill: { flex: 1 },
  markerPin: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }, elevation: 4,
  },
  destinationPin: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#FEE2E2',
    borderWidth: 2, borderColor: '#DC2626', alignItems: 'center', justifyContent: 'center',
  },
});

