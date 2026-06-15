/**
 * RIHLA — Beach Food Cart Store (Zustand)
 * -----------------------------------------
 * Persists food cart items, delivery spot, and zone selection
 * across navigation within the beach service stack.
 */

import { create } from 'zustand';

export type FoodCartItem = {
  id: string;
  name: string;
  priceDZD: number;
  qty: number;
};

type FoodCartState = {
  items: FoodCartItem[];
  zone: string | null;
  spotLabel: string | null;
  addItem: (item: Omit<FoodCartItem, 'qty'>) => void;
  adjustItem: (id: string, delta: number) => void;
  clearCart: () => void;
  setZone: (zone: string | null) => void;
  setSpotLabel: (label: string | null) => void;
  totalItems: () => number;
  totalPrice: () => number;
};

export const useFoodCartStore = create<FoodCartState>((set, get) => ({
  items: [],
  zone: null,
  spotLabel: null,

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...item, qty: 1 }] };
    }),

  adjustItem: (id, delta) =>
    set((state) => {
      const updated = state.items
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0);
      return { items: updated };
    }),

  clearCart: () => set({ items: [], zone: null, spotLabel: null }),

  setZone: (zone) => set({ zone }),

  setSpotLabel: (label) => set({ spotLabel: label }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),

  totalPrice: () =>
    get().items.reduce((sum, i) => sum + i.priceDZD * i.qty, 0),
}));
