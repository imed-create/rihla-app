# RIHLA — Codebase Analysis Report

> **Date:** June 6, 2026
> **App Name:** dzdtravelapp (branded as "RIHLA")
> **Stack:** Expo SDK 54 · React Native 0.81.5 · TypeScript 5.9 · Expo Router 6 · Zustand 5

---

## 📊 Summary at a Glance

| Metric | Count |
|---|---|
| **Total Screen Files** | **52** |
| **Total Route Groups** | **13** |
| **Component Files** | **41** |
| **Type Definition Files** | **11** |
| **Zustand Stores** | **5** |
| **Custom Hooks** | **5** |
| **Context Providers** | **2** |
| **Constants/Data Files** | **11** |
| **Locale Files** | **3** (en, fr, ar) |
| **Marketplace Categories** | **10** |
| **Git Commits** | **15+** |

---

## 🗂️ Screen Inventory (52 Screens)

### 1. Tab Navigation (7 screens)
The main traveler-facing tab bar.

| # | Screen | Route File | Purpose |
|---|---|---|---|
| 1 | **Discover / Home** | `(tabs)/index.tsx` | Personalized greeting, search bar, wilaya grid, marketplace categories, destination feed |
| 2 | **Map View** | `(tabs)/map.tsx` | Clustering markers, BeachGridExplorerModal |
| 3 | **Wishlists** | `(tabs)/wishlists.tsx` | Saved favorites, badge count |
| 4 | **My Trips / Bookings** | `(tabs)/bookings.tsx` | Active bookings, countdown timers |
| 5 | **Trips** | `(tabs)/trips.tsx` | Trip history |
| 6 | **Inbox** | `(tabs)/inbox.tsx` | Messages |
| 7 | **Profile** | `(tabs)/profile.tsx` | Avatar, KYC status, settings link |

---

### 2. Business Dashboard (10 screens)
Admin panel for business owners to manage their listings, bookings, and analytics.

| # | Screen | Route File | Purpose |
|---|---|---|---|
| 8 | **Dashboard Home** | `(business)/index.tsx` | Live stats, QR scanner, polymorphic category panels |
| 9 | **Listings** | `(business)/listings.tsx` | CRUD list of business listings |
| 10 | **New Listing** | `(business)/listings/new.tsx` | Create a new listing |
| 11 | **Edit Listing** | `(business)/listings/[id].tsx` | Edit/manage existing listing |
| 12 | **Bookings** | `(business)/bookings.tsx` | Accept/reject bookings |
| 13 | **Orders** | `(business)/orders.tsx` | Live food orders |
| 14 | **Profile** | `(business)/profile.tsx` | Business account info |
| 15 | **Promotions** | `(business)/promotions.tsx` | Promotion management |
| 16 | **Analytics** | `(business)/analytics.tsx` | Revenue charts & stats |
| 17 | **Reviews** | `(business)/reviews.tsx` | Customer review list |

#### Business Sub-Dashboards (6 category-specific panels)
These render **inside** the business dashboard based on business type:

| # | Panel | Route File | Purpose |
|---|---|---|---|
| 18 | **Hotel Dashboard** | `(business)/dashboards/hotel.tsx` | Room inventory, bookings calendar, occupancy |
| 19 | **Restaurant Dashboard** | `(business)/dashboards/restaurant.tsx` | Menu management, live orders, prep status |
| 20 | **Beach Dashboard** | `(business)/dashboards/beach.tsx` | Spot grid map, reservations, occupancy |
| 21 | **Activity Dashboard** | `(business)/dashboards/activity.tsx` | Schedule, participant management |
| 22 | **Event Dashboard** | `(business)/dashboards/event.tsx` | Ticket sales, check-in scanner |
| 23 | **Guide Dashboard** | `(business)/dashboards/guide.tsx` | Upcoming tours, client messages |

#### Business Manage (1 screen)
| # | Screen | Route File | Purpose |
|---|---|---|---|
| 24 | **Manage Category** | `(business)/manage/[category].tsx` | Category-specific management view |

---

### 3. Partner Dashboard (8 screens)
Panel for service partners (drivers, guides, photographers, etc.).

| # | Screen | Route File | Purpose |
|---|---|---|---|
| 25 | **Dashboard Home** | `(partner)/index.tsx` | Live stats, online toggle, QR scanner |
| 26 | **Services** | `(partner)/services.tsx` | Service list, accept/reject |
| 27 | **New Service** | `(partner)/services/new.tsx` | Create a new service |
| 28 | **Edit Service** | `(partner)/services/[id].tsx` | Edit existing service |
| 29 | **Rentals** | `(partner)/rentals.tsx` | Active rentals |
| 30 | **Schedule** | `(partner)/schedule.tsx` | Availability management |
| 31 | **Earnings** | `(partner)/earnings.tsx` | Earnings tracker |
| 32 | **Reviews** | `(partner)/reviews.tsx` | Customer ratings |

---

### 4. Modals (4 screens)
Overlay screens triggered from other screens.

| # | Screen | Route File | Purpose |
|---|---|---|---|
| 33 | **Login** | `(modals)/login.tsx` | Clerk auth (phone/email) |
| 34 | **Settings** | `(modals)/settings.tsx` | App settings |
| 35 | **Filter** | `(modals)/filter.tsx` | Multi-dimensional destination filters |
| 36 | **Booking Modal** | `(modals)/booking.tsx` | Quick booking overlay |

---

### 5. Onboarding & KYC (5 screens)
New user registration flow.

| # | Screen | Route File | Purpose |
|---|---|---|---|
| 37 | **Role Select** | `onboarding/role-select.tsx` | Choose: Traveler / Business / Partner |
| 38 | **KYC — Traveler** | `onboarding/kyc-traveler.tsx` | Traveler identity verification |
| 39 | **KYC — Partner** | `onboarding/kyc-partner.tsx` | Partner identity verification |
| 40 | **KYC — Business** | `onboarding/kyc-business.tsx` | 6-step business onboarding wizard |
| 41 | **KYC — Pending** | `onboarding/kyc-pending.tsx` | Verification pending screen |

---

### 6. Marketplace Category Detail (1 screen, dynamic)
| # | Screen | Route File | Purpose |
|---|---|---|---|
| 42 | **Marketplace Category** | `marketplace/[category].tsx` | Browse listings by marketplace category |

---

### 7. Category Detail Screens (10 screens)
One detail screen per marketplace category — the "polymorphic" listing detail system.

| # | Screen | Route File | Purpose |
|---|---|---|---|
| 43 | **Beach Map** | `beach-map/[id].tsx` | Real satellite map with umbrella/table positions |
| 44 | **Hotel Detail** | `hotel/[id].tsx` | Star rating, rooms, amenities, calendar, booking |
| 45 | **Restaurant Detail** | `restaurant/[id].tsx` | Menu, categories, table reservation, walk-in |
| 46 | **Activity Detail** | `activity/[id].tsx` | Schedule, capacity, equipment, difficulty |
| 47 | **Event Detail** | `event/[id].tsx` | Tickets, venue, timeline |
| 48 | **Guide Detail** | `guide/[id].tsx` | Bio, languages, certifications, schedule |
| 49 | **Photographer Detail** | `photographer/[id].tsx` | Portfolio, packages, turnaround time |
| 50 | **Driver Detail** | `driver/[id].tsx` | Vehicle, routes, per-km rate |
| 51 | **Experience Detail** | `experience/[id].tsx` | Day-by-day itinerary, inclusions |
| 52 | **Rental Detail** | `rental/[id].tsx` | Bedrooms, amenities, calendar, house rules |

---

### 8. Core Screens (3 screens)
| # | Screen | Route File | Purpose |
|---|---|---|---|
| — | **Search** | `search.tsx` | Dedicated search with 10-category chips, wilaya filter, sort |
| — | **Booking Detail** | `booking/[id].tsx` | Status card, countdown, QR code |
| — | **Destination Hub** | `destination/[id].tsx` | Category tabs, listing grid, hero header |
| — | **Wilaya Detail** | `wilaya/[wilayaId].tsx` | Wilaya-specific info and listings |

---

## 🏖️ Beach Services (14 screens)
Deep feature area — the app's flagship differentiator.

| # | Screen | Route File | Purpose |
|---|---|---|---|
| 1 | Spot Grid | `services/beach/spots.tsx` | Interactive grid with ZoneTabs, hold banner, booking |
| 2 | Food & Drinks | `services/beach/food.tsx` | Category tabs, qty controls, cart, order placement |
| 3 | Checkout | `services/beach/checkout.tsx` | Order summary, delivery spot, payment, ETA |
| 4 | Order Tracking | `services/beach/order-tracking.tsx` | 4-step animated progress bar, auto-advance |
| 5 | Parking | `services/beach/parking.tsx` | Zone, plate, duration, 20-min hold |
| 6 | Showers | `services/beach/showers.tsx` | Slot picker, addons |
| 7 | Powerbank | `services/beach/powerbank.tsx` | Capacity tiers, duration |
| 8 | Photos | `services/beach/photos.tsx` | 3 packages |
| 9 | Massage | `services/beach/massage.tsx` | Type, duration |
| 10 | Beach Events | `services/beach/events.tsx` | 3 events, tickets |
| 11 | Games | `services/beach/games.tsx` | VisualSlotGrid |
| 12 | Beach Items | `services/beach/beach-items.tsx` | VisualSlotGrid |
| 13 | Clothes | `services/beach/clothes.tsx` | Outfit, size |
| 14 | Beach Guide | `services/beach/guide.tsx` | Info sections |
| 15 | Beach Hotels | `services/beach/hotels.tsx` | Listing cards |

---

## 🏜️ Desert Services (5 screens)
Secondary feature area for Saharan experiences.

| # | Screen | Route File | Purpose |
|---|---|---|---|
| 1 | Camel Trek | `services/desert/camel.tsx` | Booking |
| 2 | Desert Camp | `services/desert/camp.tsx` | Booking |
| 3 | Dune Buggy | `services/desert/dune-buggy.tsx` | Booking |
| 4 | Desert Guide | `services/desert/desert-guide.tsx` | Booking |
| 5 | Stargazing | `services/desert/stargazing.tsx` | Booking |

---

## 🧩 Component Library (41 components)

### Shared Components (19)
| Component | Purpose |
|---|---|
| `BookingCard.tsx` | Booking display card |
| `CategoryBar.tsx` | Category filter bar |
| `ConfirmButton.tsx` | Action button |
| `CountdownTimer.tsx` | 20-min countdown timer |
| `DesertBookingScreen.tsx` | Desert booking layout |
| `DestinationCard.tsx` | Destination display card |
| `EmptyState.tsx` | Empty state placeholder |
| `Listings.tsx` | Listings display |
| `ListingsBottomSheet.tsx` | Bottom sheet for listings |
| `ListingsMap.tsx` | Map with listing markers |
| `MarketplaceCategoryGrid.tsx` | 10-category grid |
| `ModalHeaderText.tsx` | Modal header styling |
| `SandGrid.tsx` | Sand-themed grid |
| `ServiceCard.tsx` | Service listing card |
| `SkeletonCard.tsx` | Loading skeleton |
| `StackHeader.tsx` | Stack navigation header |
| `Toast.tsx` | Toast notification |
| `TypeBadge.tsx` | Category type badge |
| `ZoneBadge.tsx` | Beach zone badge |

### Beach Components (11)
| Component | Purpose |
|---|---|
| `BeachGridExplorerModal.tsx` | Full grid explorer overlay |
| `BeachSandGrid.tsx` | Sand-themed beach grid |
| `BeachSatelliteMap.tsx` | **Satellite map with coordinate-based pins** |
| `BeachSvgIcons.tsx` | SVG icons for beach assets |
| `DeliverySpotMatrix.tsx` | Delivery spot grid |
| `FoodCartSheet.tsx` | Floating food cart |
| `MassagePavilionGrid.tsx` | Massage pavilion grid |
| `SpotCell.tsx` | Individual spot cell |
| `SpotHoldBanner.tsx` | 20-min hold countdown banner |
| `VisualSlotGrid.tsx` | Visual slot picker |
| `ZoneTabs.tsx` | VIP/Family/Free zone tabs |

### Pro Components (8)
| Component | Purpose |
|---|---|
| `ProCommandDrawer.tsx` | Command palette drawer |
| `ProHubHeader.tsx` | Pro hub header |
| `ProMenuShortcuts.tsx` | Menu shortcuts |
| `ProNavProvider.tsx` | Navigation provider |
| `ProQRScanner.tsx` | **expo-camera QR scanner** |
| `ProScreenChrome.tsx` | Screen chrome wrapper |
| `ProTabShell.tsx` | Tab shell |
| `ProTopBar.tsx` | Top bar |

### Settings Components (3)
| Component | Purpose |
|---|---|
| `SettingsGroup.tsx` | Settings group |
| `SettingsRow.tsx` | Settings row |

---

## 📐 Type System (11 files)

| File | Purpose |
|---|---|
| `types/index.ts` | Central exports |
| `types/app.ts` | App-wide types |
| `types/user.ts` | User, KYC, roles |
| `types/listing.ts` | **Polymorphic listing system** — UI config, 10-category dispatch, interaction modes |
| `types/service.ts` | ServiceVariant union, ServiceVariantOrderFields, type guards |
| `types/booking.ts` | Booking state machine |
| `types/order.ts` | VariantOrderFields per variant, helpers |
| `types/beach.ts` | BeachBooking with grid selection, countdown hold |
| `types/review.ts` | Review types |
| `types/itinerary.ts` | AI itinerary types |
| `types/airbnb-listing.ts` | Legacy AirbnbListing compat |

---

## 🏪 State Management (5 stores + 2 contexts)

### Zustand Stores
| Store | Purpose |
|---|---|
| `useFilterStore.ts` | Multi-dimensional filter state (geoRegion, environment, serviceCategory, region, minRating) |
| `useFavorites.ts` | Wishlist/favorites persistence |
| `useBusinessListings.ts` | Business listings CRUD |
| `usePartnerServices.ts` | Partner services CRUD |
| `useSettingsStore.ts` | App settings |

### Context Providers
| Context | Purpose |
|---|---|
| `AppContext.tsx` | Global app state (user, activeCategory, orders, notifications) |
| `I18nContext.tsx` | Internationalization (en/fr/ar with RTL support) |

---

## 🪝 Custom Hooks (5)

| Hook | Purpose |
|---|---|
| `useBeachOccupancy.ts` | Real-time beach occupancy data |
| `useColors.ts` | Dynamic color token access |
| `useGeoFence.ts` | **GPS geo-fencing** with haversine, periodic refresh |
| `useNotifications.ts` | Push notification handling |
| `useWarmUpBrowser.ts` | Warm up browser for OAuth |

---

## 📦 Constants & Data (11 files)

| File | Purpose |
|---|---|
| `Colors.ts` | SAHEL palette (Navy #0a2540, Teal #00a896, Gold #f4a261) |
| `Styles.ts` | Shared style constants |
| `destinations.ts` | 58 Algerian destinations with geo data, ratings, services |
| `wilayas.ts` | All 58 wilayas with region, emoji, beach/desert flags |
| `mockListings.ts` | **70 mock listings** (7 per category × 10 categories) |
| `marketplaceCategories.ts` | 10 marketplace category definitions |
| `beachLayout.ts` | Beach grid layout constants |
| `foodMenu.ts` | Food & drinks menu data |
| `googleMapStyle.ts` | Map styling config |
| `services.ts` | Service definitions |
| `proNavigation.ts` | Pro navigation config |

---

## 🌐 Localization (3 languages)

| File | Language |
|---|---|
| `locales/en.json` | English |
| `locales/fr.json` | French |
| `locales/ar.json` | Arabic (RTL) |

---

## ⚠️ Complexity Assessment

### Why It Feels Complicated

1. **Multiple Role-Based Dashboards**: The app serves **3 distinct user roles** (Traveler, Business Owner, Partner), each with their own complete dashboard — that's already 3 separate apps in one.

2. **Beach Services Are Deep**: 14 individual beach service screens with complex interactive grids, timers, and checkout flows. This alone is a full app.

3. **Polymorphic Architecture**: The listing detail system handles 10 different categories, each with unique UIs, data shapes, and interactions. This is elegant but adds mental overhead.

4. **Three Dashboard Types**: Business dashboard alone has 10 screens + 6 category-specific sub-dashboards = 16 screens for business owners.

5. **Unfinished Integration Points**: Backend (Supabase) isn't wired yet, so data is mock/AsyncStorage. This means the screens exist but don't talk to each other properly at runtime.

6. **Naming Drift**: The app was originally "SAHEL" (Airbnb clone), then rebranded to "RIHLA" (marketplace), but `app.json` still says "airbnb" and some constants reference SAHEL colors.

---

## 🎯 What's Actually Built vs. What's Planned

### ✅ Fully Built (UI Complete)
- All 7 tab screens
- All 10 business dashboard screens + 6 category panels
- All 8 partner dashboard screens
- All 4 modal screens
- All 5 onboarding/KYC screens
- All 15 beach service screens
- All 5 desert service screens
- All 10 category detail screens
- Destination hub, search, booking detail, wilaya
- 41 components, 5 stores, 5 hooks, 3 locales
- 70 mock listings

### ❌ Not Built Yet (from ARCHITECTURE.md)
- Real backend (Supabase) — all data is mock
- Payment integration (Chargily)
- Real beach satellite map (Google Maps/Mapbox)
- AI trip builder
- RTL layout testing
- NativeWind migration

---

## 📁 Complete File Count

| Directory | Files | Purpose |
|---|---|---|
| `app/` (all screens) | ~80 | Route files + layouts |
| `components/` | 41 | Reusable UI components |
| `constants/` | 11 | Config, data, colors |
| `context/` | 2 | React contexts |
| `hooks/` | 5 | Custom hooks |
| `lib/` | 2 | Utilities (i18n, dashboard) |
| `locales/` | 3 | Translation files |
| `store/` | 5 | Zustand stores |
| `types/` | 11 | TypeScript definitions |
| `utils/` | 3 | Utility functions |
| **TOTAL** | **~163** | |

---

## 🗺️ Navigation Architecture

```
Root Layout (_layout.tsx)
├── (tabs) — Traveler Tab Navigator
│   ├── index — Discover/Home
│   ├── map — Map View
│   ├── wishlists — Wishlists
│   ├── bookings — My Trips
│   ├── trips — Trip History
│   ├── inbox — Messages
│   └── profile — Profile
├── (business) — Business Tab Navigator
│   ├── index — Dashboard
│   ├── listings — Listings CRUD
│   ├── bookings — Booking Management
│   ├── orders — Live Orders
│   ├── profile — Business Profile
│   ├── promotions — Promotions
│   ├── analytics — Analytics
│   ├── reviews — Reviews
│   ├── dashboards/* — Category Panels (6)
│   ├── listings/new — Create Listing
│   ├── listings/[id] — Edit Listing
│   └── manage/[category] — Manage by Category
├── (partner) — Partner Tab Navigator
│   ├── index — Dashboard
│   ├── services — Services CRUD
│   ├── rentals — Active Rentals
│   ├── schedule — Availability
│   ├── earnings — Earnings
│   ├── profile — Partner Profile
│   ├── reviews — Reviews
│   ├── services/new — Create Service
│   └── services/[id] — Edit Service
├── (modals) — Modal Stack
│   ├── login — Auth
│   ├── settings — Settings
│   ├── filter — Filter
│   └── booking — Booking Modal
├── onboarding — KYC Flow
│   ├── role-select — Choose Role
│   ├── kyc-traveler — Traveler KYC
│   ├── kyc-partner — Partner KYC
│   ├── kyc-business — 6-Step Business KYC
│   └── kyc-pending — Pending
├── services/beach/* — Beach Services (14)
├── services/desert/* — Desert Services (5)
├── marketplace/[category] — Marketplace Browse
├── search — Search
├── destination/[id] — Destination Hub
├── booking/[id] — Booking Detail
├── wilaya/[wilayaId] — Wilaya Detail
├── hotel/[id] — Hotel Detail
├── restaurant/[id] — Restaurant Detail
├── beach-map/[id] — Beach Map
├── activity/[id] — Activity Detail
├── event/[id] — Event Detail
├── guide/[id] — Guide Detail
├── photographer/[id] — Photographer Detail
├── driver/[id] — Driver Detail
├── experience/[id] — Experience Detail
└── rental/[id] — Rental Detail
```

---

*This report was auto-generated from codebase analysis. For the latest status, see `docs/STATUS_REPORT.md`.*
