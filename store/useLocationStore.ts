/**
 * RIHLA — Location Store
 * ────────────────────────
 * Ported from Uber Clone's useLocationStore + useDriverStore.
 * Manages user current location, destination location, and nearby service providers.
 * Uses Zustand with no persist (location is session-only).
 */

import { create } from 'zustand';

export interface ServiceMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  subtitle?: string;
  priceDZD?: number;
  rating?: number;
  imageUrl?: string;
  category: string;
  /** ETA in minutes from user location */
  time?: number;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

export interface LocationState {
  // User current location
  userLatitude: number | null;
  userLongitude: number | null;
  userAddress: string | null;

  // Destination (where the traveler wants to go)
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  destinationAddress: string | null;

  // Origin (pickup point for ride services)
  originLatitude: number | null;
  originLongitude: number | null;
  originAddress: string | null;

  // Nearby service providers (hotels, guides, drivers, beach spots, etc.)
  serviceMarkers: ServiceMarker[];
  selectedMarker: string | null;

  // Actions
  setUserLocation: (params: { latitude: number; longitude: number; address: string }) => void;
  setDestinationLocation: (params: { latitude: number; longitude: number; address: string }) => void;
  setOriginLocation: (params: { latitude: number; longitude: number; address: string }) => void;
  setServiceMarkers: (markers: ServiceMarker[]) => void;
  setSelectedMarker: (id: string | null) => void;
  clearDestination: () => void;
  clearAll: () => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  userLatitude: null,
  userLongitude: null,
  userAddress: null,
  destinationLatitude: null,
  destinationLongitude: null,
  destinationAddress: null,
  originLatitude: null,
  originLongitude: null,
  originAddress: null,
  serviceMarkers: [],
  selectedMarker: null,

  setUserLocation: ({ latitude, longitude, address }) => {
    set({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
    });
    // Clear selected marker when user location changes
    const { selectedMarker } = get();
    if (selectedMarker) set({ selectedMarker: null });
  },

  setDestinationLocation: ({ latitude, longitude, address }) => {
    set({
      destinationLatitude: latitude,
      destinationLongitude: longitude,
      destinationAddress: address,
    });
    const { selectedMarker } = get();
    if (selectedMarker) set({ selectedMarker: null });
  },

  setOriginLocation: ({ latitude, longitude, address }) => {
    set({
      originLatitude: latitude,
      originLongitude: longitude,
      originAddress: address,
    });
  },

  setServiceMarkers: (markers) => set({ serviceMarkers: markers }),

  setSelectedMarker: (id) => set({ selectedMarker: id }),

  clearDestination: () =>
    set({
      destinationLatitude: null,
      destinationLongitude: null,
      destinationAddress: null,
    }),

  clearAll: () =>
    set({
      userLatitude: null,
      userLongitude: null,
      userAddress: null,
      destinationLatitude: null,
      destinationLongitude: null,
      destinationAddress: null,
      originLatitude: null,
      originLongitude: null,
      originAddress: null,
      serviceMarkers: [],
      selectedMarker: null,
    }),
}));
