Read AGENT.md fully before doing anything.

I have an existing React Native + Expo codebase that is built on top of an Airbnb clone open source template. 

FIRST — analyze the entire codebase carefully:
- Read every file in app/, components/, lib/, store/, constants/, hooks/, types/
- Understand the existing navigation structure
- Understand the existing design system (colors, fonts, spacing, components)
- Understand what screens already exist and what's working
- Identify what's broken or incomplete
- Do NOT change anything yet, just analyze and report back with:
  1. What exists and works
  2. What exists but is broken
  3. What is missing completely
  4. The current navigation flow
  5. The current design system (colors, fonts, components)

SECOND — after analysis, we will build SAHEL on top of this codebase with these rules:

## Design Rules
- Keep the Airbnb clone layout structure and navigation patterns
- Replace ALL colors with SAHEL brand palette:
  - Primary: #1a6b5a (Ocean Green)
  - Background: #f8f4ef (Sandy Beige)
  - Accent: #e9a23b (Sunset Gold)
  - Dark: #1a1a1a (Charcoal)
  - White: #ffffff
- Keep the same component structure but reskin everything to SAHEL
- Every screen must feel premium, warm, beach-themed
- All prices in DZD (Algerian Dinar)
- Support Arabic (RTL) + French text

## Screens to Build (in order)
1. Onboarding / Splash screen
2. Login & Register (Supabase auth)
3. Home screen — nearby beaches list + search + filter by zone
4. Beach detail screen — photos, info, spot grid, menu preview
5. Spot booking screen — interactive visual grid (tap to select spot), zone selector (Family/VIP/Free), date picker, auto-cancel warning
6. Food & drinks screen — menu categories, add to cart, quantity controls
7. Cart & checkout screen — order summary, Chargily payment + COD option
8. Order tracking screen — live status (pending → preparing → delivered)
9. My bookings screen — upcoming + past bookings
10. Profile screen — account info, settings, language toggle
11. Explore/Map screen — beaches on map with markers

## Business Owner Dashboard (in the same app, separate tab/flow)
- Same Airbnb clone layout adapted for dashboard
- Overview stats (bookings today, revenue, active orders)
- Spot management — visual grid to set availability
- Incoming orders — live list with accept/reject
- Menu management — CRUD for food & drinks
- Booking management — calendar view

## Service Partner Dashboard (in the same app)
- Same layout as business owner dashboard
- For: massage therapists, game rental, jetski, pedalo, parking, photographer
- Profile setup — service type, price, availability
- Incoming requests — accept/reject
- Earnings tracker

## Interactive Elements Required (make it feel REAL)
- Spot grid — tap to select, visual feedback, taken spots greyed out
- Food menu — smooth add to cart animation, quantity +/- controls
- Order status — animated progress bar (pending → preparing → delivered)
- Map — beach markers with preview cards on tap
- Zone selector — animated tab switch between Family/VIP/Free
- Pull to refresh on all list screens
- Skeleton loading states on all data screens
- Toast notifications for actions (booking confirmed, order placed)
- Haptic feedback on key actions (book, order, pay)
- Smooth page transitions throughout

## Tech Stack
- Expo SDK 54 + React Native + TypeScript
- Expo Router for navigation
- NativeWind v4 for styling
- Zustand for state management
- Supabase for backend (auth, database, realtime)
- Chargily for payments (WebView)
- Resend for emails (server side only)

## Important Rules
- Follow AGENT.md strictly for every decision
- Fix ALL TypeScript errors before finishing any screen
- Every screen must work end to end before moving to next
- Use mock data first, connect to Supabase after UI is complete
- Never break existing working code when adding new screens
- Show me every file created or modified

Start by analyzing the codebase and reporting back. Do NOT write any code yet.

# AGENT.md — SAHEL Core Architectural Blueprint

Read this entire document fully before performing any modifications or code generation tasks. Every file written, styled, or compiled must adhere strictly to these engineering boundaries.

## 1. Project Vision & Architecture
SAHEL is an ultra-premium experience and asset-rental mobile platform optimized for high-volume coastal and desert environments in Algeria. The app handles multiple concurrent businesses, service partners, and thousands of travelers. 

The application forks completely at authentication depending on the user profile metadata role inside the global state:
- **Traveler Role (`client`):** Accesses an elite luxury discovery, reservation matrix, and instant ordering app.
- **Business/Service Partner Role (`provider`):** Accesses an elite B2B operational command dashboard equipped with live telemetry, QR checkout scanners, and asset controllers.

## 2. Elite Mediterranean Design System
We have completely discarded the generic Airbnb coral styling tokens. The visual language of SAHEL must trigger instant high-end holiday psychology. Surfaces must feel immaculate, clean, expansive, and high-fidelity.

### Core Color Palette:
- **Primary / Brand CTA / Business Pro:** `#0a2540` — Deep Nautical Navy (Conveys extreme security, luxury infrastructure, and corporate trust).
- **Vibrant Coastal Accent / Action Icons / Toggles:** `#00a896` — Mediterranean Teal (Represents crystal-clear sea water; used for active touch targets, available spots, and buttons).
- **Highlight / VIP States / Partner Pro:** `#f4a261` — Sun-Kissed Gold (Used for premium VIP zones, countdown hold tickers, and active earnings metrics).
- **Background Canvas:** `#fafbfc` — Ultra-Clean Ice White (Provides expansive breathing room for photography cards).
- **Surface Surfaces / Cards:** `#ffffff` — Pure Surface White.
- **Typography / Text Body:** `#1a1a1a` — Charcoal Black.
- **Border / Asset Matrices:** `#e2e8f0` — Soft Mist Gray.
- **Muted Elements:** `#888888` — Neutral Gray.

### Structural Styling Constraints:
- **No Layout Shifting:** All buttons, sheet alerts, and conditional elements must use strict, explicitly defined dimension boundaries or absolute positions. Erratic layout jumps on component status changes are strictly prohibited.
- **Clean Display Typography:** Strip out all raw, hardcoded multi-language strings from rendering cards. All text layouts must pass cleanly through our central `lib/i18n.ts` dictionary system. No hardcoded Arabic strings or chaotic font overrides.
- **All Prices in DZD:** Every currency value across traveler and business modules must be explicitly labeled and formatted in Algerian Dinar (DZD).
- **Internationalization:** Full language toggle support for Arabic (RTL) and French text layouts.

## 3. High-Velocity Hardware & Core Engineering Components
- **Direct QR Camera Scanner:** The B2B dashboards (`(business)` and `(partner)`) require immediate access to native device video configurations via `expo-camera` to instantly scan and validate ticket passes generated by travelers.
- **GPS Geo-Fencing Canvas:** Integrate `expo-location` to monitor client coordinates. Implement local geometric validation algorithms to filter the available marketplace food, service, and rental catalog displays dynamically, rendering only products hosted by physical vendors occupying the exact beach or region the traveler is sitting on.
- **Real-Time Matrix Locking:** To protect multiple concurrent business tenants, active selections on a 2D matrix must fire a temporary server hold with a live 20-minute visual checkout countdown banner backed by Native `AppState` lifecycle hooks.

## 4. Complete Tech Stack Boundaries
- **Frontend:** Expo SDK 54 + React Native + TypeScript + NativeWind v4 for styling.
- **Routing:** Expo Router for navigation.
- **State Management:** Zustand for local and global state variables.
- **Backend:** Supabase for authentication, database tables, RLS security rules, and real-time triggers.
- **Payments:** Chargily payment gateways integrated using an optimized native WebView.
- **Communications:** Resend engine for server-side transactional email notifications.