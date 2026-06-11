/**
 * RIHLA — Map With Directions (Uber Style)
 * ────────────────────────────────────────
 * Clean, reliable map component inspired by the Uber template.
 * Uses PROVIDER_DEFAULT (no Google Maps SDK dependency in dev),
 * no refs (avoids the MapView.props.ref crash), mutedStandard map type,
 * and simple marker rendering with no clustering.
 */

import React, { useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  Callout,
  type MapStyleElement,
  type Region,
} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { Ionicons } from '@expo/vector-icons';
import { useLocationStore, type ServiceMarker } from '@/store/useLocationStore';
import { getCategoryDef } from '@/constants/marketplaceCategories';
import { RIHLA } from '@/constants/theme';

const directionsAPI =
  process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY ||
  process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

interface MapWithDirectionsProps {
  height?: number;
  markers?: ServiceMarker[];
  onMarkerPress?: (marker: ServiceMarker) => void;
  showUserLocation?: boolean;
  showDirections?: boolean;
  autoCalculateTimes?: boolean;
  initialRegion?: Region;
  customMapStyle?: MapStyleElement[];
  mapType?: 'standard' | 'mutedStandard' | 'satellite' | 'hybrid';
}

// ── Memoized Marker Pin ──

const ServiceMarkerPin = memo(function ServiceMarkerPin({
  marker,
  onPress,
}: {
  marker: ServiceMarker;
  onPress: (m: ServiceMarker) => void;
}) {
  const catDef = getCategoryDef(marker.category as any);
  const catColor = catDef?.color || RIHLA.primary;

  return (
    <Marker
      coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
      title={marker.title}
      onPress={() => onPress(marker)}
      tracksViewChanges={false}
    >
      <View style={[styles.markerPin, { backgroundColor: catColor }]}>
        <Ionicons name={(catDef?.icon || 'location') as any} size={13} color="#fff" />
      </View>
      <Callout tooltip>
        <View style={styles.calloutCard}>
          <Text style={styles.calloutTitle}>{marker.title}</Text>
          {marker.subtitle && <Text style={styles.calloutSub}>{marker.subtitle}</Text>}
          <View style={styles.calloutRow}>
            {marker.priceDZD != null && (
              <Text style={styles.calloutPrice}>{marker.priceDZD.toLocaleString()} DZD</Text>
            )}
            {marker.rating != null && (
              <Text style={styles.calloutRating}>⭐ {marker.rating}</Text>
            )}
          </View>
        </View>
        <View style={styles.calloutArrow} />
      </Callout>
    </Marker>
  );
});

// ── Main Component ──

export default function MapWithDirections({
  height,
  markers: externalMarkers,
  onMarkerPress,
  showUserLocation = true,
  showDirections = true,
  autoCalculateTimes = true,
  initialRegion,
  customMapStyle,
  mapType = 'mutedStandard',
}: MapWithDirectionsProps) {
  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
    serviceMarkers: storeMarkers,
  } = useLocationStore();

  // Use external markers or store markers
  const markers = externalMarkers || storeMarkers;

  // Memoize markers
  const renderedMarkers = useMemo(
    () =>
      markers.map((marker) => (
        <ServiceMarkerPin
          key={marker.id}
          marker={marker}
          onPress={(m) => onMarkerPress?.(m)}
        />
      )),
    [markers, onMarkerPress]
  );

  // If no user location AND no initial region, use Algeria center as fallback
  const fallbackRegion = useMemo(() => (
    initialRegion || {
      latitude: 36.7538,
      longitude: 3.0588,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
    }
  ), [initialRegion]);

  return (
    <View style={[styles.container, height ? { height } : styles.fill]}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        mapType={mapType}
        customMapStyle={customMapStyle}
        showsPointsOfInterest={false}
        initialRegion={fallbackRegion}
        showsUserLocation={showUserLocation}
        showsCompass
        showsScale
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        tintColor={RIHLA.primary}
        userInterfaceStyle="light"
      >
        {/* Markers */}
        {renderedMarkers}

        {/* Destination marker */}
        {destinationLatitude != null && destinationLongitude != null && (
          <Marker
            coordinate={{ latitude: destinationLatitude, longitude: destinationLongitude }}
            title="Destination"
            tracksViewChanges={false}
          >
            <View style={styles.destinationPin}>
              <Ionicons name="location" size={18} color="#DC2626" />
            </View>
          </Marker>
        )}

        {/* Route directions */}
        {showDirections &&
          userLatitude != null &&
          userLongitude != null &&
          destinationLatitude != null &&
          destinationLongitude != null &&
          directionsAPI && (
            <MapViewDirections
              origin={{ latitude: userLatitude, longitude: userLongitude }}
              destination={{ latitude: destinationLatitude, longitude: destinationLongitude }}
              apikey={directionsAPI}
              strokeColor={RIHLA.primary}
              strokeWidth={3}
            />
          )}
      </MapView>
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  fill: { flex: 1 },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    fontFamily: 'mon',
    color: '#94A3B8',
  },
  markerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  destinationPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calloutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    minWidth: 150,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 14,
    fontFamily: 'mon-b',
    color: '#111827',
  },
  calloutSub: {
    fontSize: 11,
    fontFamily: 'mon',
    color: '#6B7280',
    marginTop: 2,
  },
  calloutRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  calloutPrice: {
    fontSize: 12,
    fontFamily: 'mon-b',
    color: '#059669',
  },
  calloutRating: {
    fontSize: 11,
    fontFamily: 'mon-sb',
    color: '#D97706',
  },
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
});
