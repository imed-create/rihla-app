/**
 * RIHLA — Business Assets Store
 * ───────────────────────────────
 * Real, persistent store for business owner assets (rooms, menu items, spots, etc.)
 * Uses AsyncStorage via Zustand persist middleware.
 * Each asset belongs to a business type and carries type-specific fields.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { MarketplaceCategory } from '@/types/service';

export interface BusinessAsset {
  id: string;
  businessType: Lowercase<MarketplaceCategory>;
  /** The kind of asset: 'room' | 'menu-item' | 'spot' | 'property' | 'program' | 'event' | 'expedition' | 'package' | 'route' | 'experience' */
  assetKind: string;
  name: string;
  nameAr?: string;
  description?: string;
  priceDZD: number;
  /** Business-type-specific fields stored as JSON */
  fields: Record<string, any>;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BusinessAssetsState {
  assets: BusinessAsset[];
  addAsset: (data: Omit<BusinessAsset, 'id' | 'createdAt' | 'updatedAt'>) => BusinessAsset;
  updateAsset: (id: string, updates: Partial<Omit<BusinessAsset, 'id' | 'createdAt'>>) => void;
  removeAsset: (id: string) => void;
  toggleAvailable: (id: string) => void;
  getAssetById: (id: string) => BusinessAsset | undefined;
  getAssetsByType: (businessType: string) => BusinessAsset[];
  /** Get assets for this business type, optionally filtered by asset kind */
  getMyAssets: (businessType: string, assetKind?: string) => BusinessAsset[];
  /** Total count of assets for a business type */
  getAssetCount: (businessType: string) => number;
  /** Total value of all assets for a business type (sum of priceDZD) */
  getTotalValue: (businessType: string) => number;
  /** Count of available assets */
  getAvailableCount: (businessType: string) => number;
}

function nowIso() { return new Date().toISOString(); }

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

export const useBusinessAssets = create<BusinessAssetsState>()(
  persist(
    (set, get) => ({
      assets: [],

      addAsset: (data) => {
        const asset: BusinessAsset = {
          ...data,
          id: uid(),
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        set((s) => ({ assets: [asset, ...s.assets] }));
        return asset;
      },

      updateAsset: (id, updates) => {
        set((s) => ({
          assets: s.assets.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: nowIso() } : a
          ),
        }));
      },

      removeAsset: (id) => set((s) => ({ assets: s.assets.filter((a) => a.id !== id) })),

      toggleAvailable: (id) => {
        set((s) => ({
          assets: s.assets.map((a) =>
            a.id === id ? { ...a, available: !a.available, updatedAt: nowIso() } : a
          ),
        }));
      },

      getAssetById: (id) => get().assets.find((a) => a.id === id),

      getAssetsByType: (businessType) =>
        get().assets.filter((a) => a.businessType === businessType),

      getMyAssets: (businessType, assetKind) => {
        let filtered = get().assets.filter((a) => a.businessType === businessType);
        if (assetKind) filtered = filtered.filter((a) => a.assetKind === assetKind);
        return filtered;
      },

      getAssetCount: (businessType) =>
        get().assets.filter((a) => a.businessType === businessType).length,

      getTotalValue: (businessType) =>
        get().assets
          .filter((a) => a.businessType === businessType)
          .reduce((sum, a) => sum + a.priceDZD, 0),

      getAvailableCount: (businessType) =>
        get().assets.filter((a) => a.businessType === businessType && a.available).length,
    }),
    {
      name: '@rihla_business_assets',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
