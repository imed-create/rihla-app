/**
 * RIHLA — Clerk ↔ Supabase Auth Bridge
 * ─────────────────────────────────────
 * Makes Supabase RLS trust Clerk authentication.
 *
 * How it works:
 *   - `useClerkSupabaseClient()` creates a Supabase client with a custom
 *     `global.fetch` that injects the Clerk session token as the Bearer
 *     Authorization header on every request.
 *   - Supabase's RLS policies see `auth.uid()` = the Clerk user ID (the `sub` claim).
 *
 * SETUP REQUIRED (one-time):
 *   1. Clerk Dashboard → Integrations → Supabase → Enable → Copy "Issuer URL"
 *   2. Supabase Dashboard → Authentication → Providers → Add provider → Clerk
 *      → Paste the Issuer URL → Save
 *   3. Run the SQL schema (lib/supabase-schema.sql) in Supabase SQL Editor
 *
 * Reference: https://clerk.com/docs/guides/development/integrations/databases/supabase
 */

import { useAuth } from '@clerk/clerk-expo';
import React, { useMemo } from 'react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase credentials missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.\n' +
    'Get credentials at: https://supabase.com/dashboard/project/_/settings/api'
  );
}

// ── Authenticated Supabase Client Hook ──
// Use this in any component that needs RLS-protected data.
//
// Usage:
//   const supabase = useClerkSupabaseClient();
//   const { data } = await supabase.from('listings').select('*');

export function useClerkSupabaseClient(): SupabaseClient {
  const { getToken } = useAuth();

  return useMemo(() => {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: async (url: RequestInfo | URL, options: RequestInit = {}) => {
          // Get the Clerk session token for the 'supabase' template
          const token = await getToken({ template: 'supabase' });
          const headers = new Headers(options.headers);
          if (token) {
            headers.set('Authorization', `Bearer ${token}`);
          }
          return fetch(url, { ...options, headers });
        },
      },
    });
  }, [getToken]);
}

// ── Shortcut: RLS-ready query helpers ──

export async function getUserListings(
  supabase: SupabaseClient,
  userId: string
) {
  return supabase
    .from('listings')
    .select('*')
    .eq('owner_id', userId);
}

export async function getUserBookings(
  supabase: SupabaseClient,
  userId: string
) {
  return supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId);
}

export async function createListing(
  supabase: SupabaseClient,
  userId: string,
  data: Record<string, unknown>
) {
  return supabase
    .from('listings')
    .insert([{ ...data, owner_id: userId }])
    .select();
}
