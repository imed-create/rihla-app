/**
 * RIHLA — Asset Inventory Store
 * ───────────────────────────────
 * Real, persistent store for business asset inventory management.
 * Powers the games inventory CRUD, water-sports fleet, and parking spot management.
 * Uses AsyncStorage via Zustand persist middleware.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type InventoryStatus = 'available' | 'rented' | 'maintenance' | 'reserved' | 'damaged';

export interface InventoryItem {
  id: string;
  businessType: string;
  /** Category: 'sports' | 'water' | 'atv' | 'camping' | 'indoor' | 'cycling' | 'parking' | 'fleet' */
  category: string;
  name: string;
  description?: string;
  /** Total quantity owned */
  totalQuantity: number;
  /** Currently rented out */
  rentedQuantity: number;
  pricePerHourDZD: number;
  depositDZD: number;
  status: InventoryStatus;
  /** Maintenance notes if applicable */
  notes?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

interface AssetInventoryState {
  items: InventoryItem[];
  addItem: (data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => InventoryItem;
  updateItem: (id: string, updates: Partial<Omit<InventoryItem, 'id' | 'createdAt'>>) => void;
  removeItem: (id: string) => void;
  toggleStatus: (id: string, status: InventoryStatus) => void;
  rentItem: (id: string, quantity?: number) => void;
  returnItem: (id: string, quantity?: number) => void;
  getItemById: (id: string) => InventoryItem | undefined;
  getItemsByBusinessType: (businessType: string) => InventoryItem[];
  getItemsByCategory: (category: string) => InventoryItem[];
  getAvailableItems: (businessType: string) => InventoryItem[];
  getOverdueCount: () => number;
  getTotalInventoryValue: (businessType: string) => number;
}

function nowIso() { return new Date().toISOString(); }

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

export const useAssetInventory = create<AssetInventoryState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (data) => {
        const item: InventoryItem = {
          ...data,
          id: uid(),
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        set((s) => ({ items: [item, ...s.items] }));
        return item;
      },

      updateItem: (id, updates) => {
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, ...updates, updatedAt: nowIso() } : i
          ),
        }));
      },

      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

      toggleStatus: (id, status) => {
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, status, updatedAt: nowIso() } : i
          ),
        }));
      },

      rentItem: (id, quantity = 1) => {
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  rentedQuantity: Math.min(i.totalQuantity, i.rentedQuantity + quantity),
                  status: i.rentedQuantity + quantity >= i.totalQuantity ? 'rented' : i.status,
                  updatedAt: nowIso(),
                }
              : i
          ),
        }));
      },

      returnItem: (id, quantity = 1) => {
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  rentedQuantity: Math.max(0, i.rentedQuantity - quantity),
                  status: 'available',
                  updatedAt: nowIso(),
                }
              : i
          ),
        }));
      },

      getItemById: (id) => get().items.find((i) => i.id === id),

      getItemsByBusinessType: (businessType) =>
        get().items.filter((i) => i.businessType === businessType),

      getItemsByCategory: (category) => get().items.filter((i) => i.category === category),

      getAvailableItems: (businessType) =>
        get().items.filter((i) => i.businessType === businessType && i.rentedQuantity < i.totalQuantity),

      getOverdueCount: () => get().items.filter((i) => i.status === 'maintenance').length,

      getTotalInventoryValue: (businessType) =>
        get()
          .items.filter((i) => i.businessType === businessType)
          .reduce((sum, i) => sum + i.pricePerHourDZD * i.totalQuantity, 0),
    }),
    {
      name: '@rihla_asset_inventory',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
