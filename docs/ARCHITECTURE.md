# RIHLA — Full Platform Architecture
## Every Service Category, Every Flow, Every Screen

---

## 🎯 Vision
RIHLA is a **multi-service travel marketplace** for Algeria where every category has its own perfect UX flow — like having Booking.com + Airbnb + Uber + TripAdvisor in one app.

---

## 📊 Category-by-Category Architecture

### 1. 🏨 HOTELS → Booking.com Style
**Interaction Mode:** `date_range_picker`
**What Exists:** Basic listing detail, checkout form
**What Needs Building:**
- **Provider Profile**: Hotel photos gallery (carousel), video walkthrough, star rating, amenities grid
- **Room Selector**: Horizontal room type cards (Single, Double, Suite, Penthouse) with photos, price, capacity
- **Calendar**: 60-day horizontal date range picker (check-in → check-out) with per-night pricing
- **Guest Selector**: Adults/Children counter
- **Price Breakdown**: Nightly rate × nights + service fee + taxes = total
- **Instant Book** vs **Request to Book** toggle
- **Reviews Section**: Star distribution bar, guest reviews with photos
- **Map**: Hotel location + nearby attractions

### 2. 🍽️ RESTAURANTS → Menu + Reservation
**Interaction Mode:** `menu_browse`
**What Exists:** Basic listing detail, checkout form
**What Needs Building:**
- **Provider Profile**: Restaurant photos, cuisine type badges, hours of operation
- **Menu Browser**: Category tabs (Starters, Mains, Desserts, Drinks) with item cards (photo, name, description, price, dietary badges)
- **Cart System**: Add items with quantity +/-, running total
- **Reservation Flow**: Date picker + time slot selector + guest count + table preference (indoor/outdoor/terrace)
- **Walk-in Order** vs **Reservation** toggle
- **Reviews Section**: Food quality, service, ambiance ratings

### 3. 🏖️ BEACHES → Owner-Positioned Grid (UNIQUE TO RIHLA)
**Interaction Mode:** `matrix_grid`
**What Exists:** Beach satellite map, grid explorer, zone overlays
**What Needs Building:**
- **Owner Grid Editor**: Beach owners drag-and-drop to position real umbrella spots on satellite/aerial photo of their actual beach
- **Real Coordinate Mapping**: Each spot has lat/lng that maps to real beach position
- **Dynamic Pricing**: Per-spot pricing (VIP = premium, Family = standard, Free = no charge)
- **Live Availability**: Real-time occupied/available status per spot
- **Countdown Timer**: 20-min hold with auto-release
- **Add-ons Panel**: Food delivery, drinks, massage, equipment rental per spot
- **QR Entry**: Scan on arrival to activate

### 4. 🏠 RENTALS → Airbnb Style
**Interaction Mode:** `date_range_picker`
**What Exists:** Basic listing detail, checkout form
**What Needs Building:**
- **Property Gallery**: Full-width photo carousel with dots indicator
- **Host Profile**: Host avatar, name, response time, superhost badge
- **Calendar**: Monthly calendar with per-night pricing, minimum stay
- **Guest Selector**: Adults + Children + Infants counters with limits
- **Amenities Grid**: Icon grid (WiFi, Pool, Kitchen, AC, Parking, etc.)
- **House Rules**: Check-in/out times, smoking policy, pets, max guests
- **Location Map**: Property location + neighborhood highlights
- **Reviews Section**: Cleanliness, accuracy, communication, location ratings

### 5. 🚗 RIDES → Uber/Yassir Style
**Interaction Mode:** `route_picker`
**What Exists:** Basic listing detail, find-providers screen
**What Needs Building:**
- **Nearby Driver Map**: Real-time map showing available drivers as car pins with ETA
- **Route Selection**: Pickup point → Destination with route calculation
- **Driver Card**: Photo, name, rating, vehicle info (make/model/color), ETA
- **Vehicle Selector**: Economy / Comfort / VIP tier selection with price estimates
- **Live Tracking**: Driver approaching → arrived → in transit → arrived at destination
- **Fare Estimation**: Dynamic pricing based on distance + time
- **Payment**: Cash / Chargily Pay toggle
- **Driver Rating**: Post-ride rating + tip

### 6. 🎯 ACTIVITIES → Adventure Booking
**Interaction Mode:** `time_slot_queue`
**What Exists:** Basic listing detail
**What Needs Building:**
- **Session Cards**: Available time slots with capacity (e.g., "9:00 AM — 3 spots left")
- **Participant Selector**: Number of participants (affects price)
- **Difficulty Badge**: Easy / Moderate / Challenging with visual indicator
- **Duration Display**: Total session time with start/end
- **Equipment Info**: What's included vs what to bring
- **Safety Brief**: Pre-booking safety information
- **Weather Policy**: Cancellation/refund policy for weather

### 7. 🎪 EVENTS → Ticket Purchase
**Interaction Mode:** `ticket_quantity`
**What Exists:** Basic listing detail
**What Needs Building:**
- **Ticket Type Selector**: General / VIP / Front Row with pricing
- **Quantity Picker**: +/- counter per ticket type
- **Event Timeline**: Schedule of performers/activities
- **Venue Map**: Seating layout with section highlights
- **Age Restriction Badge**: Visible warning for age limits
- **QR Ticket**: Digital ticket with barcode for entry scanning
- **Share Event**: Social sharing with event card preview

### 8. 🧭 GUIDES → Profile-Based Booking
**Interaction Mode:** `time_slot_queue`
**What Exists:** Basic listing detail
**What Needs Building:**
- **Guide Profile**: Full bio, photo, experience years, certifications, languages spoken
- **Portfolio Gallery**: Past tour photos organized by location
- **Tour Packages**: Half-day / Full-day / Multi-day with pricing
- **Schedule Calendar**: Available dates with tour types
- **Languages Badge**: Flag icons for spoken languages
- **Certification Badges**: Official tourism license, first aid, etc.
- **Reviews Section**: Tour quality, knowledge, punctuality ratings

### 9. 📸 PHOTOGRAPHERS → Portfolio + Package
**Interaction Mode:** `portfolio_package`
**What Exists:** PhotographerDetail screen with portfolio grid, packages ✅
**What Needs Building:**
- **Real Portfolio Gallery**: Actual photos (currently mock colored cards)
- **Before/After Slider**: Editing showcase
- **Package Comparison Table**: Side-by-side package features
- **Availability Calendar**: Bookable dates with session times
- **Style Tags**: Visual style indicators (portrait, landscape, editorial, etc.)
- **Drone Badge**: Prominent drone availability indicator

### 10. 🌟 EXPERIENCES → Multi-Day Itinerary
**Interaction Mode:** `itinerary_builder`
**What Exists:** Basic listing detail
**What Needs Building:**
- **Day-by-Day Itinerary**: Expandable cards for each day with activities, meals, accommodation
- **Inclusions/Exclusions**: Clear visual checklist
- **Departure Dates**: Available start dates with group size remaining
- **Group Size Selector**: Number of travelers
- **Difficulty + Fitness Level**: Visual indicators
- **Gear Checklist**: What to bring
- **Route Map**: Multi-point route visualization

---

## 🧑‍💼 Service Provider Profile System (ALL CATEGORIES)

Every provider (hotel, restaurant, guide, photographer, driver, etc.) should have:

### Profile Page
- **Avatar + Cover Photo**: Professional photos
- **Name + Title**: e.g., "Karim — Casbah Expert Guide"
- **Verified Badge**: After KYC approval
- **Rating Summary**: Star distribution bar + total reviews
- **Quick Stats**: Years active, total bookings, response time
- **Bio**: Personal description
- **Location**: Wilaya + map pin

### Portfolio Section
- **Photo Gallery**: Grid/carousel of past work
- **Video Showcase**: Walkthrough/testimonial videos
- **Organized by Category**: Tours, events, weddings, etc.

### Reviews Section
- **Star Distribution**: 5→1 star horizontal bars
- **Review Cards**: Avatar, name, date, rating, text, photos
- **Review Filters**: All / 5★ / 4★ / With Photos
- **Provider Response**: Provider can reply to reviews

### Services/Products
- **List of offerings**: Each with price, description, photos
- **Quick Book**: Direct booking from profile
- **Availability**: Calendar integration

---

## 🔔 Notification System

### Push Notifications (Already wired with expo-notifications)
- **Booking Confirmed**: "Your hotel stay at Hotel El Djazair is confirmed! 🎉"
- **Booking Reminder**: "Your beach spot at Sidi Fredj starts in 2 hours"
- **Booking Cancelled**: "Your ride with Karim has been cancelled"
- **Payment Received**: "Payment of 14,000 DZD received for Hotel El Djazair"
- **Review Request**: "How was your stay at Hotel El Djazair? Rate now!"
- **Promotion**: "Summer deals! 20% off beach spots this weekend"
- **Provider Message**: "Your guide Karim sent you a message"

### In-App Notification Center
- **Notification Bell**: Icon on home screen with unread count badge
- **Notification List**: Grouped by category with timestamps
- **Mark as Read**: Tap to dismiss, swipe to delete
- **Deep Links**: Tap notification → navigate to relevant screen

---

## 📋 Implementation Phases

### Phase 1: Core Profile + Booking Flows (Week 1-2)
1. ✅ Provider Profile screen with portfolio, reviews, booking CTA
2. ✅ Hotel booking flow with calendar + room selector
3. ✅ Rental booking flow with calendar + guest selector
4. ✅ Review submission system (rate + write after booking)

### Phase 2: Service-Specific Maps (Week 3-4)
5. ✅ Rides: Nearby driver detection with ETA on map
6. ✅ Beaches: Owner-positioned umbrella grid editor
7. ✅ Restaurants: Menu browser + table reservation

### Phase 3: Advanced Features (Week 5-6)
8. ✅ Notification center with push + in-app
9. ✅ Event ticket purchase with QR generation
10. ✅ Experience itinerary builder
11. ✅ Guide/Photographer portfolio gallery with real photos

### Phase 4: Polish + Connect (Week 7-8)
12. ✅ Supabase backend connection
13. ✅ Real-time driver tracking
14. ✅ Payment gateway (Chargily Pay)
15. ✅ Image upload for provider portfolios

---

## 🗂️ File Structure (New Files Needed)

```
app/
  provider/[id].tsx                    # Provider profile page (NEW)
  hotel/[id].tsx                       # Hotel detail with calendar (EXISTS - enhance)
  rental/[id].tsx                      # Rental detail with calendar (EXISTS - enhance)
  ride/[id].tsx                        # Ride flow with nearby drivers (NEW)
  restaurant/menu/[id].tsx             # Restaurant menu browser (NEW)
  restaurant/reserve/[id].tsx          # Table reservation (NEW)

components/
  provider/
    ProviderProfile.tsx                # Reusable provider profile header
    PortfolioGallery.tsx               # Photo/video gallery
    ReviewSection.tsx                  # Reviews list + submit form
    ReviewCard.tsx                     # Individual review card
    ProviderStats.tsx                  # Quick stats row

  booking/
    DateRangeCalendar.tsx              # Booking.com-style calendar
    GuestSelector.tsx                  # Adults/children counter
    RoomSelector.tsx                   # Hotel room type picker
    TicketSelector.tsx                 # Event ticket quantity
    TimeSlotPicker.tsx                 # Activity/guide time slots
    PriceBreakdown.tsx                 # Dynamic price calculator

  rides/
    NearbyDriverMap.tsx                # Map with driver pins + ETAs
    DriverCard.tsx                     # Driver profile card
    RoutePreview.tsx                   # Pickup → destination route
    LiveTracking.tsx                   # Real-time ride tracking

  beach/
    BeachGridEditor.tsx                # Owner: position umbrellas on satellite
    SpotBookingSheet.tsx               # Traveler: book a specific spot

  restaurant/
    MenuBrowser.tsx                    # Menu with categories + cart
    TableReservation.tsx               # Date/time/guest picker

  notifications/
    NotificationBell.tsx               # Header bell with badge
    NotificationList.tsx               # In-app notification center
    NotificationCard.tsx               # Individual notification
```

---

## 🎨 Design Principles Per Category

| Category | Inspiration | Key Visual | CTA Color |
|----------|------------|------------|-----------|
| Hotel | Booking.com | Calendar + Room cards | #0a2540 (Navy) |
| Restaurant | UberEats | Menu grid + Cart | #EF4444 (Red) |
| Beach | RIHLA Original | Satellite grid | #00a896 (Teal) |
| Rental | Airbnb | Photo gallery + Calendar | #FF5A5F (Coral) |
| Ride | Uber/Yassir | Map + Driver card | #3B82F6 (Blue) |
| Activity | GetYourGuide | Time slots + Difficulty | #10B981 (Green) |
| Event | Ticketmaster | Ticket types + QR | #EC4899 (Pink) |
| Guide | Viator | Profile + Portfolio | #F59E0B (Amber) |
| Photographer | Thumbtack | Portfolio + Packages | #8B5CF6 (Purple) |
| Experience | Intrepid | Day-by-day itinerary | #6366F1 (Indigo) |
