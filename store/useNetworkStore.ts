/**
 * RIHLA — Partner Network Store
 * ─────────────────────────────
 * Persistent referral partnerships between businesses.
 * Backs the Partner Network screen.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ConnectionStatus = 'pending' | 'accepted' | 'declined';

export interface NetworkConnection {
  /** Listing / provider id of the other business. */
  partnerId: string;
  name: string;
  category: string;
  wilaya: string;
  rating: number;
  status: ConnectionStatus;
  connectedAt: string;
}

interface NetworkState {
  connections: NetworkConnection[];
  connect: (data: Omit<NetworkConnection, 'connectedAt'>) => void;
  disconnect: (partnerId: string) => void;
  setStatus: (partnerId: string, status: ConnectionStatus) => void;
  isConnected: (partnerId: string) => boolean;
  getByStatus: (status: ConnectionStatus) => NetworkConnection[];
}

export const useNetworkStore = create<NetworkState>()(
  persist(
    (set, get) => ({
      connections: [],

      connect: (data) => {
        if (get().connections.some((c) => c.partnerId === data.partnerId)) return;
        const connection: NetworkConnection = { ...data, connectedAt: new Date().toISOString() };
        set((s) => ({ connections: [connection, ...s.connections] }));
      },

      disconnect: (partnerId) => {
        set((s) => ({ connections: s.connections.filter((c) => c.partnerId !== partnerId) }));
      },

      setStatus: (partnerId, status) => {
        set((s) => ({
          connections: s.connections.map((c) => (c.partnerId === partnerId ? { ...c, status } : c)),
        }));
      },

      isConnected: (partnerId) => get().connections.some((c) => c.partnerId === partnerId),

      getByStatus: (status) => get().connections.filter((c) => c.status === status),
    }),
    {
      name: '@rihla_network',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
