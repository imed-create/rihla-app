# RIHLA — Marketplace Architecture

> Multi-vendor tourism marketplace for Algeria. Think Airbnb × Booking.com × GetYourGuide.

---

## Vision

RIHLA is NOT a beach booking app. It is a **polymorphic multi-vendor marketplace** where any business in Algeria can list their services — hotels, restaurants, beach spots, rental houses, activities, events, tour guides, photographers, drivers, and curated experiences.

## Core Marketplace Categories

| Category | Icon | Interaction Model | Example |
|---|---|---|---|
| Hotels | bed-outline | Date-range calendar + room selector | "Riad Yasmine, Algiers" |
| Restaurants | restaurant-outline | Menu browser + table reservation | "Le Saveur, Constantine" |
| Beaches | umbrella-outline | Interactive spot grid + zone tabs | "Sidi Fredj Family Zone" |
| Rental Houses | home-outline | Date-range calendar + amenity filter | "Villa Oran Seafront" |
| Activities | bicycle-outline | Time-slot queue + participant picker | "Paragliding Djurdjura" |
| Events | musical-notes-outline | Ticket quantity + date picker | "Raï Night Oran" |
| Tour Guides | compass-outline | Schedule picker + review display | "Casbah Walking Tour" |
| Photographers | camera-outline | Package selector + time-slot | "Sunset Shoot Tipaza" |
| Drivers | car-outline | Route picker + duration | "Algiers Airport Transfer" |
| Experiences | sparkles-outline | Itinerary builder + group size | "3-Day Sahara Expedition" |

## Traveler Flow

```
Home Screen (premium discovery)
  → Search Screen (dedicated, full filters)
  → Destination Hub (category tabs per destination)
    → Listing Detail (polymorphic dispatcher)
      → Booking / Payment
        → QR Ticket
          → Review
```

### 1. Home Screen
- Premium Airbnb-inspired hero
- Search bar at top (navigates to Search Screen)
- Popular destinations grid
- Featured experiences carousel
- "Complete Tour of Algeria" curated section
- AI travel recommendations

### 2. Search Screen (dedicated route)
- Destination, Wilaya, Category filters
- Price Range slider
- Rating filter
- Family Friendly toggle
- VIP toggle
- Availability date picker
- Sort: Recommended, Price, Rating, Distance

### 3. Destination Hub
Example: "Constantine"
- Category tabs: Hotels | Restaurants | Activities | Events | Guides
- Each tab loads marketplace listings from that category
- Active filter pills
- Results count

### 4. Listing Detail
Polymorphic dispatcher — checks listing.category and renders:
- Hotels: Room photos, amenity list, calendar picker, room type selector
- Restaurants: Menu, photos, table reservation, reviews
- Beaches: Interactive spot grid, zone tabs, countdown hold
- Activities: Time slots, participant count, guide info
- Events: Ticket types, date, venue map
- Guides: Bio, languages, schedule, reviews
- Photographers: Portfolio, packages, availability
- Drivers: Routes, vehicle type, pricing
- Experiences: Multi-day itinerary, inclusions, group size

### 5. Booking → Payment → QR Ticket → Review
Unified booking flow across all categories.

## Business Onboarding (5-step KYC)

| Step | Fields |
|---|---|
| 1. Business Type | Category selector (Hotel, Restaurant, Beach, etc.) |
| 2. Business Information | Name, description, phone, email, website |
| 3. Location | Wilaya, address, GPS coordinates |
| 4. Verification Documents | National ID, Commercial Register, Tax Info |
| 5. Brand Assets | Logo, cover photo, gallery images |

## Business Dashboard (category-aware)

| If Category | Dashboard Shows |
|---|---|
| Hotels | Room inventory, reservations calendar, occupancy rate, revenue |
| Restaurants | Menu management, live orders, prep status, revenue |
| Beaches | Spot grid control, reservation queue, occupancy map |
| Activities | Schedule, bookings, participant management |
| Events | Ticket sales, attendee list, check-in scanner |
| Guides | Upcoming tours, client messages, earnings |
| Drivers | Active routes, ride history, earnings |

## Design System (unchanged)

- **Navy** `#0a2540` — Primary / Trust
- **Teal** `#00a896` — Accent / Action
- **Gold** `#f4a261` — VIP / Highlight
- **Ice White** `#fafbfc` — Background
- **Fonts**: Montserrat (mon, mon-sb, mon-b)
- **Prices**: Always DZD
- **I18n**: en / fr / ar (RTL)

## File Structure

```
app/
├── (tabs)/
│   ├── index.tsx          # Home Screen (premium discovery)
│   ├── map.tsx            # Map View
│   ├── wishlists.tsx      # Saved listings
│   ├── bookings.tsx       # My bookings
│   ├── inbox.tsx          # Messages
│   └── profile.tsx        # Profile
├── (modals)/
│   ├── login.tsx
│   ├── settings.tsx
│   └── filter.tsx         # Dedicated search/filter
├── search.tsx             # Search Screen
├── destination/
│   └── [id].tsx           # Destination Hub
├── listing/
│   └── [id].tsx           # Polymorphic Listing Detail
├── booking/
│   └── [id].tsx           # Booking Detail + QR Ticket
├── (business)/            # Business Dashboard (category-aware)
├── (partner)/             # Service Partner Dashboard
└── onboarding/            # 5-step business KYC
```
