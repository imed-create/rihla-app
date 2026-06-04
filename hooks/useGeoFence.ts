import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as Location from 'expo-location';
import { AppState, AppStateStatus } from 'react-native';
import { DESTINATIONS, Destination, DestinationType } from '@/constants/destinations';

/** Haversine distance in km between two lat/lng points. */
function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface GeoFenceState {
  /** Current user location (null until obtained) */
  userLocation: Location.LocationObject | null;
  /** Whether location services are being initialized */
  loading: boolean;
  /** Whether the user denied location permission */
  permissionDenied: boolean;
  /** All destinations sorted by distance from user (nearest first) */
  sortedDestinations: Destination[];
  /** Destinations within the given radius_km */
  nearbyDestinations: Destination[];
  /** The nearest destination (null if no location) */
  nearestDestination: Destination | null;
  /** Distance to nearest destination in km */
  nearestDistanceKm: number | null;
  /** Request a fresh location update */
  refreshLocation: () => Promise<void>;
  /** Whether location is currently being refreshed */
  refreshing: boolean;
}

interface UseGeoFenceOptions {
  /** Filter radius in km. Default: 50 */
  radiusKm?: number;
  /** Optional category filter. If set, only destinations of this type are considered */
  categoryFilter?: DestinationType | 'all';
  /** Re-check interval in ms. Default: 60000 (1 min) */
  intervalMs?: number;
}

export function useGeoFence(options: UseGeoFenceOptions = {}): GeoFenceState {
  const { radiusKm = 50, categoryFilter, intervalMs = 60000 } = options;

  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  // Filter destinations by category first
  const categoryFiltered = useMemo(() => {
    if (!categoryFilter || categoryFilter === 'all') return DESTINATIONS;
    return DESTINATIONS.filter((d) => d.type === categoryFilter);
  }, [categoryFilter]);

  const requestLocation = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setPermissionDenied(false);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (mountedRef.current) {
        setUserLocation(location);
        setLoading(false);
        setRefreshing(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  // Initial mount
  useEffect(() => {
    mountedRef.current = true;
    requestLocation(false);
    return () => {
      mountedRef.current = false;
    };
  }, [requestLocation]);

  // Periodic refresh
  useEffect(() => {
    if (intervalMs <= 0) return;
    intervalRef.current = setInterval(() => {
      requestLocation(true);
    }, intervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [intervalMs, requestLocation]);

  // Re-fetch when app comes to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        requestLocation(true);
      }
    });
    return () => sub.remove();
  }, [requestLocation]);

  // Compute distance-sorted destinations
  const sortedDestinations = useMemo(() => {
    if (!userLocation) return categoryFiltered;
    const { latitude, longitude } = userLocation.coords;
    return [...categoryFiltered].sort(
      (a, b) =>
        haversineKm(latitude, longitude, a.lat, a.lng) -
        haversineKm(latitude, longitude, b.lat, b.lng)
    );
  }, [userLocation, categoryFiltered]);

  // Nearby destinations within radius
  const nearbyDestinations = useMemo(() => {
    if (!userLocation) return sortedDestinations;
    const { latitude, longitude } = userLocation.coords;
    return sortedDestinations.filter(
      (d) => haversineKm(latitude, longitude, d.lat, d.lng) <= radiusKm
    );
  }, [sortedDestinations, userLocation, radiusKm]);

  const nearestDestination = sortedDestinations[0] ?? null;

  const nearestDistanceKm = useMemo(() => {
    if (!userLocation || !nearestDestination) return null;
    return Math.round(
      haversineKm(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        nearestDestination.lat,
        nearestDestination.lng
      ) * 10
    ) / 10;
  }, [userLocation, nearestDestination]);

  return {
    userLocation,
    loading,
    permissionDenied,
    sortedDestinations,
    nearbyDestinations,
    nearestDestination,
    nearestDistanceKm,
    refreshLocation: () => requestLocation(true),
    refreshing,
  };
}
