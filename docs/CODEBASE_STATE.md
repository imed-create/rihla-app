# RIHLA — Comprehensive Codebase State & Feature Documentation
> **Current Date:** June 8, 2026  
> **Target Brand:** RIHLA (Tourism Marketplace for Algeria)  
> **Tech Stack:** Expo SDK 54 · React Native 0.81.5 · TypeScript 5.9 · Expo Router 6 · Zustand 5

---

## 🧭 System Architecture & Design System

### 1. Brand Identity & Theme (`constants/theme.ts`)
The application style is centered around the **RIHLA Mediterranean & Saharan palette**, leveraging vibrant dark themes, glassmorphism overlays, and smooth animations.

- **Primary Colors:**
  - `Navy` (`#0a2540`): Primary background overlays, headers, and brand elements representing trust.
  - `Teal` (`#00a896`): Primary action buttons, success state highlights, and navigation highlights.
  - `Gold` (`#f4a261`): Premium VIP zones, stars, highlight details, and Saharan theme accents.
  - `Ice White` (`#fafbfc`): Clean surface fields.
  - `Dark Slate` (`#121214`): Modern dark background.
  - `Glass Accent` (`rgba(255, 255, 255, 0.08)`): Used for card overlays, blurred inputs, and dynamic panels.
- **Typography:** Montserrat (weights: `Montserrat-Regular`, `Montserrat-SemiBold`, `Montserrat-Bold`).
- **Currency:** Algerian Dinar (expressed always as `DZD` or `د.ج`).
- **Localization (`locales/`):** Full translation system in three languages: English (`en`), French (`fr`), and Arabic (`ar`, with RTL layout support).

---

## 🗂️ Consolidated Route Map

The application utilizes **Expo Router** with clean, reduced tab layouts (4 tabs for each user persona/role) and centralized polymorphic detail routes:

```
Root Shell (app/_layout.tsx)
├── (auth) — Auth & Onboarding Flow
│   ├── welcome.tsx             # Immersive welcome/onboarding slide carousel
│   ├── login.tsx               # Redesigned glassmorphic Login/Signup page
│   ├── role-select.tsx         # User type chooser (Traveler, Business, Partner)
│   ├── kyc-traveler.tsx        # Identity validation details for Traveler
│   ├── kyc-partner.tsx         # Identity validation details for Service Partner
│   ├── kyc-business.tsx        # Multi-step (6 steps) KYC wizard for business owners
│   └── kyc-pending.tsx         # Onboarding review status overlay
│
├── (tabs) — Traveler Workspace (4 tabs)
│   ├── index.tsx               # Discover: Wilaya search, 10-category horizontal list, featured grid
│   ├── explore.tsx             # Map-based & list search toggle, markers clustering, area scanning
│   ├── trips.tsx               # Trips: "Active" booking count+cards, and "Past" history switcher
│   └── profile.tsx             # User profile: options to open Wishlists and Inbox stack screens
│
├── (business) — Business Owner Workspace (4 tabs)
│   ├── index.tsx               # Dashboard Home: renders inline sub-dashboards based on type (Hotel, Beach, etc.)
│   ├── listings.tsx            # Listings: CRUD management interface for business offerings
│   ├── bookings.tsx            # Bookings & Orders: accepts/rejects reservations and manages live restaurant orders
│   └── profile.tsx             # Profile Hub: access to nested screens (Analytics, Promotions, Reviews)
│
├── (partner) — Service Partner Workspace (4 tabs)
│   ├── index.tsx               # Dashboard Home: live metrics, toggle availability, QR Scanner modal
│   ├── services.tsx            # Services: listing of assigned services with status filters
│   ├── rentals.tsx             # Rentals: tracking of active gear rentals (tents, camera equipment, etc.)
│   └── profile.tsx             # Profile Hub: access to personal details, schedules, earnings tracking
│
├── listing/[category]/[id].tsx # Polymorphic listing detail page. Dynamically resolves details for:
│                               # - hotel, restaurant, beach-map, activity, event, guide, photographer, driver, experience, rental
│
├── services/                   # Service booking pages
│   ├── beach/                  # 14 Beach-specific tools (spots, food, showers, powerbank, order tracking)
│   └── desert/                 # 5 Saharan tools (camel trek, camp reservation, dune buggy rental)
│
├── search.tsx                  # Dedicated traveler global search screen
├── destination/[id].tsx        # Destination hub showing local listings for the selected Wilaya
└── booking/[id].tsx            # Real-time traveler booking detail screen with QR code validation
```

---

## 🔒 Authentication & Redesigned Onboarding Flow

We recently updated and redesigned the login and welcome screens to follow premium, modern dark-theme designs:

### 1. Welcome Screen (`app/(auth)/welcome.tsx`)
- **Immersive Visuals:** Full-screen gradient backdrop (`#050811` to `#0d1527`) styled with soft glowing background rings.
- **Carousel slider:** Dynamic introduction slides walking through Rihla's value propositions.
- **Quick Demo Selector:** Tappable panel at the bottom of the welcome screen that lets developers bypass authentication by instantly picking from 8 sample roles (Traveler, Beach Club Owner, Restaurant Owner, Desert Camp Owner, Tour Guide Partner, etc.).
- **Smooth transitions:** High-contrast buttons and animated navigation dots.

### 2. Login Screen (`app/(auth)/login.tsx`)
- **Visuals:** Double gradient header backdrop, beautiful typography, and translucent glassmorphism panels.
- **Dynamic Tabs:** Sliding tab indicator for **Sign In** and **Sign Up** selections.
- **Glassmorphic inputs:** Styled with active border states, custom inline icon badges, and validation.
- **Social Login Row:** Beautiful icons for Google, Apple, and Facebook integration.
- **Safe navigation:** Fully checks `router.canGoBack()` before executing `router.back()` to avoid routing loops.

---

## 🏖️ Deep Feature Area: Beach Services System
Rihla's flagship feature is the high-interaction Beach Suite, providing visual real-time reservations for coastal spots:

1. **Spot Grid (`services/beach/spots.tsx`):**
   - Renders interactive layouts of umbrellas, tables, and lounge chairs.
   - Divides assets into **VIP**, **Family**, and **Free** zones via custom tabs with sliding highlights.
   - Spot selections trigger physical device vibration (haptic feedback).
   - Once selected, it starts a **20-minute client-side hold countdown banner** to prevent double-booking.

2. **Food & Drinks Delivery (`services/beach/food.tsx`):**
   - Shows local menus categorizing beverages, grill, snacks, and deserts.
   - Interactive quantity counter buttons with custom animated cart badge.
   - Uses a **Floating FoodCartSheet** to display the current order summary, allowing users to swipe open the cart anytime.

3. **Beach Checkout (`services/beach/checkout.tsx`):**
   - Summary of selected items, dynamic spot/umbrella delivery location input, payment methods (Cash on Delivery / Chargily online payment), and estimated arrival timer.

4. **Order Tracking (`services/beach/order-tracking.tsx`):**
   - Real-time stepper indicator tracking orders: *Placed* ➜ *Preparing* ➜ *On the Way* ➜ *Delivered* with an auto-advancing simulator.

5. **Supplementary Services:**
   - **Parking (`parking.tsx`):** Reserves spaces with license plate configuration and active hold times.
   - **Showers (`showers.tsx`):** Bookable slots with extra addon options (e.g., towels).
   - **Powerbank (`powerbank.tsx`):** Tiers based on power capacity and hourly rental lengths.
   - **Photos (`photos.tsx`):** Booking for photographer shoots.
   - **Massage (`massage.tsx`), Events (`events.tsx`), Games (`games.tsx`), Clothes (`clothes.tsx`):** All fully interactive slot grids or configuration items.

---

## 🏜️ Deep Feature Area: Desert Services System
Tailored experiences for Algeria's Sahara regions, utilizing similar interactive interfaces:

1. **Camel Trek (`services/desert/camel.tsx`):** Duration select, guide options, sunrise/sunset time selector.
2. **Desert Camp (`services/desert/camp.tsx`):** Standard/VIP dome selection, heating options, traditional dinner addons.
3. **Dune Buggy (`services/desert/dune-buggy.tsx`):** CC size selection, safety instructions checkbox, rental period select.
4. **Desert Guide / Stargazing:** Guided experiences with night-sky overlays.

---

## 🧩 Shared Component Library

All components have been reorganized into category directories under `components/`:

### 1. `components/shared/`
- `BookingCard.tsx`: Reusable cards showing traveler bookings, active states, and countdowns.
- `CategoryBar.tsx`: Premium horizontal category filter selector with icons.
- `ConfirmButton.tsx`: Customizable button displaying states for loadings and disabled views.
- `CountdownTimer.tsx`: Visual clock counting down hold limits.
- `EmptyState.tsx`: High-aesthetic layouts containing illustration vectors and actions for empty files.
- `SkeletonCard.tsx`: Shimmering placeholder components displayed during loading actions.
- `Toast.tsx`: Animated slide-down notification banners.

### 2. `components/beach/`
- `BeachGridExplorerModal.tsx`: Expansive grid popup for booking beach chairs or tables.
- `BeachSatelliteMap.tsx`: Simulates overlays of spot markers over real coordinate locations.
- `FoodCartSheet.tsx`: Collapsible bottom panel showing menu items and total cost.
- `SpotCell.tsx`: Colored indicator cell representing the state of beach assets (Available, Selected, Occupied).

### 3. `components/dashboard/`
- `QRScanner.tsx`: Wrapper for `expo-camera` showing crosshair overlay, torch toggle, and validation handlers.
- `ScreenChrome.tsx`: Shell styling for modern dashboard layouts.
- `TopBar.tsx`: Business context header showing user status, notifications, and menu controls.
- *Inline Dashboards:* `HotelDashboard.tsx`, `RestaurantDashboard.tsx`, `BeachDashboard.tsx`, `ActivityDashboard.tsx`, `EventDashboard.tsx`, `GuideDashboard.tsx`.

---

## 🏪 State Management & Custom Hooks

### 1. Zustand Stores (`store/`)
- `useFilterStore.ts`: Tracks multi-dimensional search parameters (region wilayas, price limits, category filters, VIP flags, minimum ratings).
- `useFavorites.ts`: Local persistence for user listing wishlists.
- `useBusinessListings.ts`: CRUD controller for business listings.
- `usePartnerServices.ts`: CRUD controller for partner-allocated services.
- `useSettingsStore.ts`: Theme, language, notifications, and profile details.

### 2. Context Providers (`context/`)
- `AppContext.tsx`: Stores authentication state, active category parameters, live traveler orders, and system notification overlays.
- `I18nContext.tsx`: Tracks English, French, and Arabic locales. Changes text direction (LTR/RTL) dynamically.

### 3. Native Integration Hooks (`hooks/`)
- `useGeoFence.ts`: Computes distances using the Haversine formula, monitoring user position against listed coordinates to trigger proximity markers or distance indicators.
- `useColors.ts`: Exposes active theme tokens dynamically according to light/dark styles.

---

## 🔧 Database Models & Storage (Current vs Supabase Integration)

Currently, the app stores dynamic data in `AsyncStorage` and mock JSON. Below is the mapping for the proposed Supabase database migration:

```sql
-- Profiles table mapping roles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  role TEXT CHECK (role IN ('traveler', 'business', 'partner')),
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('unverified', 'pending', 'verified')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- Polymorphic Listings
CREATE TABLE listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'hotel', 'restaurant', 'beach', etc.
  wilaya TEXT NOT NULL,
  location_gps POINT NOT NULL,
  price_base NUMERIC NOT NULL,
  rating NUMERIC DEFAULT 5.0,
  metadata JSONB DEFAULT '{}'::jsonb, -- dynamic attributes per category
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bookings table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  traveler_id UUID REFERENCES profiles(id),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  total_price NUMERIC NOT NULL,
  verification_qr_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

---
*Ready for prompt updates.*
