/**
 * RIHLA — Supabase Client
 * ────────────────────────
 * Centralized Supabase client for database, auth, storage, and realtime.
 * Requires SUPABASE_URL and SUPABASE_ANON_KEY in environment.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase credentials missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.\n' +
    'Get credentials at: https://supabase.com/dashboard/project/_/settings/api'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Tables = {
  listings: ReturnType<typeof getListingsQuery>;
  bookings: ReturnType<typeof getBookingsQuery>;
  users: ReturnType<typeof getUsersQuery>;
};

// ── Typed query helpers ──

export function getListingsQuery() {
  return supabase.from('listings').select('*');
}

export function getBookingsQuery() {
  return supabase.from('bookings').select('*');
}

export function getUsersQuery() {
  return supabase.from('users').select('*');
}

// ── Storage buckets ──

export const STORAGE_BUCKETS = {
  listingImages: 'listing-images',
  kycDocuments: 'kyc-documents',
  avatars: 'avatars',
} as const;

export default supabase;
