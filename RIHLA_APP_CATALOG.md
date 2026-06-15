# RIHLA — Complete App Catalog

> Everything in the RIHLA Algerian travel marketplace super-app.
> Generated: June 13, 2026

---

## Table of Contents

1. [Marketplace Categories](#1-marketplace-categories-10)
2. [All Mock Listings (70)](#2-all-mock-listings-70)
3. [Beach Services (13)](#3-beach-services-13)
4. [Desert Services (12)](#4-desert-services-12)
5. [Mountain Services (10)](#5-mountain-services-10)
6. [Heritage Services (8)](#6-heritage-services-8)
7. [City Services (10)](#7-city-services-10)
8. [Food Menu Items (11)](#8-food-menu-items-11)
9. [All Screens/Routes (42+)](#9-all-screensroutes-42)
10. [Zustand Stores (10)](#10-zustand-stores-10)
11. [Context Providers (2)](#11-context-providers-2)
12. [All Components (70+)](#12-all-components-70)
13. [All Types (12 files)](#13-all-types-12-files)
14. [All Constants (9 files)](#14-all-constants-9-files)
15. [All Utilities (4 files)](#15-all-utilities-4-files)
16. [Tech Stack](#16-tech-stack)

---

## 1. Marketplace Categories (10)

| # | Key | Label | Icon | Color | Description |
|---|-----|-------|------|-------|-------------|
| 1 | `hotel` | Hotel | `bed-outline` | `#1A6B3A` | Stays, riads, and guesthouses |
| 2 | `restaurant` | Restaurant | `restaurant-outline` | `#C56A39` | Dining, cafes, and street food |
| 3 | `beach` | Beach | `umbrella-outline` | `#00a896` | Beach spots, zones, and amenities |
| 4 | `rental` | Rental | `home-outline` | `#6C63FF` | Houses, apartments, and villas |
| 5 | `activity` | Activity | `bicycle-outline` | `#E76F51` | Adventures, sports, and tours |
| 6 | `event` | Event | `musical-notes-outline` | `#A855F7` | Concerts, festivals, and shows |
| 7 | `guide` | Guide | `compass-outline` | `#8B5E3C` | Local experts and tour guides |
| 8 | `photographer` | Photographer | `camera-outline` | `#FF499E` | Photography and videography |
| 9 | `driver` | Driver | `car-outline` | `#0a2540` | Transfers, tours, and hire |
| 10 | `experience` | Experience | `sparkles-outline` | `#f4a261` | Curated multi-day trips |

---

## 2. All Mock Listings (70)

### Hotels (7)

| ID | Title | Wilaya | Price | Rating | Star | Rooms | Breakfast | Key Amenities |
|----|-------|--------|-------|--------|------|-------|-----------|---------------|
| `hotel-1` | Riad Yasmine | Constantine | 9,500 | 4.7 | 4 | 12 | Yes | wifi, pool, parking, restaurant |
| `hotel-2` | Hotel El Djazair | Algiers | 14,000 | 4.9 | 5 | 48 | Yes | wifi, pool, spa, gym, restaurant, bar, parking |
| `hotel-3` | Tlemcen Palace Hotel | Tlemcen | 6,500 | 4.3 | 3 | 24 | Yes | wifi, parking, restaurant, garden |
| `hotel-4` | Bejaia Beach Resort | Bejaia | 12,000 | 4.6 | 4 | 65 | Yes | wifi, pool, beach, spa, gym, kids_club, water_sports |
| `hotel-5` | Ghardaia Oasis Lodge | Ghardaia | 5,500 | 4.5 | 3 | 18 | Yes | wifi, pool, restaurant, terrace |
| `hotel-6` | Annaba Seaside Inn | Annaba | 7,000 | 4.2 | 3 | 30 | No | wifi, beach, parking, restaurant |
| `hotel-7` | Djanet Desert Camp Hotel | Djanet | 8,500 | 4.8 | 4 | 15 | Yes | wifi, restaurant, terrace, campfire, guide_service |

### Restaurants (7)

| ID | Title | Wilaya | Price | Rating | Cuisine | Seats | Delivery | Reservation |
|----|-------|--------|-------|--------|---------|-------|----------|-------------|
| `rest-1` | Le Saveur de Constantine | Constantine | 2,500 | 4.6 | Traditional, Mediterranean | 60 | Yes | No |
| `rest-2` | Cafe Diar El Djazair | Algiers | 800 | 4.8 | Cafe, Pastry | 35 | No | No |
| `rest-3` | Pizza Palace Oran | Oran | 1,800 | 4.5 | Italian, Pizza, Fusion | 80 | Yes | No |
| `rest-4` | Le Jardin Tipaza | Tipaza | 3,200 | 4.7 | French, Seafood | 45 | No | Yes |
| `rest-5` | Tlemcen Sweets House | Tlemcen | 600 | 4.9 | Pastry, Desserts | 25 | Yes | No |
| `rest-6` | Sahara Grill House | Tamanrasset | 2,200 | 4.4 | Grill, Berber, Desert | 40 | No | No |
| `rest-7` | Bejaia Fish Market | Bejaia | 2,800 | 4.6 | Seafood, Grill | 70 | No | No |

### Beaches (7)

| ID | Title | Wilaya | Price | Rating | Grid | Zone | Hold | Services |
|----|-------|--------|-------|--------|------|------|------|----------|
| `beach-1` | Sidi Fredj Family Zone | Tipaza | 1,500 | 4.7 | 4x6 | Family | 20min | parking, food, showers, photos |
| `beach-2` | Jijel Coral Beach | Jijel | 1,200 | 4.5 | 3x8 | Free | 15min | parking, showers, equipment_rental |
| `beach-3` | Annaba Golden Sands | Annaba | 800 | 4.3 | 5x10 | Free | No | parking, food, showers, toilets |
| `beach-4` | Oran VIP Beach Club | Oran | 3,500 | 4.8 | 3x4 | VIP | 30min | parking, food, drinks, towels, showers, photos, massage |
| `beach-5` | Bejaia Rock Beach | Bejaia | 600 | 4.4 | 2x6 | Free | No | parking, showers |
| `beach-6` | Skikda Blue Lagoon | Skikda | 900 | 4.6 | 4x7 | Free | 15min | parking, food, showers, equipment_rental |
| `beach-7` | Tlemcen Mediterranean Cove | Tlemcen | 1,000 | 4.5 | 2x5 | Free | No | parking, showers |

### Rentals (7)

| ID | Title | Wilaya | Price | Rating | BR/BA | Guests | Type | Key Amenities |
|----|-------|--------|-------|--------|-------|--------|------|---------------|
| `rental-1` | Villa Oran Seafront | Oran | 18,000 | 4.8 | 4/3 | 10 | Villa | pool, wifi, parking, ac, kitchen, bbq |
| `rental-2` | Algiers Downtown Apartment | Algiers | 6,500 | 4.6 | 2/1 | 4 | Apartment | wifi, ac, kitchen, washer |
| `rental-3` | Constantine Cliff House | Constantine | 8,000 | 4.7 | 3/2 | 6 | House | wifi, ac, kitchen, terrace, parking |
| `rental-4` | Tamanrasset Desert Camp | Tamanrasset | 12,000 | 4.9 | 0/1 | 2 | House | wifi, ac, outdoor_shower, stargazing, campfire |
| `rental-5` | Bejaia Coastal Studio | Bejaia | 4,500 | 4.4 | 1/1 | 2 | Studio | wifi, ac, balcony, kitchen |
| `rental-6` | Tipaza Garden Villa | Tipaza | 10,000 | 4.5 | 5/3 | 12 | Villa | wifi, parking, ac, kitchen, garden, bbq |
| `rental-7` | Ghardaia Traditional House | Ghardaia | 3,500 | 4.6 | 2/1 | 4 | House | wifi, courtyard, rooftop, kitchen |

### Activities (7)

| ID | Title | Wilaya | Price | Rating | Type | Duration | Max Ppl | Difficulty |
|----|-------|--------|-------|--------|------|----------|---------|------------|
| `act-1` | Tandem Paragliding Djurdjura | Bejaia | 8,000 | 4.9 | Paragliding | 45min | 1 | Moderate |
| `act-2` | Scuba Diving Cap Carbon | Bejaia | 6,000 | 4.8 | Diving | 120min | 4 | Challenging |
| `act-3` | Hiking Chrea National Park | Blida | 2,500 | 4.7 | Hiking | 240min | 10 | Moderate |
| `act-4` | Camel Trek Sahara | Ghardaia | 4,500 | 4.8 | Camel Trek | 180min | 6 | Easy |
| `act-5` | Jet Skiing Oran Bay | Oran | 3,000 | 4.5 | Water Sports | 30min | 1 | Easy |
| `act-6` | Rock Climbing Tikjda | Tizi Ouzou | 5,000 | 4.6 | Climbing | 180min | 4 | Challenging |
| `act-7` | Horseback Riding Constantine | Constantine | 3,500 | 4.4 | Horseback | 90min | 6 | Easy |

### Events (7)

| ID | Title | Wilaya | Price | Rating | Type | Date | Venue | Capacity |
|----|-------|--------|-------|--------|------|------|-------|----------|
| `event-1` | Rai Night Oran | Oran | 3,500 | 4.5 | Concert | 15 Jul 2026 | Oran Arena | 550 |
| `event-2` | Algiers Jazz Festival | Algiers | 5,000 | 4.8 | Festival | 10 Aug 2026 | Algiers Opera House | 400 |
| `event-3` | Constantine Heritage Night | Constantine | 2,000 | 4.6 | Cultural | 20 Jul 2026 | Ahmed Bey Palace | 200 |
| `event-4` | Tipaza Summer Comedy Show | Tipaza | 1,500 | 4.3 | Comedy | 5 Jul 2026 | Tipaza Amphitheater | 330 |
| `event-5` | Annaba Beach Music Festival | Annaba | 4,000 | 4.7 | Music Festival | 1 Aug 2026 | Annaba Beach Club | 550 |
| `event-6` | Tlemcen Crafts Fair | Tlemcen | 500 | 4.5 | Fair | 25 Jul 2026 | Tlemcen Grand Mosque Square | 1000 |
| `event-7` | Djanet Desert Night Sky Show | Djanet | 2,500 | 4.9 | Stargazing | 5 Aug 2026 | Djanet Desert Camp | 50 |

### Guides (7)

| ID | Title | Wilaya | Price | Rating | Specialty | Languages | Experience | Max Group |
|----|-------|--------|-------|--------|-----------|-----------|------------|-----------|
| `guide-1` | Karim — Casbah Expert | Algiers | 4,000 | 4.9 | Historical Heritage | AR/FR/EN | 15yr | 12 |
| `guide-2` | Fatima — Sahara Desert | Tamanrasset | 5,500 | 4.9 | Desert Expeditions | AR/FR/Tamazight | 10yr | 8 |
| `guide-3` | Youcef — Bridges Tour | Constantine | 3,500 | 4.7 | Urban Heritage | AR/FR | 8yr | 15 |
| `guide-4` | Nadia — Archaeology | Tipaza | 4,500 | 4.8 | Roman History | AR/FR/EN/ES | 12yr | 20 |
| `guide-5` | Amine — Nature Guide | Bejaia | 3,000 | 4.6 | Nature & Adventure | AR/FR/Kabyle | 7yr | 10 |
| `guide-6` | Meriem — Cultural | Tlemcen | 3,200 | 4.7 | Islamic Architecture | AR/FR | 9yr | 12 |
| `guide-7` | Omar — Rock Art | Djanet | 6,000 | 5.0 | Prehistoric Rock Art | AR/FR/EN | 20yr | 6 |

### Photographers (7)

| ID | Title | Wilaya | Price | Rating | Style | Packages | Turnaround | Drone |
|----|-------|--------|-------|--------|-------|----------|------------|-------|
| `photo-1` | Amina — Beach & Sunset | Tipaza | 5,000 | 4.8 | Portrait, Landscape | 2 | 3 days | Yes |
| `photo-2` | Rachid — Desert Landscape | Tamanrasset | 8,000 | 4.9 | Landscape, Travel | 2 | 5 days | Yes |
| `photo-3` | Salima — Wedding & Events | Algiers | 15,000 | 4.9 | Wedding, Event | 2 | 7 days | No |
| `photo-4` | Khaled — Food & Product | Constantine | 7,000 | 4.6 | Food, Commercial | 2 | 4 days | No |
| `photo-5` | Yasmine — Portrait & Fashion | Oran | 6,000 | 4.7 | Portrait, Fashion | 2 | 5 days | No |
| `photo-6` | Djamel — Aerial & Real Estate | Algiers | 10,000 | 4.5 | Aerial, Real Estate | 2 | 3 days | Yes |
| `photo-7` | Ines — Family & Lifestyle | Annaba | 4,000 | 4.8 | Family, Lifestyle | 2 | 5 days | No |

### Drivers (7)

| ID | Title | Wilaya | Price | Rating | Vehicle | Type | DA/km | Airport | Multi-Day |
|----|-------|--------|-------|--------|---------|------|-------|---------|-----------|
| `driver-1` | Youcef — Airport Transfers | Algiers | 3,000 | 4.7 | Toyota Camry 2024 | Sedan | 50 | Yes | Yes |
| `driver-2` | Bilal — Inter-City Luxury | Algiers | 800/km | 4.9 | Mercedes E-Class 2024 | Luxury | 80 | Yes | Yes |
| `driver-3` | Samir — Oran City Shuttle | Oran | 2,000 | 4.5 | Renault Trafic 2023 | Van | 35 | Yes | No |
| `driver-4` | Hassan — Sahara Expedition | Tamanrasset | 15,000 | 4.8 | Toyota Land Cruiser 2024 | SUV | 120 | No | Yes |
| `driver-5` | Mohamed — Constantine Tour | Constantine | 2,500 | 4.6 | Hyundai Sonata 2024 | Sedan | 40 | Yes | Yes |
| `driver-6` | Abdel — Bejaia Coastal | Bejaia | 3,000 | 4.4 | Peugeot 3008 2024 | SUV | 45 | Yes | Yes |
| `driver-7` | Karim — Tipaza Wine Country | Tipaza | 4,000 | 4.7 | Nissan X-Trail 2024 | SUV | 55 | Yes | Yes |

### Experiences (7)

| ID | Title | Wilaya | Price | Rating | Days | Max | Difficulty | Key Inclusions |
|----|-------|--------|-------|--------|------|-----|------------|----------------|
| `exp-1` | 3-Day Sahara Expedition | Tamanrasset | 35,000 | 5.0 | 3 | 8 | Moderate | transport, meals, camp, camel, guide, stargazing |
| `exp-2` | Djanet Tassili Rock Art Trek | Djanet | 55,000 | 4.9 | 5 | 6 | Challenging | transport, meals, camping, guide, camel, rock art |
| `exp-3` | Algiers Historical Walking Tour | Algiers | 8,000 | 4.7 | 1 | 10 | Easy | guide, lunch, transport, museum entries |
| `exp-4` | Djurdjura Mountain Adventure | Tizi Ouzou | 22,000 | 4.8 | 4 | 10 | Moderate | guide, meals, camping, transport |
| `exp-5` | Ghardaia M'zab Valley Cultural | Ghardaia | 18,000 | 4.7 | 3 | 8 | Easy | guide, meals, accommodation, transport, crafts |
| `exp-6` | Tlemcen Heritage & Crafts Week | Tlemcen | 25,000 | 4.6 | 5 | 12 | Easy | guide, meals, accommodation, craft workshops |
| `exp-7` | Bejaia & Kabylie Coastal Road Trip | Bejaia | 15,000 | 4.5 | 3 | 6 | Easy | transport, guide, meals, accommodation |

---

## 3. Beach Services (13)

| # | ID | Title | Tagline | Icon | Color | Price |
|---|-----|-------|---------|------|-------|-------|
| 1 | `parking` | Parking | Reserve your spot | `car-outline` | `#023E58` | 200 DA/day |
| 2 | `spots` | Beach Spots | Umbrella & chairs | `umbrella-outline` | `#00a896` | 1,500 DA/day |
| 3 | `food` | Food & Drinks | Order to your spot | `restaurant-outline` | `#F4A261` | 800 DA/meal |
| 4 | `clothes` | Swim Shop | Swimwear & gear | `shirt-outline` | `#FF6B6B` | 1,200 DA/item |
| 5 | `games` | Games & Fun | Rentals & activities | `game-controller-outline` | `#20C997` | 500 DA/hour |
| 6 | `beach-items` | Water Rides | Jet-ski & pedalo | `water-outline` | `#0a2540` | 3,500 DA/session |
| 7 | `massage` | Massage | Seaside relaxation | `hand-heart-outline` | `#845EC2` | 2,500 DA/session |
| 8 | `hotels` | Stay & Rent | Nearby hotels | `bed-outline` | `#1A6B3A` | 9,500 DA/night |
| 9 | `showers` | Showers | Fresh & clean | `shower-head` | `#48CAE4` | 100 DA/use |
| 10 | `events` | Events | Parties & tickets | `musical-notes-outline` | `#FF70A6` | 2,000 DA/ticket |
| 11 | `powerbank` | Power Bank | Stay charged | `battery-charging-outline` | `#06D6A0` | 200 DA/hour |
| 12 | `photos` | Photo Service | Beach photography | `camera-outline` | `#FF499E` | 1,500 DA/session |
| 13 | `guide` | Beach Guide | Rules & safety | `compass-outline` | `#A8763E` | 1,000 DA/day |

---

## 4. Desert Services (12)

| # | ID | Title | Tagline | Icon | Color | Price |
|---|-----|-------|---------|------|-------|-------|
| 1 | `camel` | Camel Ride | Half/full-day trek | `image-outline` | `#E76F51` | 2,500 DA/ride |
| 2 | `camp` | Desert Camp | Luxury tent under stars | `home-outline` | `#C1440E` | 12,000 DA/night |
| 3 | `dune-buggy` | Quad & Buggy | ATV dunes tour | `speedometer-outline` | `#F4A261` | 5,000 DA/hour |
| 4 | `desert-trek` | Desert Trek | Guided hiking | `walk-outline` | `#2D6A4F` | 6,000 DA/day |
| 5 | `traditional-food` | Traditional Food | Tagine & mint tea | `restaurant-outline` | `#D4A373` | 1,800 DA/person |
| 6 | `desert-photos` | Photoshoot | Sunrise & sunset | `camera-outline` | `#E76F51` | 3,000 DA/session |
| 7 | `stargazing` | Stargazing | Telescope & guide | `telescope-outline` | `#3F37C9` | 1,500 DA/session |
| 8 | `cultural-show` | Tuareg Show | Traditional music | `musical-notes-outline` | `#7209B7` | 2,000 DA/ticket |
| 9 | `safari-4x4` | 4x4 Sahara Safari | Full-day off-road | `car-outline` | `#E76F51` | 15,000 DA/day |
| 10 | `desert-hotels` | Sahara Riads | Desert guesthouses | `bed-outline` | `#1B4332` | 8,000 DA/night |
| 11 | `desert-guide` | Private Guide | Certified local expert | `compass-outline` | `#A8763E` | 4,000 DA/day |
| 12 | `safety-kit` | Safety Kit | GPS & emergency water | `shield-checkmark-outline` | `#E63946` | 1,000 DA/day |

---

## 5. Mountain Services (10)

| # | ID | Title | Tagline | Icon | Color | Price |
|---|-----|-------|---------|------|-------|-------|
| 1 | `hiking-guide` | Hiking Guide | Local trail expert | `walk-outline` | `#2D6A4F` | 3,500 DA/day |
| 2 | `mountain-chalet` | Chalet Rent | Wood chalets & gites | `home-outline` | `#1B4332` | 10,000 DA/night |
| 3 | `paragliding` | Paragliding | Tandem flight | `airplane-outline` | `#4EA8DE` | 8,000 DA/flight |
| 4 | `rock-climbing` | Rock Climbing | Guided climb & gear | `shield-outline` | `#52B788` | 4,000 DA/session |
| 5 | `mountain-biking` | Mountain Bike | Premium trail bikes | `bicycle-outline` | `#74C69D` | 2,000 DA/day |
| 6 | `camping-spot` | Camping Spot | Secure campsite | `leaf-outline` | `#40916C` | 1,500 DA/night |
| 7 | `bbq-package` | BBQ Package | Meat, charcoal & grill | `restaurant-outline` | `#E76F51` | 2,500 DA/pack |
| 8 | `nature-photos` | Nature Photos | Trip photographer | `camera-outline` | `#52B788` | 3,000 DA/session |
| 9 | `foraging-tour` | Foraging Tour | Wild herb walk | `eye-outline` | `#2D6A4F` | 1,500 DA/tour |
| 10 | `first-aid-kit` | Safety Kit | Emergency first-aid | `heart-outline` | `#E63946` | 800 DA/day |

---

## 6. Heritage Services (8)

| # | ID | Title | Tagline | Icon | Color | Price |
|---|-----|-------|---------|------|-------|-------|
| 1 | `expert-guide` | Historian Guide | Licensed archaeologist | `school-outline` | `#8B5E3C` | 4,000 DA/day |
| 2 | `audio-tour` | Audio Guide | Multilingual device | `volume-high-outline` | `#6B3F1E` | 800 DA/device |
| 3 | `heritage-photos` | Heritage Photos | Historic photoshoot | `camera-outline` | `#A0522D` | 3,500 DA/session |
| 4 | `craft-workshop` | Craft Workshop | Pottery or weaving | `brush-outline` | `#B07D62` | 2,000 DA/class |
| 5 | `traditional-tea` | Tea & Sweets | Mint tea at ancient cafe | `cafe-outline` | `#8B5E3C` | 500 DA/person |
| 6 | `artisan-market` | Artisan Market | Curated local crafts | `basket-outline` | `#7F5539` | 1,500 DA/box |
| 7 | `day-trip` | Day Trip Pack | All-inclusive tour | `map-outline` | `#8B5E3C` | 7,000 DA/person |
| 8 | `ar-experience` | AR History | Augmented reality | `eye-outline` | `#6C63FF` | 1,000 DA/use |

---

## 7. City Services (10)

| # | ID | Title | Tagline | Icon | Color | Price |
|---|-----|-------|---------|------|-------|-------|
| 1 | `restaurant` | Restaurant | Top eateries | `restaurant-outline` | `#6C63FF` | 1,000 DA/table |
| 2 | `nightlife` | Nightlife | Cafes & lounges | `musical-notes-outline` | `#4834D4` | 2,500 DA/ticket |
| 3 | `hammam` | Hammam & Spa | Traditional bath | `water-outline` | `#0a2540` | 3,000 DA/session |
| 4 | `shopping-tour` | Shopping Tour | Souk guide | `bag-handle-outline` | `#6C63FF` | 3,000 DA/tour |
| 5 | `city-tour` | Private City Tour | Driver & guide for day | `car-outline` | `#4834D4` | 12,000 DA/day |
| 6 | `events` | Concerts & Shows | Event tickets | `ticket-outline` | `#A855F7` | 2,500 DA/ticket |
| 7 | `hotel-riad` | Boutique Riads | Historical heart stays | `bed-outline` | `#6C63FF` | 14,000 DA/night |
| 8 | `city-photos` | City Photoshoot | Urban sunset session | `camera-outline` | `#FF70A6` | 3,500 DA/session |
| 9 | `food-tour` | Street Food Tour | Taste Algeria's best | `restaurant-outline` | `#6C63FF` | 2,000 DA/tour |
| 10 | `culture-class` | Darija Class | Language & culture | `book-outline` | `#4834D4` | 1,500 DA/class |

**Total Services: 53** (13 beach + 12 desert + 10 mountain + 8 heritage + 10 city)

---

## 8. Food Menu Items (11)

### Drinks (4)

| ID | Name | Arabic | Price | Emoji |
|----|------|--------|-------|-------|
| 1 | Fresh Orange Juice | عصير برتقال | 250 DA | 🥤 |
| 2 | Coconut Water | ماء جوز الهند | 300 DA | 🥥 |
| 3 | Limonade | ليموناضة | 150 DA | 🍋 |
| 4 | Cafe Noisette | قهوة | 200 DA | ☕ |

### Food (4)

| ID | Name | Arabic | Price | Emoji |
|----|------|--------|-------|-------|
| 5 | Sandwich Thon | ساندويتش تونة | 450 DA | 🥪 |
| 6 | Salad Fraîche | سلطة طازجة | 500 DA | 🥗 |
| 7 | Pizza Margherita | بيتزا | 800 DA | 🍕 |
| 8 | Chicken Wrap | لفافة دجاج | 600 DA | 🌯 |

### Snacks (3)

| ID | Name | Arabic | Price | Emoji |
|----|------|--------|-------|-------|
| 9 | Chips & Dips | شيبس | 200 DA | 🍟 |
| 10 | Fruit Platter | طبق فواكه | 400 DA | 🍓 |
| 11 | Ice Cream | آيس كريم | 180 DA | 🍦 |

---

## 9. All Screens/Routes (42+)

### Auth `(auth)/`
| Route | Purpose |
|-------|---------|
| `(auth)/welcome` | Onboarding video + slides |
| `(auth)/role-select` | Traveler / Business / Partner |
| `(auth)/login` | Phone + OTP login |
| `(auth)/kyc-traveler` | Traveler KYC form |
| `(auth)/kyc-pending` | KYC review pending |
| `(auth)/kyc-partner` | Partner KYC form |
| `(auth)/kyc-business` | Business KYC form |

### Traveler Tabs `(tabs)/`
| Route | Purpose |
|-------|---------|
| `(tabs)/` | Home screen with categories |
| `(tabs)/explore` | Map-based discovery |
| `(tabs)/favorites` | Saved listings |
| `(tabs)/trips` | Bookings & orders |
| `(tabs)/profile` | User profile |
| `(tabs)/edit-profile` | Edit profile |

### Modals `(modals)/`
| Route | Purpose |
|-------|---------|
| `(modals)/settings` | App settings |
| `(modals)/filter` | Quick filter sheet |
| `(modals)/booking` | Booking details |

### Core Screens
| Route | Purpose |
|-------|---------|
| `/search` | Category-specific search |
| `/listing/[id]` | Listing detail |
| `/listing/[category]/[id]` | Category-specific detail |
| `/marketplace/[category]` | Category browse |
| `/booking/[id]` | Booking detail |
| `/checkout/[id]` | Checkout flow |
| `/provider/[id]` | Provider profile |
| `/destination/[id]` | Destination detail |
| `/wilaya/[wilayaId]` | Wilaya page |
| `/ai-assistant` | Floating AI bubble |

### Beach Services
| Route | Purpose |
|-------|---------|
| `/services/beach/parking` | Parking reservation |
| `/services/beach/spots` | Beach spot booking |
| `/services/beach/food` | Food & drinks order |
| `/services/beach/clothes` | Swim shop |
| `/services/beach/games` | Games & activities |
| `/services/beach/beach-items` | Water rides |
| `/services/beach/massage` | Massage booking |
| `/services/beach/hotels` | Nearby hotels |
| `/services/beach/showers` | Shower booking |
| `/services/beach/events` | Beach events |
| `/services/beach/powerbank` | Power bank rental |
| `/services/beach/photos` | Photo service |
| `/services/beach/guide` | Beach guide |
| `/services/beach/checkout` | Beach checkout |
| `/services/beach/order-tracking` | Order tracking |

### Desert Services
| Route | Purpose |
|-------|---------|
| `/services/desert/camel` | Camel ride |
| `/services/desert/camp` | Desert camp |
| `/services/desert/dune-buggy` | Quad & buggy |
| `/services/desert/stargazing` | Stargazing |
| `/services/desert/desert-guide` | Private guide |

### Business Owner `(business)/`
| Route | Purpose |
|-------|---------|
| `(business)/` | Dashboard home |
| `(business)/listings` | Manage listings |
| `(business)/listings/new` | Create listing |
| `(business)/bookings` | Booking management |
| `(business)/orders` | Order management |
| `(business)/inventory` | Inventory tracking |
| `(business)/staff` | Staff management |
| `(business)/analytics` | Business analytics |
| `(business)/earnings` | Revenue tracking |
| `(business)/reviews` | Review management |
| `(business)/promotions` | Promotions |
| `(business)/marketplace` | Marketplace |
| `(business)/settings` | Business settings |
| `(business)/profile` | Business profile |
| 12 category dashboards | Beach, Hotel, Restaurant, Games, Rental, Events, Wellness, Photographer, Parking, Water-Sports, Experience, Desert, Driver |

### Partner `(partner)/`
| Route | Purpose |
|-------|---------|
| `(partner)/` | Dashboard home |
| `(partner)/services` | Service management |
| `(partner)/dispatch` | Job dispatch |
| `(partner)/tasks` | Task management |
| `(partner)/earnings` | Earnings |
| `(partner)/payouts` | Payout history |
| `(partner)/reviews` | Reviews |
| `(partner)/analytics` | Analytics |
| `(partner)/notifications` | Notifications |
| `(partner)/profile` | Partner profile |
| `(partner)/verification` | KYC verification |
| `(partner)/community` | Community |

---

## 10. Zustand Stores (10)

| Store | Persisted | What It Manages |
|-------|-----------|-----------------|
| `useSettingsStore` | Yes | Locale (en/ar), push notifications, haptics, RTL |
| `usePartnerServices` | Yes | Partner service CRUD (title, category, price, status) |
| `usePartnerDispatches` | Yes | Job dispatches (accept/decline/complete flow) |
| `useLocationStore` | No | GPS location, destination, map markers |
| `useFoodCartStore` | No | Beach food cart (items, zone, spot, totals) |
| `useFilterStore` | No | Discover filters (region, environment, price, rating) |
| `useFavorites` | No | Favorite listing IDs, toggle/clear |
| `useBusinessAssets` | Yes | Business assets (rooms, menus, spots, properties) |
| `useAssetInventory` | Yes | Inventory tracking (quantity, rent/return, status) |
| `useAIBubbleStore` | No | AI assistant bubble trigger |

---

## 11. Context Providers (2)

| Provider | What It Provides |
|----------|------------------|
| `AppProvider` / `useApp()` | User profile, bookings (CRUD), orders (CRUD), service requests, reviews, partner status, active category, sign out. Persisted to AsyncStorage. 15 demo bookings seeded. |
| `I18nProvider` / `useTranslation()` | Locale (en/ar), `t()` translation function, `setLocale()`. Reads from `useSettingsStore`. |

---

## 12. All Components (70+)

### Shared (13)
`ConfirmButton` · `CountdownTimer` · `DesertBookingScreen` · `EmptyState` · `InputField` · `LiveTracker` · `LocationInitializer` · `MapBottomSheetLayout` · `MapWithDirections` · `PhotoCarousel` · `ServiceProviderCard` · `StackHeader` · `UberButton`

### Listing Detail (10)
`ActivityDetail` · `BeachMapDetail` · `DriverDetail` · `EventDetail` · `ExperienceDetail` · `GuideDetail` · `HotelDetail` · `PhotographerDetail` · `RentalDetail` · `RestaurantDetail`

### Beach (10)
`BeachSandGrid` · `BeachSatelliteMap` · `BeachSvgIcons` · `DeliverySpotMatrix` · `FoodCartSheet` · `MassagePavilionGrid` · `SpotCell` · `SpotHoldBanner` · `VisualSlotGrid` · `ZoneTabs`

### Dashboard (23)
`ActivityDashboard` · `BeachDashboard` · `CommandDrawer` · `EventDashboard` · `GuideDashboard` · `HotelDashboard` · `HubHeader` · `MenuShortcuts` · `NavProvider` · `QRScanner` · `RestaurantDashboard` · `ScreenChrome` · `TabShell` · `TopBar` · `BeachGallery` · `BeachMapView` · `DispatchCalendar` · `HotelInventoryCalendar` · `HotelOverview` · `ActivityPartnerOverview` · `TransportPartnerOverview` · `KitchenOrderTickets` · `AssetInventoryList`

### Search (1)
`SearchResultCard` — category-specific search result cards

### Business (30)
- **Listings (10):** `ActivityListings` · `BeachListings` · `DriverListings` · `EventListings` · `ExperienceListings` · `GuideListings` · `HotelListings` · `PhotographerListings` · `RentalListings` · `RestaurantListings`
- **Create (10):** `CreateActivityItem` · `CreateBeachItem` · `CreateDriverItem` · `CreateEventItem` · `CreateExperienceItem` · `CreateGuideItem` · `CreateHotelItem` · `CreatePhotographerItem` · `CreateRentalItem` · `CreateRestaurantItem`
- **Bookings (10):** `ActivityBookings` · `BeachBookings` · `DriverBookings` · `EventBookings` · `ExperienceBookings` · `GuideBookings` · `HotelBookings` · `PhotographerBookings` · `RentalBookings` · `RestaurantBookings`

### UI Primitives (7)
`Box` · `Button` · `Card` · `Center` · `Divider` · `GluestackUIProvider` · `Pressable` · `Spinner`

### Other
`FloatingAIBubble` · `Toast` · `SettingsRow` · `SettingsGroup`

---

## 13. All Types (12 files)

| File | Key Types |
|------|-----------|
| `service.ts` | `MarketplaceCategory`, `Listing`, `ListingMetadata` (discriminated union of 10 variants), 10 type guard functions |
| `booking.ts` | `AppBooking`, `AppBookingStatus`, `IconFamily`, `KycFieldProps` |
| `order.ts` | `Order`, `OrderStatus`, `MenuItem`, `OrderItem`, 5 variant order field types, type guards |
| `beach.ts` | `Beach`, `BeachBooking`, `Spot`, `SpotMatrix`, `ZoneType` |
| `listing.ts` | `ListingUIConfig`, 10 category UI configs, `LISTING_UI_CONFIGS` |
| `review.ts` | `Review`, `RatingSummary`, `RatingDimensions` |
| `itinerary.ts` | `Itinerary`, `ItineraryDay`, `ItineraryActivity` |
| `airbnb-listing.ts` | `AirbnbListing`, `AirbnbListingFeature` |
| `app.ts` | `UserProfile`, `KycData`, `TravelPreferences`, `EmergencyContact` |
| `user.ts` | `Profile`, `Role`, `KYCStatus` |

---

## 14. All Constants (9 files)

| File | What It Exports |
|------|-----------------|
| `marketplaceCategories.ts` | 10 category definitions, helper functions |
| `mockListings.ts` | 70 mock listings, search/filter helpers |
| `services.ts` | 53 services (5 environments), `getServicesByCategory()` |
| `foodMenu.ts` | 11 food items, 3 categories |
| `destinations.ts` | 16 destinations, region map, type definitions |
| `wilayas.ts` | 58 Algerian wilayas, region groupings |
| `theme.ts` | RIHLA color palette, category colors, gradients, default styles |
| `beachLayout.ts` | Zone configs, spot states, grid helpers |
| `proNavigation.ts` | Business & partner nav items, pro theme |
| `googleMapStyle.ts` | Google Maps light style array |

---

## 15. All Utilities (4 files)

| File | What It Does |
|------|-------------|
| `haptics.ts` | 5 haptic functions (light/medium/heavy/success/error) with settings check |
| `safeNavigation.ts` | `safeGoBack()` — back or fallback to home |
| `router.ts` | Navigation helpers: `bookingHref`, `checkoutHref`, `orderTrackingHref`, etc. |
| `listingPhotos.ts` | Generates Unsplash photo URLs per category, category hero gradients |

---

## 16. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native 0.81.5 + Expo SDK 54 |
| Routing | Expo Router (file-based) |
| State | Zustand (10 stores) + React Context (2 providers) |
| Auth | Clerk |
| Backend | Supabase (schema ready, not connected) |
| UI | Gluestack UI + custom components |
| Animations | React Native Reanimated |
| Maps | react-native-maps |
| Video | expo-video (replaced expo-av) |
| Icons | @expo/vector-icons (Ionicons + MaterialCommunityIcons) |
| Fonts | Custom (mon, mon-b, mon-sb) |
| Currency | DZD (Algerian Dinar) |
| Languages | EN / FR / AR (RTL) |
| Coverage | 58 Algerian wilayas |

---

*This file is the single source of truth for the RIHLA app architecture.*
