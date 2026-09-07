/**
 * RIHLA — Staff Store
 * ───────────────────
 * Persistent roster for business owners: team members, their role,
 * shift pattern and monthly pay. Backs the Staff Management screen.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type StaffRole = 'manager' | 'reception' | 'operations' | 'kitchen' | 'housekeeping' | 'security' | 'driver';

export type StaffStatus = 'active' | 'on-leave' | 'inactive';

export type ShiftPattern = 'morning' | 'evening' | 'night' | 'flexible';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  phone: string;
  status: StaffStatus;
  shift: ShiftPattern;
  monthlyPayDZD: number;
  startedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface StaffState {
  staff: StaffMember[];
  addStaff: (data: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>) => StaffMember;
  updateStaff: (id: string, updates: Partial<Omit<StaffMember, 'id' | 'createdAt'>>) => void;
  removeStaff: (id: string) => void;
  cycleStatus: (id: string) => void;
  getStaffById: (id: string) => StaffMember | undefined;
  getByStatus: (status: StaffStatus) => StaffMember[];
  getMonthlyPayroll: () => number;
}

const STATUS_CYCLE: Record<StaffStatus, StaffStatus> = {
  active: 'on-leave',
  'on-leave': 'inactive',
  inactive: 'active',
};

function nowIso() { return new Date().toISOString(); }

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

export const useStaffStore = create<StaffState>()(
  persist(
    (set, get) => ({
      staff: [],

      addStaff: (data) => {
        const member: StaffMember = { ...data, id: uid(), createdAt: nowIso(), updatedAt: nowIso() };
        set((s) => ({ staff: [member, ...s.staff] }));
        return member;
      },

      updateStaff: (id, updates) => {
        set((s) => ({
          staff: s.staff.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: nowIso() } : m)),
        }));
      },

      removeStaff: (id) => {
        set((s) => ({ staff: s.staff.filter((m) => m.id !== id) }));
      },

      cycleStatus: (id) => {
        set((s) => ({
          staff: s.staff.map((m) =>
            m.id === id ? { ...m, status: STATUS_CYCLE[m.status], updatedAt: nowIso() } : m
          ),
        }));
      },

      getStaffById: (id) => get().staff.find((m) => m.id === id),

      getByStatus: (status) => get().staff.filter((m) => m.status === status),

      getMonthlyPayroll: () =>
        get().staff.filter((m) => m.status !== 'inactive').reduce((sum, m) => sum + m.monthlyPayDZD, 0),
    }),
    {
      name: '@rihla_staff',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
