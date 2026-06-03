import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type PartnerServiceStatus = 'draft' | 'published' | 'paused';

export type PartnerServiceCategory =
  | 'beach'
  | 'desert'
  | 'mountain'
  | 'city'
  | 'historical'
  | 'other';

export interface PartnerService {
  id: string;
  title: string;
  category: PartnerServiceCategory;
  assetType: string; // e.g. jet-ski, buggy, camel...
  pricePerHourDzd: number;
  notes?: string;
  status: PartnerServiceStatus;
  createdAt: string;
  updatedAt: string;
}

interface PartnerServicesState {
  services: PartnerService[];
  addService: (data: Omit<PartnerService, 'id' | 'createdAt' | 'updatedAt'>) => PartnerService;
  updateService: (id: string, updates: Partial<Omit<PartnerService, 'id' | 'createdAt'>>) => void;
  removeService: (id: string) => void;
  getServiceById: (id: string) => PartnerService | undefined;
}

function nowIso() {
  return new Date().toISOString();
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const usePartnerServices = create<PartnerServicesState>()(
  persist(
    (set, get) => ({
      services: [],
      addService: (data) => {
        const service: PartnerService = {
          ...data,
          id: uid(),
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        set((s) => ({ services: [service, ...s.services] }));
        return service;
      },
      updateService: (id, updates) => {
        set((s) => ({
          services: s.services.map((x) =>
            x.id === id ? { ...x, ...updates, updatedAt: nowIso() } : x
          ),
        }));
      },
      removeService: (id) => set((s) => ({ services: s.services.filter((x) => x.id !== id) })),
      getServiceById: (id) => get().services.find((x) => x.id === id),
    }),
    {
      name: '@tourdz_partner_services',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);

