/**
 * SAHEL — Filter Store
 * ─────────────────────
 * Shared filter state for the Discover flow.
 * The filter screen writes to this store; the discover screen reads from it.
 */

import { create } from 'zustand';
import type { GeoRegion, Environment, ServiceCategory } from '@/constants/destinations';

export interface FilterState {
  /** Geo-region filter: East / West / Center / Desert */
  geoRegion: GeoRegion | null;
  /** Landscape environment: beach / desert */
  environment: Environment | null;
  /** Wilaya-level region name */
  region: string | null;
  /** Service category: spots / food / camel_trek / jetski / etc. */
  serviceCategory: ServiceCategory | null;
  /** Price range bounds in DZD */
  priceMin: number;
  /** Max price in DZD */
  priceMax: number;
  /** Minimum guest rating (0 = any) */
  minRating: number;
  /** Whether at least one filter is active */
  hasActiveFilters: boolean;
}

interface FilterActions {
  /** Update a single filter field */
  setField: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  /** Apply multiple fields at once (used when "Apply" is pressed) */
  applyFilters: (filters: Partial<FilterState>) => void;
  /** Reset everything */
  resetAll: () => void;
}

const INITIAL_STATE: FilterState = {
  geoRegion: null,
  environment: null,
  region: null,
  serviceCategory: null,
  priceMin: 0,
  priceMax: 50000,
  minRating: 0,
  hasActiveFilters: false,
};

export const useFilterStore = create<FilterState & FilterActions>((set, get) => ({
  ...INITIAL_STATE,

  setField: (key, value) =>
    set((state) => {
      const next = { ...state, [key]: value };
      return { ...next, hasActiveFilters: computeActive(next) };
    }),

  applyFilters: (filters) =>
    set((state) => {
      const next = { ...state, ...filters };
      return { ...next, hasActiveFilters: computeActive(next) };
    }),

  resetAll: () => set({ ...INITIAL_STATE, hasActiveFilters: false }),
}));

/** Derive hasActiveFilters from the current state */
function computeActive(s: FilterState): boolean {
  return (
    s.geoRegion !== null ||
    s.environment !== null ||
    s.region !== null ||
    s.serviceCategory !== null ||
    s.priceMin > 0 ||
    s.priceMax < 50000 ||
    s.minRating > 0
  );
}

/** Number of active filter chips (for badge count) */
export function activeFilterCount(s: FilterState): number {
  let n = 0;
  if (s.geoRegion) n++;
  if (s.environment) n++;
  if (s.region) n++;
  if (s.serviceCategory) n++;
  if (s.priceMin > 0 || s.priceMax < 50000) n++;
  if (s.minRating > 0) n++;
  return n;
}
