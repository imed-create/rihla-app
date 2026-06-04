# AGENT.md — RIHLA Master Specification

> Read this entire document before performing any modifications or code generation tasks.

---

## Vision

RIHLA is a **destination-first marketplace** that connects travelers with every service available inside a destination.

> "Choose a destination, then discover and book every verified service, experience, activity, business, and local provider available in that place."

The platform covers all 58 Algerian wilayas.

---

## Traveler Flow

1. Home Screen (clean, search bar + destinations + featured)
2. Search Screen (dedicated, full filters)
3. Destination Hub (ALL services for that destination)
4. Category Listings (filtered by type)
5. Listing Detail (full detail with booking)
6. Booking / Payment
7. QR Ticket
8. Review

---

## Marketplace Categories (10)

1. Beach — Real satellite map with physical assets
2. Hotel — Rooms, calendar, amenities
3. Restaurant — Menus, photos, reservations
4. Rental House — Calendar, amenities, house rules
5. Activity — Schedules, capacity, equipment
6. Event — Tickets, venue, timeline
7. Tour Guide — Bio, languages, schedule
8. Photographer — Portfolio, packages
9. Driver — Routes, vehicle, pricing
10. Experience — Multi-day itineraries

---

## Destination Hub (KEY SCREEN)

Example: User selects CONSTANTINE

Category Grid: Hotels, Restaurants, Activities, Events, Guides, Photography, Transportation, Experiences, Beach Services, Rental Houses

- "All" tab: Shows ALL category cards + legacy services + featured listings
- Category tab: Shows ALL listings of that type in the destination
- Listing card click: Opens full listing detail

---

## Beach System (FLAGSHIP)

Use Google Maps Satellite View or Mapbox. Beach owners draw zones (VIP, Family, Free) on real satellite imagery. Each umbrella, table, parking spot is a real coordinate with lat/lng/price/status.

---

## Business Onboarding (6-Step KYC)

1. Business Type
2. Business Information
3. Location / Address
4. GPS Location (map picker)
5. Identity Verification (ID, Commercial Register, Tax)
6. Brand Assets (Logo, Cover, Gallery)

---

## Business Dashboard (Category-Aware)

Each business type gets a custom dashboard showing relevant metrics.

---

## AI Travel Assistant

Users describe their trip. AI generates day-by-day itineraries using real marketplace listings.

---

## Design System

- Navy #0a2540 — Primary
- Teal #00a896 — Accent
- Gold #f4a261 — VIP
- Ice White #fafbfc — Background
- Montserrat fonts (mon, mon-sb, mon-b)
- All prices in DZD
- I18n: en/fr/ar

---

## Tech Stack

Expo SDK 54 + React Native + TypeScript + Expo Router + Zustand + Supabase + Google Maps/Mapbox + Chargily + expo-camera + expo-location

---

## Current Status

### Built
- Design system (Navy/Teal/Gold, Montserrat)
- 10-category polymorphic type system
- Mock marketplace data (12 listings)
- Home screen with discovery feed
- Destination Hub with category tabs + listing grid
- Search Screen with full filter suite
- Polymorphic Listing Detail (10 category panels)
- Filter modal with Zustand store
- Business & Partner dashboards
- Beach & Desert services
- Auth + KYC flow
- QR scanner + GPS geo-fencing
- Toast + Haptics + I18n

### Next Priority
1. Real beach satellite map system
2. Hotel detail + room booking + availability calendar
3. Restaurant detail + menu + table reservation
4. Activity detail + time slot booking
5. 6-step Business KYC with GPS picker
6. Supabase backend foundation
7. AI trip builder
8. Chargily payment integration
