You are an elite Staff Engineer specialized in React Native, Expo Router, Tailwind CSS, TypeScript, and stateful Gluestack UI architectures.

We are replacing the generic business dashboards in our multi-vendor application (RIHLA) with 10 hyper-specific, production-ready SaaS operating dashboards under `app/(business)/dashboards/`. 

CRITICAL ARCHITECTURAL DIRECTIVE: Every dashboard must be treated as a fully interactive E-Commerce Engine. They must NOT be read-only displays. They must implement fully functional local state engines mimicking high-volume CRUD (Create, Read, Update, Delete), dynamic pricing adjustments, live step-by-step order fulfillment pipelines, and localized promotions management.

### GLOBAL ARCHITECTURAL RULES & ROUTING
1. Auto-Route Resolution: Inside `app/(business)/_layout.tsx`, intercept the current context's `businessType`. Render the corresponding domain-specific dashboard dynamically within the master `ProTabShell`.
2. UI Uniformity: Use the existing `ProTopBar` for context headers. Implement high-end scannable layouts with 'bg-slate-50 dark:bg-zinc-950'.
3. Strict TypeScript & Performance: No placeholders or 'any' types. Every button must alter local state arrays or execute operational hooks. All monetary valuations must be formatted explicitly in Algerian Dinar (DZD).

Implement the following dashboards with absolute granular detail:

---

### 1. THE ENTERPRISE HOTEL SAAS PLATFORM (`dashboards/hotel.tsx`)
Tabs: [Overview] [Rooms Matrix] [Order intake] [Yield Engine] [Housekeeping]

- [Overview Tab]: Bento grid displaying occupancy rate %, total daily revenue in DZD, active checkout count, and active guest upsell value.
- [Rooms Matrix (Product CRUD) Tab]: 
  * A master grid of rooms acting as dynamic e-commerce products.
  * Functional "Add Room Type" and "Edit Price" modals. Define variations: Single, Deluxe Suite, VIP Bungalow. 
  * Add individual room status toggles: Available (Green) | Occupied (Red) | Maintenance (Grey).
- [Order Intake (Fulfillment Pipeline) Tab]:
  * Vertical list of active booking orders. Each order shows customer details, check-in/out timestamps, and aggregate DZD cost.
  * State Machine Buttons: [Confirm Booking] ➔ [Check-In Guest] ➔ [Settle & Check-Out].
  * Include an "Add Addon Service" modal to cross-sell other local vendor activities (e.g., cross-selling a local Desert Guide tour directly into room ledger).
- [Yield Engine (Promotions) Tab]:
  * Complete campaign creation wizard. Fields: Promo Code, Discount Percentage, Rule Parameters (e.g., Minimum 3 nights stay), and a toggle to launch the campaign immediately into the RIHLA traveler marketplace.

---

### 2. THE ENTERPRISE RESTAURANT ENGINE (`dashboards/restaurant.tsx`)
Tabs: [Overview] [Live KOT Pipeline] [Menu Manager] [Table Management]

- [Overview Tab]: Shows live cover counts (active diners), gross revenue today, average ticket fulfillment speed (in minutes), and today's top-performing dish.
- [Live KOT (Kitchen Order Ticket) Pipeline Tab]:
  * Column-based ticket workflow handling instant intake orders.
  * Each order lists: Table Number, timestamp elapsed, item list with special custom modifications (e.g., "sans piment").
  * Transactional state selectors: [Accept Order] ➔ [Fire to Kitchen] ➔ [Ready for Server] ➔ [Paid & Settled].
- [Menu Manager (CRUD Matrix) Tab]:
  * Complete product catalog control sorted by subcategories: Entrées, Plats, Desserts, Boissons.
  * For each dish: Input forms for name, description, cost in DZD, preparation time limit, and an instant "Out of Stock" toggle switch that locks the dish instantly across traveler interfaces.
- [Table Management Tab]:
  * Visual floor layout tracking tables. Status colors: Available (Green) | Ordered & Eating (Red) | Reserved (Blue). 

---

### 3. THE HIGH-VOLUME BEACH CLUB CONCESSION (`dashboards/beach-club.tsx`)
Tabs: [Overview] [Spots Grid] [Beach Orders] [Staff Control]

- [Overview Tab]: Active spot occupancy (X out of Y total slots filled), real-time weather integration layout (temperature, wave height tracking, UV index rating), and live pool/beach safety classification markers.
- [Spots Grid Tab]:
  * Renders full 'BeachSandGrid' layout segmented by zone rules: Family Zone, VIP Cabanas, Public Zone.
  * Tapping a spot displays a detailed operational sheet: current occupant name, rental window duration, and a functional button to instantly mark a spot as "Damaged/Maintenance" to prevent future traveler bookings.
- [Beach Orders (Fulfillment) Tab]:
  * Tracks high-speed beach-side ordering pipelines (food, parasols, towels).
  * Orders explicitly link items to specific physical spot locations. Status actions: [Accept] ➔ [Preparing] ➔ [Runner Dispatched] ➔ [Delivered].

---

### 4. THE PARKING & LOGISTICS HUB (`dashboards/parking.tsx`)
Tabs: [Overview] [Spots Control] [Tariff Engine]

- [Overview Tab]: Live capacity metrics, peak traffic warning meters, and aggregate gate receipts today.
- [Spots Control Tab]:
  * Complete license-plate entry matrix tracking vehicles.
  * Manual override control panel allowing managers to release a spot layout or flag parking spaces for special event shuttles.
- [Tariff Engine Tab]:
  * Dynamic operational input adjusting hourly parking rates based on surge pricing or entry time slots.

---

### 5. WATER SPORTS FLEET MANAGEMENT (`dashboards/water-sports.tsx`)
Tabs: [Overview] [Fleet Matrix] [Safety Lockout]

- [Overview Tab]: Active units out at sea, rental clocks tracking remaining durations, and total equipment asset valuation.
- [Fleet Matrix Tab]:
  * Complete product lifecycle overview tracking assets like Jetskis or Pedalos.
  * Tracks specific usage hours. Interactive button to log a unit out of service for mechanical inspection.
- [Safety Lockout Tab]:
  * Real-time sea advisory configuration panel. If an administrator shifts the sea hazard state to "RED (Severe Swell/Wind)", the system triggers local states to automatically freeze and lock all forward water-sports bookings immediately.

---

### 6. WELLNESS & SPA RETREAT OPERATING SYSTEM (`dashboards/wellness.tsx`)
Tabs: [Overview] [Booking Schedule] [Staff Allocation]

- [Overview Tab]: Total treatment rooms utilized, daily booking ledger value, and top therapist ratings.
- [Booking Schedule Tab]:
  * Multi-column chronological timeline management matching customers directly with specialized treatments (e.g., traditional Hammam, massages) and duration blocks.
- [Staff Allocation Tab]:
  * Interactive control matching available certified therapists to incoming custom treatment bookings.

---

### 7. GAMES & GEAR RENTAL CONCESSION (`dashboards/games.tsx`)
Tabs: [Overview] [Inventory CRUD] [Overdue Tracking]

- [Overview Tab]: Active out-on-rent inventory counters, total deposits held securely in escrow, and active risk alerts.
- [Inventory CRUD Tab]:
  * Item matrix trackers for beach sports, ATVs, or volleyball nets. Form actions to modify hourly hire prices or add asset item quantities.
- [Overdue Tracking Tab]:
  * Interactive system highlighting items out past their rental return timestamps. Features an explicit operational button to [Forfeit Security Deposit] or [Mark Returned].

---

### 8. PHOTOGRAPHY & CREATIVE SERVICES HUB (`dashboards/photographer.tsx`)
Tabs: [Overview] [Shoots Ledger] [Digital Delivery]

- [Overview Tab]: Today's confirmed sessions, total assets delivered, and net ratings matrix.
- [Shoots Ledger Tab]:
  * Location-aware booking sheet mapping photo sessions straight to specific beach spots or desert coordinates. States: [Arrived] ➔ [Shooting] ➔ [Processing].
- [Digital Delivery Tab]:
  * High-fidelity operational panel tracking client assets. Includes inputs for secure proofing links and a checkout toggle button to unlock high-res delivery access codes once payments clear.

---

### 9. REGIONAL TOURS & MASS EVENTS ENGINE (`dashboards/events.tsx`)
Tabs: [Overview] [Event Manager] [Gate Check-In]

- [Overview Tab]: Multi-day ticketing run charts, gate attendance velocity meters, and vendor commission tracking.
- [Event Manager Tab]:
  * Full-scale festival or excursion constructor. Fields: Name, Wilaya zone location, capacity configurations, published/draft status switches, and tiered pricing entries (VIP vs Early-bird).
- [Gate Check-In Tab]:
  * Complete terminal simulator managing traveler ticket validations. Fully operational button to check-in ticket codes or manually clear pass holders.

---

### 10. DESERT CAMP & EXPEDITION OPERATING SYSTEM (`dashboards/desert-experience.tsx`)
Tabs: [Overview] [Expeditions Matrix] [Logistics Dispatch]

- [Overview Tab]: Southern encampment occupancy metrics, upcoming departure count timers, and desert asset utilization ratios.
- [Expeditions Matrix Tab]:
  * Full experiential product configuration suite for multi-day Saharan tours (Camel safaris, Dune buggy racing, Stargazing bivouacs). Controls to alter max caravan sizes and safety requirement notes.
- [Logistics Dispatch Tab]:
  * Complex scheduling framework matching off-road 4x4 vehicles, pack animals, and local guides to specific departures, managing resource limits with precision.

---

Execute code generation for all 10 dashboards now. Ensure all actions explicitly mutate state containers or output verbose operational confirmations. Use the existing component framework precisely, and confirm that there are zero TypeScript syntax errors across all output files.