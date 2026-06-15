/**
 * RIHLA — Traveler Ride State Machine
 * ────────────────────────────────────
 * Global Zustand store managing the traveler's live ride request lifecycle
 * for Bucket 1 (Rides/Drivers). Session-only — no persistence.
 *
 * Phases: IDLE → SELECTING_ROUTE → BROADCASTING_REQUEST → RECEIVING_BIDS → MATCHED_EN_ROUTE
 */

import { create } from 'zustand';

// ── Types ──

export type RidePhase =
  | 'IDLE'
  | 'SELECTING_ROUTE'
  | 'BROADCASTING_REQUEST'
  | 'RECEIVING_BIDS'
  | 'MATCHED_EN_ROUTE';

export type RideCoordinates = {
  latitude: number;
  longitude: number;
  addressName: string;
};

export type NearbyDriver = {
  driverId: string;
  coordinates: { latitude: number; longitude: number };
  vehicleName: string;
  isOnline: boolean;
};

export type DriverBid = {
  bidId: string;
  driverId: string;
  fullName: string;
  avatarUrl: string;
  rating: number;
  totalTrips: number;
  vehicleInfo: string;
  proposedFareDZD: number;
  etaMinutes: number;
};

export type MatchedDriver = {
  fullName: string;
  phone: string;
  licensePlate: string;
  vehicleModel: string;
  vehicleColor: string;
  currentCoords: { latitude: number; longitude: number };
  pickupEtaMinutes: number;
  rating: number;
};

export type TravelerRideState = {
  // ── Route ──
  pickupCoords: RideCoordinates | null;
  dropoffCoords: RideCoordinates | null;

  // ── Live proximity ──
  nearbyOnlineDrivers: NearbyDriver[];

  // ── Phase machine ──
  searchPhase: RidePhase;

  // ── Fare negotiation ──
  suggestedFareDZD: number;
  userOfferedFareDZD: number;

  // ── Incoming bids ──
  incomingDriverBids: DriverBid[];

  // ── Active match ──
  activeMatchedDriver: MatchedDriver | null;

  // ── Computed helpers ──
  isRideActive: boolean;
  isSheetOpen: boolean;
};

export type TravelerRideActions = {
  // ── Route setters ──
  setPickup: (coords: RideCoordinates | null) => void;
  setDropoff: (coords: RideCoordinates | null) => void;
  clearRoute: () => void;

  // ── Phase transitions ──
  goToSelectingRoute: () => void;
  goToBroadcasting: () => void;
  goToReceivingBids: () => void;
  goToMatched: (driver: MatchedDriver) => void;
  resetToIdle: () => void;

  // ── Fare ──
  setUserOfferedFare: (fareDZD: number) => void;
  setSuggestedFare: (fareDZD: number) => void;

  // ── Bids ──
  addDriverBid: (bid: DriverBid) => void;
  clearBids: () => void;

  // ── Nearby drivers ──
  setNearbyOnlineDrivers: (drivers: NearbyDriver[]) => void;

  // ── Sheet control ──
  openSheet: () => void;
  closeSheet: () => void;

  // ── Full lifecycle ──
  startRideRequest: () => void;
  cancelRideRequest: () => void;
};

// ── Helpers ──

function computeSuggestedFare(pickup: RideCoordinates | null, dropoff: RideCoordinates | null): number {
  if (!pickup || !dropoff) return 0;
  const R = 6371;
  const dLat = ((dropoff.latitude - pickup.latitude) * Math.PI) / 180;
  const dLon = ((dropoff.longitude - pickup.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pickup.latitude * Math.PI) / 180) *
      Math.cos((dropoff.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  const BASE_FARE = 80;
  const PER_KM = 35;
  return Math.round(BASE_FARE + distanceKm * PER_KM);
}

// ── Store ──

const INITIAL_STATE: TravelerRideState = {
  pickupCoords: null,
  dropoffCoords: null,
  nearbyOnlineDrivers: [],
  searchPhase: 'IDLE',
  suggestedFareDZD: 0,
  userOfferedFareDZD: 0,
  incomingDriverBids: [],
  activeMatchedDriver: null,
  isRideActive: false,
  isSheetOpen: false,
};

export const useTravelerRideStore = create<TravelerRideState & TravelerRideActions>((set, get) => ({
  ...INITIAL_STATE,

  // ── Route setters ──

  setPickup: (coords) => {
    set({ pickupCoords: coords });
    const { dropoffCoords } = get();
    if (coords && dropoffCoords) {
      const fare = computeSuggestedFare(coords, dropoffCoords);
      set({ suggestedFareDZD: fare, userOfferedFareDZD: fare });
    }
  },

  setDropoff: (coords) => {
    set({ dropoffCoords: coords });
    const { pickupCoords } = get();
    if (pickupCoords && coords) {
      const fare = computeSuggestedFare(pickupCoords, coords);
      set({ suggestedFareDZD: fare, userOfferedFareDZD: fare });
    }
  },

  clearRoute: () =>
    set({
      pickupCoords: null,
      dropoffCoords: null,
      suggestedFareDZD: 0,
      userOfferedFareDZD: 0,
    }),

  // ── Phase transitions ──

  goToSelectingRoute: () =>
    set({
      searchPhase: 'SELECTING_ROUTE',
      isSheetOpen: true,
      incomingDriverBids: [],
      activeMatchedDriver: null,
    }),

  goToBroadcasting: () =>
    set({ searchPhase: 'BROADCASTING_REQUEST', isSheetOpen: true }),

  goToReceivingBids: () =>
    set({ searchPhase: 'RECEIVING_BIDS', isSheetOpen: true }),

  goToMatched: (driver) =>
    set({
      searchPhase: 'MATCHED_EN_ROUTE',
      activeMatchedDriver: driver,
      isSheetOpen: true,
      incomingDriverBids: [],
    }),

  resetToIdle: () =>
    set({
      ...INITIAL_STATE,
      isSheetOpen: false,
    }),

  // ── Fare ──

  setUserOfferedFare: (fareDZD) => set({ userOfferedFareDZD: fareDZD }),
  setSuggestedFare: (fareDZD) => set({ suggestedFareDZD: fareDZD }),

  // ── Bids ──

  addDriverBid: (bid) =>
    set((state) => ({
      incomingDriverBids: [...state.incomingDriverBids, bid],
    })),

  clearBids: () => set({ incomingDriverBids: [] }),

  // ── Nearby drivers ──

  setNearbyOnlineDrivers: (drivers) => set({ nearbyOnlineDrivers: drivers }),

  // ── Sheet control ──

  openSheet: () => set({ isSheetOpen: true }),
  closeSheet: () => set({ isSheetOpen: false }),

  // ── Full lifecycle ──

  startRideRequest: () => {
    const { pickupCoords, dropoffCoords } = get();
    if (!pickupCoords || !dropoffCoords) return;
    const fare = computeSuggestedFare(pickupCoords, dropoffCoords);
    set({
      searchPhase: 'SELECTING_ROUTE',
      suggestedFareDZD: fare,
      userOfferedFareDZD: fare,
      isSheetOpen: true,
      incomingDriverBids: [],
      activeMatchedDriver: null,
    });
  },

  cancelRideRequest: () =>
    set({
      searchPhase: 'IDLE',
      incomingDriverBids: [],
      activeMatchedDriver: null,
      isSheetOpen: false,
    }),
}));
