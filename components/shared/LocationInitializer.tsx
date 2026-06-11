/**
 * RIHLA — Location Initializer
 * ─────────────────────────────
 * Runs once on app mount to detect the user's GPS location
 * and set it in useLocationStore. This is the root cause of
 * all map issues — without this, userLatitude/userLongitude
 * stay null forever and MapWithDirections shows "Loading...".
 */

import { useEffect } from 'react';
import * as Location from 'expo-location';
import { useLocationStore } from '@/store/useLocationStore';

export default function LocationInitializer() {
  const setUserLocation = useLocationStore((s) => s.setUserLocation);

  useEffect(() => {
    let mounted = true;

    const detect = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted' || !mounted) return;

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!mounted) return;

        // Reverse geocode to get address
        let address = 'Current location';
        try {
          const [result] = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
          if (result) {
            const parts = [result.name, result.city, result.region].filter(Boolean);
            address = parts.join(', ') || 'Current location';
          }
        } catch { /* reverse geocode is best-effort */ }

        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          address,
        });
      } catch {
        // Location detection failed silently — maps will use fallback regions
      }
    };

    detect();

    return () => { mounted = false; };
  }, [setUserLocation]);

  return null; // renders nothing
}
