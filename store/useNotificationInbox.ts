/**
 * RIHLA — Notification Inbox
 * ──────────────────────────
 * Persistent in-app notification feed for the business and partner
 * workspaces. Push delivery lives in hooks/useNotifications; this store
 * is the readable history and unread state behind it.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type InboxCategory = 'job' | 'payout' | 'review' | 'system' | 'promo';

export interface InboxItem {
  id: string;
  category: InboxCategory;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  /** Optional in-app route to open when tapped. */
  href?: string;
}

interface InboxState {
  items: InboxItem[];
  push: (data: Omit<InboxItem, 'id' | 'createdAt' | 'read'>) => InboxItem;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clearAll: () => void;
  unreadCount: () => number;
  byCategory: (category: InboxCategory) => InboxItem[];
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

export const useNotificationInbox = create<InboxState>()(
  persist(
    (set, get) => ({
      items: [],

      push: (data) => {
        const item: InboxItem = {
          ...data,
          id: uid(),
          createdAt: new Date().toISOString(),
          read: false,
        };
        set((s) => ({ items: [item, ...s.items] }));
        return item;
      },

      markRead: (id) => {
        set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, read: true } : i)) }));
      },

      markAllRead: () => {
        set((s) => ({ items: s.items.map((i) => ({ ...i, read: true })) }));
      },

      remove: (id) => {
        set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
      },

      clearAll: () => set({ items: [] }),

      unreadCount: () => get().items.filter((i) => !i.read).length,

      byCategory: (category) => get().items.filter((i) => i.category === category),
    }),
    {
      name: '@rihla_inbox',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
