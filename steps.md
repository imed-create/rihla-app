AGENT.md is read. Phase 1 analysis is complete. Now execute Phase 2.

Start in this EXACT order. Complete each step fully before moving to the next. Fix ALL TypeScript errors before moving on.

---

## STEP 1 — SAHEL Rebrand (do this first, everything depends on it)

Update `constants/Colors.ts` — replace ALL Airbnb tokens with SAHEL palette:
- Primary: #1a6b5a (Ocean Green) — replaces #FF385C everywhere
- Background: #f8f4ef (Sandy Beige) — replaces #F7F7F7
- Accent: #e9a23b (Sunset Gold)
- Dark: #1a1a1a (Charcoal)
- Card: #ffffff
- Border: #e8e0d8
- Muted text: #888888
- Beach accent: #0891b2
- Business pro: #1a6b5a (same as primary)
- Partner pro: #e9a23b (same as accent)

Update every file that imports Colors or useColors to use the new tokens.
Update tab bar, buttons, badges, chips, headers — everything.
Do NOT change layout or structure, only colors.

---

## STEP 2 — Fix TypeScript errors

- Exclude `template to use/` folder from tsconfig.json completely
- Fix the Modal missing `onClose` error in `app/(modals)/booking.tsx`
- Create `types/` directory with these files:
  - `types/beach.ts` — Beach, Spot, Zone, Booking types
  - `types/order.ts` — Order, OrderItem, OrderStatus types
  - `types/user.ts` — User, Role, Profile types
  - `types/service.ts` — Service, ServiceType, Availability types
- Replace all inline `any` types with proper types from types/

---

## STEP 3 — Fix broken navigation

In `constants/services.ts` — for every service route that has NO screen yet, add a placeholder screen that shows:
- Service name
- "Coming soon" message  
- SAHEL brand colors
- Back button

This stops the app from crashing when users tap unimplemented services.

---

## STEP 4 — Make Home screen beach-first

Update `app/(tabs)/index.tsx`:
- Default selected category = beach
- Beach destinations appear first in the list
- Hero banner shows beach imagery and "Book your spot today" CTA
- Search bar searches beach names + wilaya
- Keep existing structure, just reorder and refocus

---

## STEP 5 — Global interactive elements (add to ALL screens)

Add these to every screen that loads data:
- Skeleton loading state (use react-native-reanimated pulse animation)
- Pull to refresh
- Empty state with friendly message + icon

Add these globally:
- Toast notification system (create `components/Toast.tsx`) — success/error/info variants in SAHEL colors
- Haptic feedback on: booking confirm, order place, spot select, pay button

---

## STEP 6 — Beach spots screen polish

In `app/services/beach/spots.tsx`:
- Make spot grid fully interactive — tap selects, tap again deselects
- Selected spot = #1a6b5a background, white text
- Taken spot = #e8e0d8 background, #bbb text, not tappable
- Available spot = white background, #1a1a1a text
- Add smooth scale animation on tap (Reanimated)
- 20-minute hold banner must show countdown timer ticking live
- Zone tabs (Family/VIP/Free) with animated underline indicator
- Bottom booking bar shows: selected spot label + price in DZD + "Book Now" button
- Book Now → navigate to `/booking/[id]` with booking data

---

## STEP 7 — Food ordering screen polish

In `app/services/beach/food.tsx`:
- Category tabs (Drinks / Food / Snacks) with animated switch
- Each menu item: emoji/image + name + price in DZD + quantity controls (+/-)
- Add to cart with bounce animation on cart icon
- Floating cart bar at bottom: "X items · XXXX DZD → View Cart"
- Cart screen: item list, quantities, total, "Order Now" button
- Order confirmation → navigate to order tracking screen

---

## STEP 8 — Order tracking screen

Create `app/services/beach/order-tracking.tsx`:
- Animated progress bar: Pending → Preparing → On the way → Delivered
- Each step has icon + label + timestamp
- Auto-advance through states every 30 seconds (mock for now)
- "Contact" button at bottom
- SAHEL brand colors throughout

---

## STEP 9 — Business dashboard connect to traveler data

In `app/(business)/`:
- Stats on home screen must read from `AppContext` bookings (not hardcoded 0)
- Incoming bookings list must show real bookings for that business
- Revenue = sum of confirmed bookings in DZD
- Add accept/reject buttons on incoming bookings
- Add live order list for food orders

---

## STEP 10 — Partner dashboard

In `app/(partner)/`:
- Incoming service requests list (jetski, massage, games etc.)
- Accept/reject with haptic feedback
- Earnings tracker = sum of completed requests in DZD
- Availability toggle (Online/Offline) with colored indicator

---

## Rules for ALL steps:
- SAHEL colors everywhere (#1a6b5a primary, #f8f4ef background, #e9a23b accent)
- All prices in DZD
- No Airbnb coral (#FF385C) anywhere after Step 1
- Fix TypeScript errors as you go
- Show me every file modified
- After each step confirm it works before moving to next step

# STEPS.md — SAHEL Linear Engineering Roadmap

Execute these development cycles sequentially. Fix all TypeScript type warnings and verify local builds compilation parameters before advancing to the following phase.

## Phase 1: Environment Fixes & Design Tokens [CURRENT PHASE]
- [ ] **Step 1.1 — Clean Compiler Bounds:** Exclude the `template to use/` folder explicitly inside `tsconfig.json` to decouple the active build engine from legacy library type crashes.
- [ ] **Step 1.2 — Decentralize Translation Framework:** Rewrite `lib/i18n.ts` to drop buggy `i18n-js` internal helper paths. Implement our custom, responsive lightweight translator module leveraging `expo-localization` and local locale JSON files (`en.json`, `fr.json`, `ar.json`).
- [ ] **Step 1.3 — Apply Mediterranean Palette:** Overhaul `constants/Colors.ts` with the new tokens (`#0a2540` Navy, `#00a896` Teal, `#f4a261` Gold, `#fafbfc` Ice White). Re-route the main tab shell layout parameters (`app/(tabs)/_layout.tsx`) and common components (`components/ConfirmButton.tsx`) to replace all old Airbnb elements.
- [ ] **Step 1.4 — Modal Signature Fix:** Patch the `onClose` callback parameters type declaration error inside `app/(modals)/booking.tsx`.

## Phase 2: Structural Data Types & Core State Hookup
- [ ] **Step 2.1 — Establish Global App Types:** Create a dedicated `types/` directory populated with strongly-typed application modules (`user.ts`, `beach.ts`, `order.ts`, `service.ts`) to kill all implicit 'any' compiler notices.
- [ ] **Step 2.2 — Central Client Context Fork:** Wire global client contexts to track active profiles, shifting between `client` and `provider` modes smoothly using Supabase auth schema outlines.

## Phase 3: Premium Header Re-Layout & Catalog Filters
- [ ] **Step 3.1 — Reconstruct Traveler Discover Header:** Open `app/(tabs)/index.tsx`, refactor the messy top navigation zone into a stable flex-row container. Integrate a left-side Hamburger Menu toggle trigger and a right-side interactive Notification Bell.
- [ ] **Step 3.2 — Multi-Language Card Purge:** Clean up discovery cards by removing raw hardcoded Arabic text lines, running strings through the verified translation dictionary instead. Make the Home screen beach-first with beach destinations appearing first.
- [ ] **Step 3.3 — Integrate Category Filter Engine:** Lift scrolling filter chip mechanics from our reference components directory and wire them into the main home feed state to allow fast destination sorting.

## Phase 4: Native Hardware Integration (Camera & Location)
- [ ] **Step 4.1 — Native QR Scanner Component:** Build `components/pro/ProQRScanner.tsx` utilizing `expo-camera`. Integrate this viewfinder interface into both provider dashboards (`(business)` and `(partner)`) to process client tickets seamlessly.
- [ ] **Step 4.2 — Automated GPS Geo-Fencing:** Activate `expo-location` hooks on traveler home routines. Code localized coordinate radius boundary filters so the visible services catalog dynamically limits itself to the user's immediate physical beach location.

## Phase 5: Smooth Experience Interactions & Skeletons
- [ ] **Step 5.1 — Standardize UI Stability:** Audit components to replace any jumpy layout elements with solid layout bounds or absolute positioning models.
- [ ] **Step 5.2 — Reanimated Loading Skeletons:** Write a global, pulsing animated skeleton loading placeholder using `react-native-reanimated` to mask network data fetching wait times across all list feeds. Add pull-to-refresh and empty states globally.
- [ ] **Step 5.3 — Toast & Haptic Feedbacks:** Create a customized global notification banner engine (`components/Toast.tsx`) with premium integrated haptic response triggers.

## Phase 6: Screen Polish Cycles (Traveler & Provider Dashboards)
- [ ] **Step 6.1 — Beach Spots Matrix:** Polish `app/services/beach/spots.tsx` with a fully interactive grid layout (Selected = Teal, Taken = Gray, Available = White) and include the 20-minute hold live ticking countdown banner.
- [ ] **Step 6.2 — Food Ordering System:** Update `app/services/beach/food.tsx` with category switches, quantity controls, a floating checkout tray bar, and a dedicated cart verification layout screen routing to order confirmations.
- [ ] **Step 6.3 — Order Tracking View:** Create `app/services/beach/order-tracking.tsx` showing a live progress bar mapping states seamlessly from pending through delivery.
- [ ] **Step 6.4 — B2B Dashboards State Hookup:** Connect both business owner and service partner view flows directly to `AppContext` booking data arrays to display live DZD revenue calculations, order toggles, and instant accept/reject inputs.