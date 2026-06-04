# RIHLA — Complete Architecture Spec

> Multi-vendor tourism marketplace for Algeria. Think Airbnb × Booking.com × GetYourGuide × Uber Eats.

---

## Vision

RIHLA is a **real-world interactive marketplace** where businesses in Algeria list their services — hotels, restaurants, beaches, rental houses, activities, events, tour guides, photographers, drivers, and curated experiences. Travelers discover, search, and book everything through one app.

### What makes us different

Most apps show a card with a price and a "Book" button.
RIHLA shows:
- **Beaches**: Real satellite map with actual umbrella positions, zones, real-time availability
- **Hotels**: Full rooms, pricing, amenities, availability calendar
- **Restaurants**: Full menus, categories, photos, delivery options
- **Activities**: Schedules, capacity, equipment, guides

---

## Traveler Flow

```
Home Screen (clean, premium)
  → Search Screen (dedicated, full filters)
  → Destination Hub (ALL services for that destination)
    → Category Listings (filtered by type)
      → Listing Detail (full detail with booking)
        → Booking / Payment
          → QR Ticket
            → Review
```

### 1. Home Screen
- Search bar at top → opens dedicated Search screen
- Popular destinations grid
- Featured experiences carousel
- AI travel recommendations
- **NO filters on homepage** — keep it clean

### 2. Search Screen (dedicated route)
- Wilaya filter
- Destination filter
- Category filter (all 10 types)
- Price range
- Rating
- Family Friendly toggle
- VIP toggle
- Availability

### 3. Destination Hub (KEY SCREEN)
When user clicks a destination (e.g., "Constantine"):

**"All" tab shows:**
- ALL 10 marketplace category cards with icons
- Legacy services grid (beach services, desert services, etc.)
- Featured listings

**When user clicks a category tab (e.g., "Restaurants"):**
- Shows ALL restaurants in that destination
- Each restaurant is a listing card with title, rating, price

**When user clicks a specific restaurant:**
- Opens full restaurant detail page

### 4. Listing Detail (polymorphic — different per category)

#### Beach Detail
```
Jijel Beach Club
  → Photos / Video
  → Reviews
  → Services
  → Reserve Spot →
    REAL SATELLITE MAP with actual umbrella positions
    (Google Maps satellite or Mapbox)
    Each umbrella = { lat, lng, price, status }
    Tap umbrella → popup with details → Book
    VIP zones visually highlighted on the map
```

#### Hotel Detail
```
Hotel El Djazair
  → Photos
  → Rooms (types, pricing, availability)
  → Amenities
  → Reviews
  → Availability Calendar
  → Book Stay
```

#### Restaurant Detail
```
Le Saveur de Constantine
  → Photos
  → Menu (categories, items, prices)
  → Reviews
  → Opening Hours
  → Delivery Options
  → Reserve Table
```

#### Activity Detail
```
Tandem Paragliding
  → Photos
  → Schedule / Time Slots
  → Capacity
  → Equipment included
  → Difficulty level
  → Reviews
  → Book Activity
```

#### Event Detail
```
Raï Night Oran
  → Photos
  → Ticket types & pricing
  → Venue info
  → Event timeline
  → Reviews
  → Get Tickets
```

#### Guide Detail
```
Karim — Casbah Expert
  → Bio
  → Languages
  → Certifications
  → Schedule
  → Reviews
  → Book Guide
```

#### Photographer Detail
```
Amina — Beach Photography
  → Portfolio gallery
  → Packages & pricing
  → Turnaround time
  → Drone availability
  → Reviews
  → Book Shoot
```

#### Driver Detail
```
Youcef — Airport Transfers
  → Vehicle info
  → Fixed routes & pricing
  → Per-km rate
  → Airport transfer available
  → Reviews
  → Book Ride
```

#### Experience Detail
```
3-Day Sahara Expedition
  → Day-by-day itinerary
  → Inclusions / Exclusions
  → Departure dates
  → Group size
  → Difficulty
  → Reviews
  → Book Experience
```

#### Rental Detail
```
Villa Oran Seafront
  → Photos
  → Bedrooms / Bathrooms
  → Amenities
  → House rules
  → Availability calendar
  → Reviews
  → Reserve House
```

---

## Beach System (Satellite Map)

This is the KEY differentiator.

### Beach Owner Creates Assets
Each asset has:
```typescript
{
  id: "A12",
  type: "umbrella" | "table" | "chair" | "parking" | "vip" | "family" | "shower" | "powerbank",
  lat: 36.799,
  lng: 5.765,
  price: 1500,  // DZD
  status: "available" | "reserved" | "occupied" | "maintenance",
  zone: "vip" | "family" | "free"
}
```

### Traveler Sees
- Real satellite imagery of the beach
- Assets overlaid on the actual map coordinates
- Tap any umbrella → popup with distance to sea, price, status
- VIP zones highlighted with colored overlays
- Family zone marked
- Reserve in real-time

### Beach Dashboard
- Owner can draw zones on the map (VIP, Family, Free)
- Toggle asset availability
- See real-time occupancy
- Revenue tracking

---

## Business Onboarding (6-step KYC)

| Step | Fields |
|---|---|
| 1. Business Type | Hotel, Restaurant, Beach, Activity, Event, Rental, Guide, Photo, Driver, Experience |
| 2. Business Information | Name, description, phone, email, website |
| 3. Location / Address | Wilaya, city, street address |
| 4. GPS Location | Latitude, longitude (map picker) |
| 5. Identity Verification | National ID, Commercial Register, Tax Info |
| 6. Brand Assets | Logo, cover photo, gallery images |

---

## Business Dashboard (category-aware)

| Category | Dashboard Shows |
|---|---|
| Beach | Spot grid map, reservations, occupancy %, revenue |
| Hotel | Room inventory, bookings calendar, occupancy, revenue |
| Restaurant | Menu management, live orders, prep status, revenue |
| Activity | Schedule, bookings, participant management |
| Event | Ticket sales, attendee list, check-in scanner |
| Guide | Upcoming tours, client messages, earnings |
| Photographer | Portfolio, bookings, earnings |
| Driver | Active routes, ride history, earnings |
| Rental | Calendar, bookings, guest messages |
| Experience | Itinerary, bookings, group management |

---

## AI Travel Assistant

User writes:
```
"I have 3 days in Constantine"
"Budget 30,000 DZD"
```

AI generates:
- Day 1: Hotel check-in → Restaurant lunch → City tour with guide
- Day 2: Activity morning → Restaurant dinner → Event evening
- Day 3: Photography session → Hotel checkout

All recommendations use **real marketplace listings** stored in the platform.

---

## Marketplace Categories (10)

1. **Beach** — Real satellite map with physical assets
2. **Hotel** — Rooms, calendar, amenities
3. **Restaurant** — Menus, photos, reservations
4. **Rental House** — Calendar, amenities, house rules
5. **Activity** — Schedules, capacity, equipment
6. **Event** — Tickets, venue, timeline
7. **Tour Guide** — Bio, languages, schedule
8. **Photographer** — Portfolio, packages
9. **Driver** — Routes, vehicle, pricing
10. **Experience** — Multi-day itineraries

---

## Design System

- **Navy** `#0a2540` — Primary / Trust
- **Teal** `#00a896` — Accent / Action
- **Gold** `#f4a261` — VIP / Highlight
- **Ice White** `#fafbfc` — Background
- **Fonts**: Montserrat (mon, mon-sb, mon-b)
- **Prices**: Always DZD
- **I18n**: en / fr / ar (RTL)

---

## Tech Stack

- Expo SDK 54 + React Native + TypeScript
- Expo Router for navigation
- Zustand for state management
- Supabase for backend (auth, database, realtime)
- Google Maps / Mapbox for satellite beach views
- Chargily for payments
- expo-camera for QR scanning
- expo-location for GPS

---

## Current Status

### ✅ Built
- Design system (SAHEL palette, Montserrat fonts)
- 10-category polymorphic type system
- Mock marketplace data (12 listings)
- Home screen with discovery feed
- Destination Hub with category tabs + listing grid
- Search Screen with full filter suite
- Polymorphic Listing Detail dispatcher (10 categories)
- Filter modal (Zustand store)
- Business dashboard (category-aware panels)
- Partner dashboard
- Beach services (spots, food, order tracking, etc.)
- Desert services (camel, camp, dune buggy, etc.)
- Auth flow (Clerk phone/email)
- KYC onboarding (role select + 3 KYC screens)
- QR scanner (expo-camera)
- GPS geo-fencing
- Toast notifications
- Haptic feedback
- I18n (en/fr/ar)

### 🔴 Next Priority
1. Real beach satellite map system (Google Maps satellite)
2. Hotel detail + room booking flow
3. Restaurant detail + menu + table reservation
4. Activity detail + time slot booking
5. Business KYC (6-step with GPS location picker)
6. Supabase backend foundation
7. AI trip builder
8. Payment integration (Chargily)
