import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type BusinessListingStatus = 'draft' | 'published' | 'paused';

export type BusinessType =
  | 'hotel'
  | 'resort'
  | 'restaurant'
  | 'cafe'
  | 'event-venue'
  | 'tour-office'
  | 'other';

export interface BusinessListing {
  id: string;
  name: string;
  businessType: BusinessType;
  city: string;
  address?: string;
  priceFromDzd?: number;
  status: BusinessListingStatus;
  createdAt: string;
  updatedAt: string;
}

interface BusinessListingsState {
  listings: BusinessListing[];
  addListing: (data: Omit<BusinessListing, 'id' | 'createdAt' | 'updatedAt'>) => BusinessListing;
  updateListing: (id: string, updates: Partial<Omit<BusinessListing, 'id' | 'createdAt'>>) => void;
  removeListing: (id: string) => void;
  getListingById: (id: string) => BusinessListing | undefined;
}

function nowIso() {
  return new Date().toISOString();
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const useBusinessListings = create<BusinessListingsState>()(
  persist(
    (set, get) => ({
      listings: [],
      addListing: (data) => {
        const listing: BusinessListing = {
          ...data,
          id: uid(),
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        set((s) => ({ listings: [listing, ...s.listings] }));
        return listing;
      },
      updateListing: (id, updates) => {
        set((s) => ({
          listings: s.listings.map((l) =>
            l.id === id ? { ...l, ...updates, updatedAt: nowIso() } : l
          ),
        }));
      },
      removeListing: (id) => set((s) => ({ listings: s.listings.filter((l) => l.id !== id) })),
      getListingById: (id) => get().listings.find((l) => l.id === id),
    }),
    {
      name: '@tourdz_business_listings',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);

