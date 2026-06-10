/**
 * RIHLA — Map Utilities
 * ───────────────────────
 * Ported from Uber Clone's lib/map.ts.
 * Calculates map regions, generates service markers, and computes ETAs.
 */

import type { ServiceMarker } from '@/store/useLocationStore';

/**
 * Calculate the optimal map region to show both user and destination.
 * Adds padding so both points are visible.
 */
export function calculateRegion({
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
}) {
  // Default to Algeria center if no location
  if (!userLatitude || !userLongitude) {
    return {
      latitude: 33.5,
      longitude: 3.5,
      latitudeDelta: 13.0,
      longitudeDelta: 13.0,
    };
  }

  // If no destination, center on user location
  if (!destinationLatitude || !destinationLongitude) {
    return {
      latitude: userLatitude,
      longitude: userLongitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }

  const minLat = Math.min(userLatitude, destinationLatitude);
  const maxLat = Math.max(userLatitude, destinationLatitude);
  const minLng = Math.min(userLongitude, destinationLongitude);
  const maxLng = Math.max(userLongitude, destinationLongitude);

  const latitudeDelta = (maxLat - minLat) * 1.5;
  const longitudeDelta = (maxLng - minLng) * 1.5;

  const latitude = (userLatitude + destinationLatitude) / 2;
  const longitude = (userLongitude + destinationLongitude) / 2;

  return {
    latitude,
    longitude,
    latitudeDelta: Math.max(latitudeDelta, 0.02),
    longitudeDelta: Math.max(longitudeDelta, 0.02),
  };
}

/**
 * Generate service markers around a user's location.
 * Adds slight random offsets so markers don't overlap.
 */
export function generateMarkersFromData({
  data,
  userLatitude,
  userLongitude,
}: {
  data: ServiceMarker[];
  userLatitude: number;
  userLongitude: number;
}): ServiceMarker[] {
  return data.map((marker, index) => {
    const latOffset = (Math.random() - 0.5) * 0.008;
    const lngOffset = (Math.random() - 0.5) * 0.008;
    return {
      ...marker,
      latitude: userLatitude + latOffset,
      longitude: userLongitude + lngOffset,
      id: marker.id || `marker-${index}`,
    };
  });
}

/**
 * Calculate ETA and estimated price for each nearby service provider.
 * Uses Google Maps Directions API to compute real drive times.
 */
export async function calculateServiceTimes({
  markers,
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  markers: ServiceMarker[];
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
}): Promise<ServiceMarker[] | undefined> {
  if (
    !userLatitude ||
    !userLongitude ||
    !destinationLatitude ||
    !destinationLongitude
  )
    return;

  const directionsAPI = process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

  try {
    const timesPromises = markers.map(async (marker) => {
      const responseToUser = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${marker.latitude},${marker.longitude}&destination=${userLatitude},${userLongitude}&key=${directionsAPI}`,
      );
      const dataToUser = await responseToUser.json();
      const timeToUser = dataToUser.routes[0]?.legs[0]?.duration?.value || 120; // seconds

      const responseToDestination = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${userLatitude},${userLongitude}&destination=${destinationLatitude},${destinationLongitude}&key=${directionsAPI}`,
      );
      const dataToDestination = await responseToDestination.json();
      const timeToDestination =
        dataToDestination.routes[0]?.legs[0]?.duration?.value || 300; // seconds

      const totalTime = Math.round((timeToUser + timeToDestination) / 60); // minutes
      const price = totalTime * 50; // Base rate: 50 DZD per minute

      return { ...marker, time: totalTime, priceDZD: price };
    });

    return await Promise.all(timesPromises);
  } catch (error) {
    console.error('Error calculating service times:', error);
    return markers.map((m) => ({ ...m, time: 15, priceDZD: m.priceDZD || 500 }));
  }
}

/**
 * Format time from minutes to human-readable string.
 */
export function formatTime(minutes: number): string {
  const formatted = Math.round(minutes);
  if (formatted < 60) {
    return `${formatted} min`;
  }
  const hours = Math.floor(formatted / 60);
  const remaining = formatted % 60;
  return `${hours}h ${remaining}m`;
}
