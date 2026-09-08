/**
 * RIHLA — Payout Methods
 * ──────────────────────
 * Persistent payout destinations for partners and business owners.
 * Covers the payment rails actually used in Algeria: Algérie Poste CCP,
 * a bank RIB, BaridiMob and cash collection.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type PayoutKind = 'ccp' | 'rib' | 'baridimob' | 'cash';

export type PayoutFrequency = 'weekly' | 'biweekly' | 'monthly';

export interface PayoutMethod {
  id: string;
  kind: PayoutKind;
  /** Account holder name as it appears on the account. */
  holder: string;
  /** CCP/RIB/phone number — stored masked-friendly, never a full card. */
  account: string;
  isDefault: boolean;
  verified: boolean;
  createdAt: string;
}

interface PayoutState {
  methods: PayoutMethod[];
  frequency: PayoutFrequency;
  addMethod: (data: Omit<PayoutMethod, 'id' | 'createdAt' | 'isDefault' | 'verified'>) => PayoutMethod;
  removeMethod: (id: string) => void;
  setDefault: (id: string) => void;
  setFrequency: (frequency: PayoutFrequency) => void;
  getDefault: () => PayoutMethod | undefined;
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

export const usePayoutMethods = create<PayoutState>()(
  persist(
    (set, get) => ({
      methods: [],
      frequency: 'monthly',

      addMethod: (data) => {
        const isFirst = get().methods.length === 0;
        const method: PayoutMethod = {
          ...data,
          id: uid(),
          isDefault: isFirst,
          verified: false,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ methods: [...s.methods, method] }));
        return method;
      },

      removeMethod: (id) => {
        set((s) => {
          const remaining = s.methods.filter((m) => m.id !== id);
          // Never leave the list without a default.
          if (remaining.length > 0 && !remaining.some((m) => m.isDefault)) {
            remaining[0] = { ...remaining[0], isDefault: true };
          }
          return { methods: remaining };
        });
      },

      setDefault: (id) => {
        set((s) => ({ methods: s.methods.map((m) => ({ ...m, isDefault: m.id === id })) }));
      },

      setFrequency: (frequency) => set({ frequency }),

      getDefault: () => get().methods.find((m) => m.isDefault),
    }),
    {
      name: '@rihla_payout_methods',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
