/**
 * RIHLA — Partner Dispatches Store
 * ──────────────────────────────────
 * Real, persistent store for partner dispatch accept/decline flows.
 * Powers the beach-club orders, desert-experience expeditions, and partner dispatch screens.
 * Uses AsyncStorage via Zustand persist middleware.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type DispatchStatus = 'pending' | 'accepted' | 'declined' | 'in-progress' | 'completed' | 'cancelled';

export interface PartnerDispatch {
  id: string;
  /** The job/service type: 'beach-order' | 'expedition' | 'delivery' | 'pickup' | 'transfer' */
  jobType: string;
  title: string;
  description?: string;
  customerName: string;
  customerPhone?: string;
  location: string;
  destination?: string;
  scheduledTime: string;
  priceDZD: number;
  status: DispatchStatus;
  /** Extra metadata */
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface PartnerDispatchesState {
  dispatches: PartnerDispatch[];
  addDispatch: (data: Omit<PartnerDispatch, 'id' | 'createdAt' | 'updatedAt'>) => PartnerDispatch;
  updateDispatch: (id: string, updates: Partial<Omit<PartnerDispatch, 'id' | 'createdAt'>>) => void;
  removeDispatch: (id: string) => void;
  acceptDispatch: (id: string) => void;
  declineDispatch: (id: string) => void;
  completeDispatch: (id: string) => void;
  getDispatchById: (id: string) => PartnerDispatch | undefined;
  getDispatchesByStatus: (status: DispatchStatus | DispatchStatus[]) => PartnerDispatch[];
  getPendingCount: () => number;
  getActiveCount: () => number;
}

function nowIso() { return new Date().toISOString(); }

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

export const usePartnerDispatches = create<PartnerDispatchesState>()(
  persist(
    (set, get) => ({
      dispatches: [],

      addDispatch: (data) => {
        const dispatch: PartnerDispatch = {
          ...data,
          id: uid(),
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        set((s) => ({ dispatches: [dispatch, ...s.dispatches] }));
        return dispatch;
      },

      updateDispatch: (id, updates) => {
        set((s) => ({
          dispatches: s.dispatches.map((d) =>
            d.id === id ? { ...d, ...updates, updatedAt: nowIso() } : d
          ),
        }));
      },

      removeDispatch: (id) => set((s) => ({ dispatches: s.dispatches.filter((d) => d.id !== id) })),

      acceptDispatch: (id) => {
        set((s) => ({
          dispatches: s.dispatches.map((d) =>
            d.id === id ? { ...d, status: 'accepted' as const, updatedAt: nowIso() } : d
          ),
        }));
      },

      declineDispatch: (id) => {
        set((s) => ({
          dispatches: s.dispatches.map((d) =>
            d.id === id ? { ...d, status: 'declined' as const, updatedAt: nowIso() } : d
          ),
        }));
      },

      completeDispatch: (id) => {
        set((s) => ({
          dispatches: s.dispatches.map((d) =>
            d.id === id ? { ...d, status: 'completed' as const, updatedAt: nowIso() } : d
          ),
        }));
      },

      getDispatchById: (id) => get().dispatches.find((d) => d.id === id),

      getDispatchesByStatus: (status) => {
        const statuses = Array.isArray(status) ? status : [status];
        return get().dispatches.filter((d) => statuses.includes(d.status));
      },

      getPendingCount: () => get().dispatches.filter((d) => d.status === 'pending').length,

      getActiveCount: () =>
        get().dispatches.filter((d) => d.status === 'accepted' || d.status === 'in-progress').length,
    }),
    {
      name: '@rihla_partner_dispatches',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
