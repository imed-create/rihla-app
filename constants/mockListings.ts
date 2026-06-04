/**
 * RIHLA — Mock Marketplace Listings
 * ------------------------------------
 * Sample listings for all 10 marketplace categories.
 * Used until Supabase backend is connected.
 */

import type { Listing } from '@/types/service';

export const MOCK_LISTINGS: Listing[] = [
  // ── HOTELS ──
  {
    id: 'hotel-1', provider_id: 'biz-1', title: 'Riad Yasmine', description: 'A charming boutique riad in the heart of Constantine, blending traditional Algerian architecture with modern luxury.',
    category: 'hotel', price_dzd: 9500, wilaya: 'Constantine', region: 'Constantine',
    coordinates: { latitude: 36.365, longitude: 6.615 },
    metadata: { kind: 'hotel', room_count: 12, check_in_time: '14:00', check_out_time: '11:00', room_types: ['single', 'double', 'suite'], breakfast_included: true, star_rating: 4, amenities: ['wifi', 'pool', 'parking', 'restaurant'], price_per_night_dzd: 9500 },
    created_at: '2026-01-15', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 4.7, review_count: 234,
    cover_image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', photo_urls: [],
    tags: ['boutique', 'riad', 'central'], family_friendly: true, is_vip: false,
  },
  {
    id: 'hotel-2', provider_id: 'biz-2', title: 'Hotel El Djazair', description: 'Seafront luxury hotel overlooking the Mediterranean. Premium suites with panoramic views.',
    category: 'hotel', price_dzd: 14000, wilaya: 'Algiers', region: 'Algiers',
    coordinates: { latitude: 36.7538, longitude: 3.0588 },
    metadata: { kind: 'hotel', room_count: 48, check_in_time: '15:00', check_out_time: '12:00', room_types: ['standard', 'deluxe', 'suite', 'penthouse'], breakfast_included: true, star_rating: 5, amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant', 'bar', 'parking'], price_per_night_dzd: 14000 },
    created_at: '2025-08-01', updated_at: '2026-05-20', is_active: true, is_featured: true, rating: 4.9, review_count: 512,
    cover_image_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', photo_urls: [],
    tags: ['luxury', 'seafront', '5-star'], family_friendly: true, is_vip: true,
  },

  // ── RESTAURANTS ──
  {
    id: 'rest-1', provider_id: 'biz-3', title: 'Le Saveur de Constantine', description: 'Traditional Algerian cuisine with a modern twist. Famous for our couscous royal and mint tea.',
    category: 'restaurant', price_dzd: 2500, wilaya: 'Constantine', region: 'Constantine',
    coordinates: { latitude: 36.37, longitude: 6.61 },
    metadata: { kind: 'restaurant', cuisine_types: ['traditional', 'mediterranean'], menu_categories: ['starters', 'main', 'desserts', 'drinks'], avg_meal_price_dzd: 2500, reservation_required: false, opening_hours: '08:00–22:00', delivery_available: true, seating_capacity: 60 },
    created_at: '2025-10-01', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.6, review_count: 189,
    cover_image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', photo_urls: [],
    tags: ['traditional', 'family', 'delivery'], family_friendly: true, is_vip: false,
  },

  // ── BEACHES ──
  {
    id: 'beach-1', provider_id: 'biz-4', title: 'Sidi Fredj Family Zone', description: 'Premium beach spot with umbrella, chairs, and direct sea access. Family-friendly zone with lifeguard on duty.',
    category: 'beach', price_dzd: 1500, wilaya: 'Tipaza', region: 'Algiers',
    coordinates: { latitude: 36.7369, longitude: 2.8658 },
    metadata: { kind: 'beach', grid_layout: '4x6_family', total_rows: 4, total_cols: 6, zone: 'family', price_per_spot_dzd: 1500, hold_enabled: true, hold_duration_minutes: 20, services: ['parking', 'food', 'showers', 'photos'] },
    created_at: '2026-03-01', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 4.7, review_count: 1243,
    cover_image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', photo_urls: [],
    tags: ['family', 'umbrella', 'lifeguard'], family_friendly: true, is_vip: false,
  },

  // ── RENTALS ──
  {
    id: 'rental-1', provider_id: 'biz-5', title: 'Villa Oran Seafront', description: 'Stunning 4-bedroom villa with private pool and direct beach access. Perfect for family holidays.',
    category: 'rental', price_dzd: 18000, wilaya: 'Oran', region: 'Oran',
    coordinates: { latitude: 35.6969, longitude: -0.6331 },
    metadata: { kind: 'rental', bedrooms: 4, bathrooms: 3, max_guests: 10, price_per_night_dzd: 18000, amenities: ['pool', 'wifi', 'parking', 'ac', 'kitchen', 'bbq'], monthly_available: true, property_type: 'villa' },
    created_at: '2026-02-10', updated_at: '2026-05-15', is_active: true, is_featured: false, rating: 4.8, review_count: 87,
    cover_image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', photo_urls: [],
    tags: ['villa', 'pool', 'seafront'], family_friendly: true, is_vip: true,
  },

  // ── ACTIVITIES ──
  {
    id: 'act-1', provider_id: 'biz-6', title: 'Tandem Paragliding Djurdjura', description: 'Soar over the stunning Djurdjura mountain range with a certified instructor. No experience needed.',
    category: 'activity', price_dzd: 8000, wilaya: 'Bejaia', region: 'Bejaia',
    coordinates: { latitude: 36.4634, longitude: 4.1673 },
    metadata: { kind: 'activity', activity_type: 'paragliding', session_duration_minutes: 45, max_participants: 1, walkin_allowed: false, pricing_model: 'fixed', equipment_included: true, difficulty: 'moderate' },
    created_at: '2026-01-20', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 4.9, review_count: 156,
    cover_image_url: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=800', photo_urls: [],
    tags: ['adventure', 'mountain', 'tandem'], family_friendly: false, is_vip: false,
  },
  {
    id: 'act-2', provider_id: 'biz-7', title: 'Scuba Diving Cap Carbon', description: 'Explore crystal-clear Mediterranean waters. Equipment and certified instructor included.',
    category: 'activity', price_dzd: 6000, wilaya: 'Bejaia', region: 'Bejaia',
    coordinates: { latitude: 36.7767, longitude: 5.0994 },
    metadata: { kind: 'activity', activity_type: 'diving', session_duration_minutes: 120, max_participants: 4, walkin_allowed: true, pricing_model: 'per_person', equipment_included: true, difficulty: 'challenging' },
    created_at: '2026-03-01', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.8, review_count: 98,
    cover_image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', photo_urls: [],
    tags: ['diving', 'sea', 'equipment'], family_friendly: false, is_vip: false,
  },

  // ── EVENTS ──
  {
    id: 'event-1', provider_id: 'biz-8', title: 'Raï Night Oran', description: 'Live raï music concert featuring top Algerian artists. An unforgettable night of music and dance.',
    category: 'event', price_dzd: 3500, wilaya: 'Oran', region: 'Oran',
    coordinates: { latitude: 35.69, longitude: -0.63 },
    metadata: { kind: 'event', event_type: 'concert', event_date: '2026-07-15', start_time: '21:00', end_time: '02:00', venue: 'Oran Arena', ticket_types: [{ name: 'General', price_dzd: 3500, quantity: 500 }, { name: 'VIP', price_dzd: 7000, quantity: 50 }], total_capacity: 550, age_restriction: '16+' },
    created_at: '2026-04-01', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 4.5, review_count: 320,
    cover_image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', photo_urls: [],
    tags: ['music', 'nightlife', 'rai'], family_friendly: false, is_vip: false,
  },

  // ── GUIDES ──
  {
    id: 'guide-1', provider_id: 'biz-9', title: 'Karim — Casbah Expert Guide', description: 'Licensed historian and certified guide. 15 years leading tours through the Casbah of Algiers.',
    category: 'guide', price_dzd: 4000, wilaya: 'Algiers', region: 'Algiers',
    coordinates: { latitude: 36.7882, longitude: 3.0594 },
    metadata: { kind: 'guide', specialization: 'Historical Heritage', languages: ['Arabic', 'French', 'English'], experience_years: 15, daily_rate_dzd: 4000, group_tours: true, max_group_size: 12, certifications: ['National Tourism License', 'First Aid'] },
    created_at: '2025-06-01', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.9, review_count: 412,
    cover_image_url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800', photo_urls: [],
    tags: ['historian', 'casbah', 'multilingual'], family_friendly: true, is_vip: false,
  },

  // ── PHOTOGRAPHERS ──
  {
    id: 'photo-1', provider_id: 'biz-10', title: 'Amina — Beach & Sunset Photography', description: 'Professional photographer specializing in beach portraits, sunset shoots, and travel photography.',
    category: 'photographer', price_dzd: 5000, wilaya: 'Tipaza', region: 'Tipaza',
    coordinates: { latitude: 36.5898, longitude: 2.4497 },
    metadata: { kind: 'photographer', style: ['portrait', 'landscape', 'editorial'], packages: [{ name: 'Quick Shoot', price_dzd: 5000, description: '30 min, 20 edited photos', deliverables: '20 edited digital photos' }, { name: 'Golden Hour', price_dzd: 10000, description: '1 hour, 50 edited photos + prints', deliverables: '50 edited photos + 5 prints' }], turnaround_days: 3, drone_available: true, portfolio_urls: [] },
    created_at: '2026-02-01', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.8, review_count: 87,
    cover_image_url: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800', photo_urls: [],
    tags: ['sunset', 'beach', 'drone'], family_friendly: true, is_vip: false,
  },

  // ── DRIVERS ──
  {
    id: 'driver-1', provider_id: 'biz-11', title: 'Youcef — Airport Transfers', description: 'Reliable airport transfer service. Comfortable sedans and SUVs. Flight tracking included.',
    category: 'driver', price_dzd: 3000, wilaya: 'Algiers', region: 'Algiers',
    coordinates: { latitude: 36.7538, longitude: 3.0588 },
    metadata: { kind: 'driver', vehicle_type: 'sedan', vehicle_name: 'Toyota Camry 2024', price_per_km_dzd: 50, fixed_routes: [{ from: 'Houari Boumediene Airport', to: 'Algiers City Center', price_dzd: 3000 }, { from: 'Algiers', to: 'Tipaza', price_dzd: 5000 }], airport_transfer: true, multi_day_hire: true },
    created_at: '2026-03-15', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.7, review_count: 203,
    cover_image_url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800', photo_urls: [],
    tags: ['airport', 'transfer', 'reliable'], family_friendly: true, is_vip: false,
  },

  // ── EXPERIENCES ──
  {
    id: 'exp-1', provider_id: 'biz-12', title: '3-Day Sahara Expedition', description: 'An unforgettable 3-day journey from Tamanrasset to the heart of the Hoggar Mountains. Includes camel trek, desert camp, and stargazing.',
    category: 'experience', price_dzd: 35000, wilaya: 'Tamanrasset', region: 'Tamanrasset',
    coordinates: { latitude: 22.7851, longitude: 5.5228 },
    metadata: { kind: 'experience', duration_days: 3, inclusions: ['transport', 'meals', 'desert camp', 'camel trek', 'guide', 'stargazing'], exclusions: ['flights', 'travel insurance', 'personal expenses'], max_group_size: 8, difficulty: 'moderate', departure_dates: ['2026-07-01', '2026-07-15', '2026-08-01'], price_per_person_dzd: 35000 },
    created_at: '2026-01-01', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 5.0, review_count: 67,
    cover_image_url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800', photo_urls: [],
    tags: ['sahara', 'desert', 'multi-day'], family_friendly: false, is_vip: true,
  },
];

/** Get all active listings */
export function getAllListings(): Listing[] {
  return MOCK_LISTINGS.filter((l) => l.is_active);
}

/** Get listings by category */
export function getListingsByCategory(category: string): Listing[] {
  return MOCK_LISTINGS.filter((l) => l.is_active && l.category === category);
}

/** Get listings by wilaya */
export function getListingsByWilaya(wilaya: string): Listing[] {
  return MOCK_LISTINGS.filter((l) => l.is_active && l.wilaya === wilaya);
}

/** Get a listing by ID */
export function getListingById(id: string): Listing | undefined {
  return MOCK_LISTINGS.find((l) => l.id === id);
}

/** Get featured listings */
export function getFeaturedListings(): Listing[] {
  return MOCK_LISTINGS.filter((l) => l.is_active && l.is_featured);
}

/** Search listings by query */
export function searchListings(query: string): Listing[] {
  const q = query.toLowerCase();
  return MOCK_LISTINGS.filter(
    (l) =>
      l.is_active &&
      (l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.wilaya.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q) ||
        l.tags.some((t) => t.toLowerCase().includes(q)))
  );
}

/** Get unique wilayas from listings */
export function getListingWilayas(): string[] {
  return [...new Set(MOCK_LISTINGS.map((l) => l.wilaya))];
}
