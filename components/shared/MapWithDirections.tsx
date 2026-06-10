/**
 * RIHLA — Map With Directions
 * ──────────────────────────────
 * Ported from Uber Clone's Map.tsx + RideLayout.tsx.
 * Shows user location, destination, route line, and nearby service provider markers.
 * Used in explore screen, destination hub, and booking flow.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Callout,
  type MapStyleElement,
} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocationStore, type ServiceMarker } from '@/store/useLocationStore';
import { calculateRegion, calculateServiceTimes, formatTime } from '@/lib/map';
import { GOOGLE_MAP_LIGHT_STYLE } from '@/constants/googleMapStyle';
import { getCategoryDef } from '@/constants/marketplaceCategories';
import { RIHLA } from '@/constants/theme';

const directionsAPI = process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

interface MapWithDirectionsProps {
  /** Height of the map container */
  height?: number;
  /** Service provider markers to show on map */
  markers?: ServiceMarker[];
  /** Called when a marker is pressed */
  onMarkerPress?: (marker: ServiceMarker) => void;
  /** Called when the map is ready */
  onMapReady?: () => void;
  /** Whether to show user location dot */
  showUserLocation?: boolean;
  /** Whether to show the route line */
  showDirections?: boolean;
  /** Custom map style */
  customMapStyle?: MapStyleElement[];
  /** If true, auto-calculate ETA for markers */
  autoCalculateTimes?: boolean;
  /** Initial region override */
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  /** Map type */
  mapType?: 'standard' | 'satellite' | 'hybrid';
}

const { width: SCREEN_W } = Dimensions.get('window');



export default function MapWithDirections({
  height,
  markers: externalMarkers,
  onMarkerPress,
  onMapReady,
  showUserLocation = true,
  showDirections = true,
  customMapStyle,
  autoCalculateTimes = true,
  initialRegion,
  mapType = 'standard',
}: MapWithDirectionsProps) {
  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
    serviceMarkers: storeMarkers,
    setServiceMarkers,
    setSelectedMarker,
  } = useLocationStore();

  const [markersWithTimes, setMarkersWithTimes] = useState<ServiceMarker[]>([]);

  // Use external markers or store markers
  const markers = externalMarkers || storeMarkers;

  useEffect(() => {
    if (Array.isArray(markers) && markers.length > 0 && autoCalculateTimes) {
      if (!userLatitude || !userLongitude || !destinationLatitude || !destinationLongitude) {
        setMarkersWithTimes(markers);
        return;
      }
      calculateServiceTimes({
        markers,
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      }).then((updated) => {
        if (updated) {
          setMarkersWithTimes(updated);
          if (!externalMarkers) setServiceMarkers(updated);
        }
      });
    } else {
      setMarkersWithTimes(markers || []);
    }
  }, [markers, userLatitude, userLongitude, destinationLatitude, destinationLongitude, autoCalculateTimes]);

  const region = initialRegion || calculateRegion({
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  });

  const handleMarkerPress = useCallback((marker: ServiceMarker) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMarker(marker.id);
    onMarkerPress?.(marker);
  }, [onMarkerPress, setSelectedMarker]);

  const mapStyle = customMapStyle || (GOOGLE_MAP_LIGHT_STYLE as unknown as MapStyleElement[]);

  // If no location data and no initial region, show loading
  if (!userLatitude && !userLongitude && !initialRegion) {
    return (
      <View style={[styles.loadingContainer, height ? { height } : styles.fill]}>
        <ActivityIndicator size="small" color={RIHLA.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, height ? { height } : styles.fill]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={mapStyle}
        mapType={mapType}
        initialRegion={region}
        showsUserLocation={showUserLocation}
        showsCompass={true}
        showsScale={true}
        rotateEnabled={false}
        pitchEnabled={false}
        onMapReady={onMapReady}
        toolbarEnabled={false}
      >
        {/* Service provider markers */}
        {markersWithTimes.map((marker) => {
          const catDef = getCategoryDef(marker.category as any);
          const catColor = catDef?.color || RIHLA.primary;
          return (
            <Marker
              key={marker.id}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={marker.title}
              onPress={() => handleMarkerPress(marker)}
              tracksViewChanges={false}
            >
              <View style={[styles.markerPin, { backgroundColor: catColor, borderColor: '#fff' }]}>
                <Ionicons
                  name={(catDef?.icon || 'location') as any}
                  size={14}
                  color="#fff"
                />
              </View>
              <Callout tooltip>
                <View style={styles.calloutCard}>
                  <Text style={styles.calloutTitle}>{marker.title}</Text>
                  {marker.subtitle && (
                    <Text style={styles.calloutSub}>{marker.subtitle}</Text>
                  )}
                  <View style={styles.calloutRow}>
                    {marker.time != null && (
                      <Text style={styles.calloutTime}>
                        ⏱ {formatTime(marker.time)}
                      </Text>
                    )}
                    {marker.priceDZD != null && (
                      <Text style={styles.calloutPrice}>
                        {marker.priceDZD.toLocaleString()} DZD
                      </Text>
                    )}
                    {marker.rating != null && (
                      <Text style={styles.calloutRating}>
                        ⭐ {marker.rating}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.calloutArrow} />
              </Callout>
            </Marker>
          );
        })}

        {/* Destination marker */}
        {destinationLatitude && destinationLongitude && (
          <Marker
            coordinate={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            title="Destination"
          >
            <View style={styles.destinationPin}>
              <Ionicons name="location" size={18} color="#DC2626" />
            </View>
          </Marker>
        )}

        {/* Route directions line */}
        {showDirections &&
          userLatitude &&
          userLongitude &&
          destinationLatitude &&
          destinationLongitude && (
            <MapViewDirections
              origin={{
                latitude: userLatitude,
                longitude: userLongitude,
              }}
              destination={{
                latitude: destinationLatitude,
                longitude: destinationLongitude,
              }}
              apikey={directionsAPI!}
              strokeColor={RIHLA.primary}
              strokeWidth={3}
            />
          )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    gap: 8,
  },
  fill: {
    flex: 1,
  },
  loadingText: {
    fontSize: 13,
    fontFamily: 'mon',
    color: '#94A3B8',
  },
  // Service marker pin
  markerPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  // Destination pin
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
  // Callout tooltip
  calloutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    minWidth: 160,
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
  calloutTime: {
    fontSize: 11,
    fontFamily: 'mon-sb',
    color: '#3B82F6',
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
