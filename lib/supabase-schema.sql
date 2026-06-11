-- =====================================================
-- RIHLA — Supabase Database Schema
-- Run this in Supabase SQL Editor after creating project
-- =====================================================
--
-- ── IMPORTANT: Clerk + Supabase JWT Setup ──
-- Before RLS policies work, configure Supabase to trust Clerk JWTs:
--
-- 1. Go to Supabase Dashboard → Project Settings → API → JWT Settings
-- 2. Set JWT Secret to: YOUR_CLERK_PEM_PUBLIC_KEY
--    (Get it from Clerk Dashboard → API Keys → Show JWKS → use the PEM)
-- 3. Alternatively, use Supabase Auth entirely instead of Clerk
--
-- After that, auth.uid() returns the Clerk user ID (e.g. "user_2abc123")
-- which maps directly to our TEXT id column.
-- =====================================================

-- ── USERS TABLE ──
-- id = Clerk user ID (e.g. "user_2abc123def"), NOT a UUID
CREATE TABLE public.users (
  id            TEXT PRIMARY KEY,                   -- Clerk user ID (e.g. "user_2abc123")
  email         TEXT UNIQUE NOT NULL,
  phone         TEXT,
  full_name     TEXT,
  avatar_url    TEXT,
  role          TEXT CHECK (role IN ('traveler', 'business', 'partner')),
  kyc_status    TEXT DEFAULT 'none' CHECK (kyc_status IN ('none', 'submitted', 'approved', 'rejected')),
  kyc_data      JSONB DEFAULT '{}',
  is_onboarded  BOOLEAN DEFAULT FALSE,
  total_visits  INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── LISTINGS TABLE (all marketplace categories) ──
CREATE TABLE public.listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  category        TEXT NOT NULL CHECK (category IN ('hotel','restaurant','beach','rental','activity','event','guide','photographer','driver','experience')),
  title           TEXT NOT NULL,
  description     TEXT,
  wilaya          TEXT NOT NULL,
  region          TEXT,
  price_dzd       INTEGER NOT NULL,
  rating          REAL DEFAULT 0,
  review_count    INTEGER DEFAULT 0,
  is_featured     BOOLEAN DEFAULT FALSE,
  is_vip          BOOLEAN DEFAULT FALSE,
  family_friendly BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  tags            TEXT[] DEFAULT '{}',
  cover_image_url TEXT,
  coordinates     JSONB NOT NULL,                  -- { "latitude": 36.75, "longitude": 3.05 }
  metadata        JSONB DEFAULT '{}',              -- Category-specific fields
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── BOOKINGS TABLE ──
CREATE TABLE public.bookings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id  UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  subtitle    TEXT,
  price       INTEGER NOT NULL,
  status      TEXT DEFAULT 'active' CHECK (status IN ('active','confirmed','pending','completed','cancelled')),
  check_in    DATE,
  check_out   DATE,
  guests      INTEGER DEFAULT 1,
  details     JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  expires_at  TIMESTAMPTZ
);

-- ── REVIEWS TABLE ──
CREATE TABLE public.reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id     TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text        TEXT,
  response    TEXT,                                 -- Owner's response
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── STORAGE BUCKETS ──
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-documents', 'kyc-documents', FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ── INDEXES ──
CREATE INDEX idx_listings_category ON public.listings(category);
CREATE INDEX idx_listings_wilaya ON public.listings(wilaya);
CREATE INDEX idx_listings_coordinates ON public.listings USING GIN (coordinates);
CREATE INDEX idx_bookings_user ON public.bookings(user_id);
CREATE INDEX idx_bookings_listing ON public.bookings(listing_id);
CREATE INDEX idx_reviews_listing ON public.reviews(listing_id);

-- ── ROW LEVEL SECURITY ──
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Users: read own profile (auth.uid() = Clerk user ID after JWT setup)
CREATE POLICY "Users read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users: insert/update own profile
CREATE POLICY "Users insert own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users update own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Listings: anyone can read (public marketplace)
CREATE POLICY "Listings public read" ON public.listings
  FOR SELECT USING (TRUE);

-- Listings: only owner (Clerk user ID) can insert/update/delete
CREATE POLICY "Listings owner write" ON public.listings
  FOR ALL USING (auth.uid() = owner_id);

-- Bookings: user sees their own, owner sees bookings on their listings
CREATE POLICY "Bookings read" ON public.bookings
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() IN (SELECT owner_id FROM public.listings WHERE id = listing_id)
  );

-- Bookings: user can create their own bookings
CREATE POLICY "Bookings insert" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bookings: user can cancel their own bookings
CREATE POLICY "Bookings update own" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Reviews: anyone can read
CREATE POLICY "Reviews public read" ON public.reviews
  FOR SELECT USING (TRUE);

-- Reviews: authenticated users can insert
CREATE POLICY "Reviews insert" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reviews: only author can update their review
CREATE POLICY "Reviews update own" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);
