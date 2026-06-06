/**
 * RIHLA — Mock Marketplace Listings (Expanded)
 * ---------------------------------------------
 * 70 realistic listings for all 10 marketplace categories.
 * Spread across major Algerian wilayas.
 * Used until Supabase backend is connected.
 */

import type { Listing } from '@/types/service';

export const MOCK_LISTINGS: Listing[] = [
  // ═══════════════════════════════════════════
  //  HOTELS (7 listings)
  // ═══════════════════════════════════════════
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
  {
    id: 'hotel-3', provider_id: 'biz-13', title: 'Tlemcen Palace Hotel', description: 'Historic hotel near the Great Mosque of Tlemcen. Traditional decor with modern comforts.',
    category: 'hotel', price_dzd: 6500, wilaya: 'Tlemcen', region: 'Tlemcen',
    coordinates: { latitude: 34.8828, longitude: -1.3167 },
    metadata: { kind: 'hotel', room_count: 24, check_in_time: '14:00', check_out_time: '11:00', room_types: ['single', 'double', 'family'], breakfast_included: true, star_rating: 3, amenities: ['wifi', 'parking', 'restaurant', 'garden'], price_per_night_dzd: 6500 },
    created_at: '2025-11-01', updated_at: '2026-05-15', is_active: true, is_featured: false, rating: 4.3, review_count: 156,
    cover_image_url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800', photo_urls: [],
    tags: ['historic', 'central', 'garden'], family_friendly: true, is_vip: false,
  },
  {
    id: 'hotel-4', provider_id: 'biz-14', title: 'Bejaia Beach Resort', description: 'All-inclusive beachfront resort with private beach, water sports, and kids club.',
    category: 'hotel', price_dzd: 12000, wilaya: 'Bejaia', region: 'Bejaia',
    coordinates: { latitude: 36.75, longitude: 5.08 },
    metadata: { kind: 'hotel', room_count: 65, check_in_time: '14:00', check_out_time: '12:00', room_types: ['standard', 'superior', 'suite', 'family'], breakfast_included: true, star_rating: 4, amenities: ['wifi', 'pool', 'beach', 'spa', 'gym', 'kids_club', 'water_sports', 'parking'], price_per_night_dzd: 12000 },
    created_at: '2026-02-01', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 4.6, review_count: 289,
    cover_image_url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800', photo_urls: [],
    tags: ['resort', 'all-inclusive', 'beach'], family_friendly: true, is_vip: true,
  },
  {
    id: 'hotel-5', provider_id: 'biz-15', title: 'Ghardaia Oasis Lodge', description: 'Unique desert lodge in the M\'zab Valley. Traditional Mozabite architecture with modern amenities.',
    category: 'hotel', price_dzd: 5500, wilaya: 'Ghardaia', region: 'Ghardaia',
    coordinates: { latitude: 32.4912, longitude: 3.6736 },
    metadata: { kind: 'hotel', room_count: 18, check_in_time: '15:00', check_out_time: '11:00', room_types: ['standard', 'deluxe', 'suite'], breakfast_included: true, star_rating: 3, amenities: ['wifi', 'pool', 'restaurant', 'terrace', 'parking'], price_per_night_dzd: 5500 },
    created_at: '2026-03-15', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.5, review_count: 98,
    cover_image_url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800', photo_urls: [],
    tags: ['desert', 'oasis', 'traditional'], family_friendly: true, is_vip: false,
  },
  {
    id: 'hotel-6', provider_id: 'biz-16', title: 'Annaba Seaside Inn', description: 'Cozy seaside hotel steps from the beach. Perfect for a relaxing coastal getaway.',
    category: 'hotel', price_dzd: 7000, wilaya: 'Annaba', region: 'Annaba',
    coordinates: { latitude: 36.9, longitude: 7.7667 },
    metadata: { kind: 'hotel', room_count: 30, check_in_time: '14:00', check_out_time: '11:00', room_types: ['single', 'double', 'triple'], breakfast_included: false, star_rating: 3, amenities: ['wifi', 'beach', 'parking', 'restaurant'], price_per_night_dzd: 7000 },
    created_at: '2025-09-01', updated_at: '2026-04-10', is_active: true, is_featured: false, rating: 4.2, review_count: 134,
    cover_image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', photo_urls: [],
    tags: ['seaside', 'cozy', 'affordable'], family_friendly: true, is_vip: false,
  },
  {
    id: 'hotel-7', provider_id: 'biz-17', title: 'Djanet Desert Camp Hotel', description: 'Gateway to the Tassili n\'Ajjer. Luxury tents and stone rooms with stunning desert views.',
    category: 'hotel', price_dzd: 8500, wilaya: 'Djanet', region: 'Djanet',
    coordinates: { latitude: 24.5551, longitude: 9.4839 },
    metadata: { kind: 'hotel', room_count: 15, check_in_time: '14:00', check_out_time: '10:00', room_types: ['tent', 'stone_room', 'suite'], breakfast_included: true, star_rating: 4, amenities: ['wifi', 'restaurant', 'terrace', 'campfire', 'guide_service'], price_per_night_dzd: 8500 },
    created_at: '2026-01-01', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 4.8, review_count: 76,
    cover_image_url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800', photo_urls: [],
    tags: ['desert', 'luxury_tent', 'tassili'], family_friendly: false, is_vip: true,
  },

  // ═══════════════════════════════════════════
  //  RESTAURANTS (7 listings)
  // ═══════════════════════════════════════════
  {
    id: 'rest-1', provider_id: 'biz-3', title: 'Le Saveur de Constantine', description: 'Traditional Algerian cuisine with a modern twist. Famous for our couscous royal and mint tea.',
    category: 'restaurant', price_dzd: 2500, wilaya: 'Constantine', region: 'Constantine',
    coordinates: { latitude: 36.37, longitude: 6.61 },
    metadata: { kind: 'restaurant', cuisine_types: ['traditional', 'mediterranean'], menu_categories: ['starters', 'main', 'desserts', 'drinks'], avg_meal_price_dzd: 2500, reservation_required: false, opening_hours: '08:00-22:00', delivery_available: true, seating_capacity: 60 },
    created_at: '2025-10-01', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.6, review_count: 189,
    cover_image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', photo_urls: [],
    tags: ['traditional', 'family', 'delivery'], family_friendly: true, is_vip: false,
  },
  {
    id: 'rest-2', provider_id: 'biz-19', title: 'Cafe Diar El Djazair', description: 'Authentic Algerian cafe in the Casbah. Famous for traditional pastries and coffee.',
    category: 'restaurant', price_dzd: 800, wilaya: 'Algiers', region: 'Algiers',
    coordinates: { latitude: 36.7833, longitude: 3.0583 },
    metadata: { kind: 'restaurant', cuisine_types: ['cafe', 'pastry'], menu_categories: ['coffee', 'pastries', 'sandwiches', 'drinks'], avg_meal_price_dzd: 800, reservation_required: false, opening_hours: '07:00-21:00', delivery_available: false, seating_capacity: 35 },
    created_at: '2025-05-01', updated_at: '2026-05-15', is_active: true, is_featured: true, rating: 4.8, review_count: 456,
    cover_image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800', photo_urls: [],
    tags: ['cafe', 'traditional', 'casbah'], family_friendly: true, is_vip: false,
  },
  {
    id: 'rest-3', provider_id: 'biz-20', title: 'Pizza Palace Oran', description: 'Best wood-fired pizza in Oran. Italian-Algerian fusion with fresh local ingredients.',
    category: 'restaurant', price_dzd: 1800, wilaya: 'Oran', region: 'Oran',
    coordinates: { latitude: 35.695, longitude: -0.635 },
    metadata: { kind: 'restaurant', cuisine_types: ['italian', 'pizza', 'fusion'], menu_categories: ['pasta', 'pizza', 'salads', 'desserts', 'drinks'], avg_meal_price_dzd: 1800, reservation_required: false, opening_hours: '11:00-23:00', delivery_available: true, seating_capacity: 80 },
    created_at: '2026-01-10', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.5, review_count: 234,
    cover_image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', photo_urls: [],
    tags: ['pizza', 'italian', 'delivery'], family_friendly: true, is_vip: false,
  },
  {
    id: 'rest-4', provider_id: 'biz-21', title: 'Le Jardin Tipaza', description: 'Garden restaurant with sea views. French-Algerian cuisine and fresh seafood.',
    category: 'restaurant', price_dzd: 3200, wilaya: 'Tipaza', region: 'Tipaza',
    coordinates: { latitude: 36.59, longitude: 2.45 },
    metadata: { kind: 'restaurant', cuisine_types: ['french', 'seafood', 'mediterranean'], menu_categories: ['starters', 'seafood', 'meat', 'desserts', 'wines'], avg_meal_price_dzd: 3200, reservation_required: true, opening_hours: '12:00-23:00', delivery_available: false, seating_capacity: 45 },
    created_at: '2025-07-01', updated_at: '2026-05-20', is_active: true, is_featured: true, rating: 4.7, review_count: 178,
    cover_image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', photo_urls: [],
    tags: ['seafood', 'garden', 'romantic'], family_friendly: false, is_vip: true,
  },
  {
    id: 'rest-5', provider_id: 'biz-22', title: 'Tlemcen Sweets House', description: 'Famous for traditional Tlemcen pastries and desserts. A must-visit for sweet lovers.',
    category: 'restaurant', price_dzd: 600, wilaya: 'Tlemcen', region: 'Tlemcen',
    coordinates: { latitude: 34.88, longitude: -1.32 },
    metadata: { kind: 'restaurant', cuisine_types: ['pastry', 'desserts'], menu_categories: ['pastries', 'ice_cream', 'drinks'], avg_meal_price_dzd: 600, reservation_required: false, opening_hours: '09:00-22:00', delivery_available: true, seating_capacity: 25 },
    created_at: '2025-04-01', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.9, review_count: 567,
    cover_image_url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800', photo_urls: [],
    tags: ['pastry', 'traditional', 'sweets'], family_friendly: true, is_vip: false,
  },
  {
    id: 'rest-6', provider_id: 'biz-23', title: 'Sahara Grill House', description: 'Desert-themed grill restaurant. Camel meat specialties and traditional Berber dishes.',
    category: 'restaurant', price_dzd: 2200, wilaya: 'Tamanrasset', region: 'Tamanrasset',
    coordinates: { latitude: 22.785, longitude: 5.523 },
    metadata: { kind: 'restaurant', cuisine_types: ['grill', 'berber', 'desert'], menu_categories: ['grills', 'traditional', 'sides', 'drinks'], avg_meal_price_dzd: 2200, reservation_required: false, opening_hours: '10:00-22:00', delivery_available: false, seating_capacity: 40 },
    created_at: '2026-02-15', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.4, review_count: 89,
    cover_image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', photo_urls: [],
    tags: ['grill', 'desert', 'berber'], family_friendly: true, is_vip: false,
  },
  {
    id: 'rest-7', provider_id: 'biz-24', title: 'Bejaia Fish Market', description: 'Fresh catch of the day, grilled to perfection. Seaside dining with stunning views.',
    category: 'restaurant', price_dzd: 2800, wilaya: 'Bejaia', region: 'Bejaia',
    coordinates: { latitude: 36.75, longitude: 5.08 },
    metadata: { kind: 'restaurant', cuisine_types: ['seafood', 'grill'], menu_categories: ['fresh_fish', 'grills', 'salads', 'drinks'], avg_meal_price_dzd: 2800, reservation_required: false, opening_hours: '11:00-22:00', delivery_available: false, seating_capacity: 70 },
    created_at: '2026-03-01', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 4.6, review_count: 203,
    cover_image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', photo_urls: [],
    tags: ['seafood', 'fresh', 'seaside'], family_friendly: true, is_vip: false,
  },

  // ═══════════════════════════════════════════
  //  BEACHES (7 listings)
  // ═══════════════════════════════════════════
  {
    id: 'beach-1', provider_id: 'biz-4', title: 'Sidi Fredj Family Zone', description: 'Premium beach spot with umbrella, chairs, and direct sea access. Family-friendly zone with lifeguard on duty.',
    category: 'beach', price_dzd: 1500, wilaya: 'Tipaza', region: 'Algiers',
    coordinates: { latitude: 36.7369, longitude: 2.8658 },
    metadata: { kind: 'beach', grid_layout: '4x6_family', total_rows: 4, total_cols: 6, zone: 'family', price_per_spot_dzd: 1500, hold_enabled: true, hold_duration_minutes: 20, services: ['parking', 'food', 'showers', 'photos'] },
    created_at: '2026-03-01', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 4.7, review_count: 1243,
    cover_image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', photo_urls: [],
    tags: ['family', 'umbrella', 'lifeguard'], family_friendly: true, is_vip: false,
  },
  {
    id: 'beach-2', provider_id: 'biz-25', title: 'Jijel Coral Beach', description: 'Crystal-clear waters with natural coral formations. Snorkeling and diving paradise.',
    category: 'beach', price_dzd: 1200, wilaya: 'Jijel', region: 'Jijel',
    coordinates: { latitude: 36.82, longitude: 5.77 },
    metadata: { kind: 'beach', grid_layout: '3x8_standard', total_rows: 3, total_cols: 8, zone: 'free', price_per_spot_dzd: 1200, hold_enabled: true, hold_duration_minutes: 15, services: ['parking', 'showers', 'equipment_rental'] },
    created_at: '2026-04-01', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.5, review_count: 345,
    cover_image_url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800', photo_urls: [],
    tags: ['snorkeling', 'coral', 'crystal-clear'], family_friendly: true, is_vip: false,
  },
  {
    id: 'beach-3', provider_id: 'biz-26', title: 'Annaba Golden Sands', description: 'Wide sandy beach with calm waters. Perfect for families with young children.',
    category: 'beach', price_dzd: 800, wilaya: 'Annaba', region: 'Annaba',
    coordinates: { latitude: 36.9, longitude: 7.77 },
    metadata: { kind: 'beach', grid_layout: '5x10_standard', total_rows: 5, total_cols: 10, zone: 'free', price_per_spot_dzd: 800, hold_enabled: false, hold_duration_minutes: 0, services: ['parking', 'food', 'showers', 'toilets'] },
    created_at: '2026-01-15', updated_at: '2026-05-20', is_active: true, is_featured: false, rating: 4.3, review_count: 567,
    cover_image_url: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800', photo_urls: [],
    tags: ['sandy', 'calm', 'family'], family_friendly: true, is_vip: false,
  },
  {
    id: 'beach-4', provider_id: 'biz-27', title: 'Oran VIP Beach Club', description: 'Exclusive beach club with private cabanas, infinity pool, and VIP service.',
    category: 'beach', price_dzd: 3500, wilaya: 'Oran', region: 'Oran',
    coordinates: { latitude: 35.697, longitude: -0.633 },
    metadata: { kind: 'beach', grid_layout: '3x4_vip', total_rows: 3, total_cols: 4, zone: 'vip', price_per_spot_dzd: 3500, hold_enabled: true, hold_duration_minutes: 30, services: ['parking', 'food', 'drinks', 'towels', 'showers', 'photos', 'massage'] },
    created_at: '2026-05-01', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 4.8, review_count: 189,
    cover_image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', photo_urls: [],
    tags: ['vip', 'cabana', 'infinity_pool'], family_friendly: false, is_vip: true,
  },
  {
    id: 'beach-5', provider_id: 'biz-28', title: 'Bejaia Rock Beach', description: 'Unique rocky beach with natural pools. Great for snorkeling and exploring marine life.',
    category: 'beach', price_dzd: 600, wilaya: 'Bejaia', region: 'Bejaia',
    coordinates: { latitude: 36.75, longitude: 5.09 },
    metadata: { kind: 'beach', grid_layout: '2x6_standard', total_rows: 2, total_cols: 6, zone: 'free', price_per_spot_dzd: 600, hold_enabled: false, hold_duration_minutes: 0, services: ['parking', 'showers'] },
    created_at: '2026-02-10', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.4, review_count: 234,
    cover_image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', photo_urls: [],
    tags: ['rocky', 'natural_pools', 'snorkeling'], family_friendly: false, is_vip: false,
  },
  {
    id: 'beach-6', provider_id: 'biz-29', title: 'Skikda Blue Lagoon', description: 'Sheltered lagoon with calm turquoise waters. Perfect for swimming and paddleboarding.',
    category: 'beach', price_dzd: 900, wilaya: 'Skikda', region: 'Skikda',
    coordinates: { latitude: 36.88, longitude: 6.9 },
    metadata: { kind: 'beach', grid_layout: '4x7_standard', total_rows: 4, total_cols: 7, zone: 'free', price_per_spot_dzd: 900, hold_enabled: true, hold_duration_minutes: 15, services: ['parking', 'food', 'showers', 'equipment_rental'] },
    created_at: '2026-03-20', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.6, review_count: 178,
    cover_image_url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800', photo_urls: [],
    tags: ['lagoon', 'turquoise', 'paddleboard'], family_friendly: true, is_vip: false,
  },
  {
    id: 'beach-7', provider_id: 'biz-30', title: 'Tlemcen Mediterranean Cove', description: 'Hidden cove with crystal-clear Mediterranean waters. Secluded and peaceful.',
    category: 'beach', price_dzd: 1000, wilaya: 'Tlemcen', region: 'Tlemcen',
    coordinates: { latitude: 34.88, longitude: -1.32 },
    metadata: { kind: 'beach', grid_layout: '2x5_standard', total_rows: 2, total_cols: 5, zone: 'free', price_per_spot_dzd: 1000, hold_enabled: false, hold_duration_minutes: 0, services: ['parking', 'showers'] },
    created_at: '2026-04-15', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.5, review_count: 89,
    cover_image_url: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800', photo_urls: [],
    tags: ['cove', 'secluded', 'mediterranean'], family_friendly: true, is_vip: false,
  },

  // ═══════════════════════════════════════════
  //  RENTALS (7 listings)
  // ═══════════════════════════════════════════
  {
    id: 'rental-1', provider_id: 'biz-5', title: 'Villa Oran Seafront', description: 'Stunning 4-bedroom villa with private pool and direct beach access. Perfect for family holidays.',
    category: 'rental', price_dzd: 18000, wilaya: 'Oran', region: 'Oran',
    coordinates: { latitude: 35.6969, longitude: -0.6331 },
    metadata: { kind: 'rental', bedrooms: 4, bathrooms: 3, max_guests: 10, price_per_night_dzd: 18000, amenities: ['pool', 'wifi', 'parking', 'ac', 'kitchen', 'bbq'], monthly_available: true, property_type: 'villa' },
    created_at: '2026-02-10', updated_at: '2026-05-15', is_active: true, is_featured: false, rating: 4.8, review_count: 87,
    cover_image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', photo_urls: [],
    tags: ['villa', 'pool', 'seafront'], family_friendly: true, is_vip: true,
  },
  {
    id: 'rental-2', provider_id: 'biz-31', title: 'Algiers Downtown Apartment', description: 'Modern 2-bedroom apartment in the heart of Algiers. Walking distance to major attractions.',
    category: 'rental', price_dzd: 6500, wilaya: 'Algiers', region: 'Algiers',
    coordinates: { latitude: 36.7538, longitude: 3.0588 },
    metadata: { kind: 'rental', bedrooms: 2, bathrooms: 1, max_guests: 4, price_per_night_dzd: 6500, amenities: ['wifi', 'ac', 'kitchen', 'washer'], monthly_available: true, property_type: 'apartment' },
    created_at: '2026-01-05', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 4.6, review_count: 234,
    cover_image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', photo_urls: [],
    tags: ['apartment', 'downtown', 'modern'], family_friendly: true, is_vip: false,
  },
  {
    id: 'rental-3', provider_id: 'biz-32', title: 'Constantine Cliff House', description: 'Unique house built into the cliffs of Constantine. Breathtaking views of the Rhumel River.',
    category: 'rental', price_dzd: 8000, wilaya: 'Constantine', region: 'Constantine',
    coordinates: { latitude: 36.365, longitude: 6.615 },
    metadata: { kind: 'rental', bedrooms: 3, bathrooms: 2, max_guests: 6, price_per_night_dzd: 8000, amenities: ['wifi', 'ac', 'kitchen', 'terrace', 'parking'], monthly_available: false, property_type: 'house' },
    created_at: '2025-12-01', updated_at: '2026-05-20', is_active: true, is_featured: false, rating: 4.7, review_count: 156,
    cover_image_url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800', photo_urls: [],
    tags: ['cliff', 'view', 'unique'], family_friendly: true, is_vip: false,
  },
  {
    id: 'rental-4', provider_id: 'biz-33', title: 'Tamanrasset Desert Camp', description: 'Luxury desert camp with private tents, outdoor shower, and stargazing platform.',
    category: 'rental', price_dzd: 12000, wilaya: 'Tamanrasset', region: 'Tamanrasset',
    coordinates: { latitude: 22.785, longitude: 5.523 },
    metadata: { kind: 'rental', bedrooms: 0, bathrooms: 1, max_guests: 2, price_per_night_dzd: 12000, amenities: ['wifi', 'ac', 'outdoor_shower', 'stargazing', 'campfire'], monthly_available: false, property_type: 'house' },
    created_at: '2026-03-01', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 4.9, review_count: 67,
    cover_image_url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800', photo_urls: [],
    tags: ['desert', 'luxury', 'stargazing'], family_friendly: false, is_vip: true,
  },
  {
    id: 'rental-5', provider_id: 'biz-34', title: 'Bejaia Coastal Studio', description: 'Cozy studio apartment with sea view balcony. Perfect for couples.',
    category: 'rental', price_dzd: 4500, wilaya: 'Bejaia', region: 'Bejaia',
    coordinates: { latitude: 36.75, longitude: 5.08 },
    metadata: { kind: 'rental', bedrooms: 1, bathrooms: 1, max_guests: 2, price_per_night_dzd: 4500, amenities: ['wifi', 'ac', 'balcony', 'kitchen'], monthly_available: true, property_type: 'studio' },
    created_at: '2026-04-10', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.4, review_count: 89,
    cover_image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', photo_urls: [],
    tags: ['studio', 'sea_view', 'cozy'], family_friendly: false, is_vip: false,
  },
  {
    id: 'rental-6', provider_id: 'biz-35', title: 'Tipaza Garden Villa', description: 'Spacious villa with large garden and olive trees. Quiet neighborhood near the beach.',
    category: 'rental', price_dzd: 10000, wilaya: 'Tipaza', region: 'Tipaza',
    coordinates: { latitude: 36.59, longitude: 2.45 },
    metadata: { kind: 'rental', bedrooms: 5, bathrooms: 3, max_guests: 12, price_per_night_dzd: 10000, amenities: ['wifi', 'parking', 'ac', 'kitchen', 'garden', 'bbq'], monthly_available: true, property_type: 'villa' },
    created_at: '2025-09-15', updated_at: '2026-05-10', is_active: true, is_featured: false, rating: 4.5, review_count: 123,
    cover_image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', photo_urls: [],
    tags: ['villa', 'garden', 'quiet'], family_friendly: true, is_vip: false,
  },
  {
    id: 'rental-7', provider_id: 'biz-36', title: 'Ghardaia Traditional House', description: 'Authentic Mozabite house with courtyard and rooftop terrace. Cultural immersion experience.',
    category: 'rental', price_dzd: 3500, wilaya: 'Ghardaia', region: 'Ghardaia',
    coordinates: { latitude: 32.491, longitude: 3.674 },
    metadata: { kind: 'rental', bedrooms: 2, bathrooms: 1, max_guests: 4, price_per_night_dzd: 3500, amenities: ['wifi', 'courtyard', 'rooftop', 'kitchen'], monthly_available: false, property_type: 'house' },
    created_at: '2026-05-01', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.6, review_count: 45,
    cover_image_url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800', photo_urls: [],
    tags: ['traditional', 'courtyard', 'cultural'], family_friendly: true, is_vip: false,
  },

  // ═══════════════════════════════════════════
  //  ACTIVITIES (7 listings)
  // ═══════════════════════════════════════════
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
  {
    id: 'act-3', provider_id: 'biz-37', title: 'Hiking Chrea National Park', description: 'Guided hike through Algeria\'s oldest national park. See cedar forests and diverse wildlife.',
    category: 'activity', price_dzd: 2500, wilaya: 'Blida', region: 'Blida',
    coordinates: { latitude: 36.42, longitude: 2.87 },
    metadata: { kind: 'activity', activity_type: 'hiking', session_duration_minutes: 240, max_participants: 10, walkin_allowed: true, pricing_model: 'per_person', equipment_included: false, difficulty: 'moderate' },
    created_at: '2026-02-15', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.7, review_count: 234,
    cover_image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800', photo_urls: [],
    tags: ['hiking', 'nature', 'park'], family_friendly: true, is_vip: false,
  },
  {
    id: 'act-4', provider_id: 'biz-38', title: 'Camel Trek Sahara', description: 'Multi-hour camel trek through the Grand Erg Oriental. Traditional Berber guide included.',
    category: 'activity', price_dzd: 4500, wilaya: 'Ghardaia', region: 'Ghardaia',
    coordinates: { latitude: 32.491, longitude: 3.674 },
    metadata: { kind: 'activity', activity_type: 'camel_trek', session_duration_minutes: 180, max_participants: 6, walkin_allowed: false, pricing_model: 'per_person', equipment_included: true, difficulty: 'easy' },
    created_at: '2026-04-01', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 4.8, review_count: 123,
    cover_image_url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800', photo_urls: [],
    tags: ['camel', 'desert', 'berber'], family_friendly: true, is_vip: false,
  },
  {
    id: 'act-5', provider_id: 'biz-39', title: 'Jet Skiing Oran Bay', description: 'High-speed jet ski rental on Oran Bay. Safety briefing and life jacket included.',
    category: 'activity', price_dzd: 3000, wilaya: 'Oran', region: 'Oran',
    coordinates: { latitude: 35.697, longitude: -0.633 },
    metadata: { kind: 'activity', activity_type: 'water_sports', session_duration_minutes: 30, max_participants: 1, walkin_allowed: true, pricing_model: 'fixed', equipment_included: true, difficulty: 'easy' },
    created_at: '2026-05-10', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.5, review_count: 89,
    cover_image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', photo_urls: [],
    tags: ['jet_ski', 'water', 'speed'], family_friendly: false, is_vip: false,
  },
  {
    id: 'act-6', provider_id: 'biz-40', title: 'Rock Climbing Tikjda', description: 'Guided rock climbing in the Djurdjura mountains. All equipment provided.',
    category: 'activity', price_dzd: 5000, wilaya: 'Tizi Ouzou', region: 'Tizi Ouzou',
    coordinates: { latitude: 36.43, longitude: 3.98 },
    metadata: { kind: 'activity', activity_type: 'climbing', session_duration_minutes: 180, max_participants: 4, walkin_allowed: false, pricing_model: 'per_person', equipment_included: true, difficulty: 'challenging' },
    created_at: '2026-03-20', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.6, review_count: 67,
    cover_image_url: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=800', photo_urls: [],
    tags: ['climbing', 'mountain', 'adventure'], family_friendly: false, is_vip: false,
  },
  {
    id: 'act-7', provider_id: 'biz-41', title: 'Horseback Riding Constantine', description: 'Scenic horseback ride through the Constantine countryside. Suitable for beginners.',
    category: 'activity', price_dzd: 3500, wilaya: 'Constantine', region: 'Constantine',
    coordinates: { latitude: 36.365, longitude: 6.615 },
    metadata: { kind: 'activity', activity_type: 'horseback', session_duration_minutes: 90, max_participants: 6, walkin_allowed: true, pricing_model: 'per_person', equipment_included: true, difficulty: 'easy' },
    created_at: '2026-01-10', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.4, review_count: 145,
    cover_image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800', photo_urls: [],
    tags: ['horseback', 'scenic', 'beginner'], family_friendly: true, is_vip: false,
  },

  // ═══════════════════════════════════════════
  //  EVENTS (7 listings)
  // ═══════════════════════════════════════════
  {
    id: 'event-1', provider_id: 'biz-8', title: 'Rai Night Oran', description: 'Live rai music concert featuring top Algerian artists. An unforgettable night of music and dance.',
    category: 'event', price_dzd: 3500, wilaya: 'Oran', region: 'Oran',
    coordinates: { latitude: 35.69, longitude: -0.63 },
    metadata: { kind: 'event', event_type: 'concert', event_date: '2026-07-15', start_time: '21:00', end_time: '02:00', venue: 'Oran Arena', ticket_types: [{ name: 'General', price_dzd: 3500, quantity: 500 }, { name: 'VIP', price_dzd: 7000, quantity: 50 }], total_capacity: 550, age_restriction: '16+' },
    created_at: '2026-04-01', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 4.5, review_count: 320,
    cover_image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', photo_urls: [],
    tags: ['music', 'nightlife', 'rai'], family_friendly: false, is_vip: false,
  },
  {
    id: 'event-2', provider_id: 'biz-42', title: 'Algiers Jazz Festival', description: 'Annual jazz festival with international and Algerian musicians. Three days of smooth jazz.',
    category: 'event', price_dzd: 5000, wilaya: 'Algiers', region: 'Algiers',
    coordinates: { latitude: 36.7538, longitude: 3.0588 },
    metadata: { kind: 'event', event_type: 'festival', event_date: '2026-08-10', start_time: '18:00', end_time: '23:00', venue: 'Algiers Opera House', ticket_types: [{ name: 'Day Pass', price_dzd: 5000, quantity: 300 }, { name: '3-Day Pass', price_dzd: 12000, quantity: 100 }], total_capacity: 400, age_restriction: 'All ages' },
    created_at: '2026-05-01', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 4.8, review_count: 189,
    cover_image_url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800', photo_urls: [],
    tags: ['jazz', 'festival', 'international'], family_friendly: true, is_vip: false,
  },
  {
    id: 'event-3', provider_id: 'biz-43', title: 'Constantine Heritage Night', description: 'Cultural evening with traditional music, dance, and storytelling at the Ahmed Bey Palace.',
    category: 'event', price_dzd: 2000, wilaya: 'Constantine', region: 'Constantine',
    coordinates: { latitude: 36.365, longitude: 6.615 },
    metadata: { kind: 'event', event_type: 'cultural', event_date: '2026-07-20', start_time: '19:00', end_time: '22:00', venue: 'Ahmed Bey Palace', ticket_types: [{ name: 'Standard', price_dzd: 2000, quantity: 200 }], total_capacity: 200, age_restriction: 'All ages' },
    created_at: '2026-04-15', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.6, review_count: 156,
    cover_image_url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800', photo_urls: [],
    tags: ['cultural', 'heritage', 'traditional'], family_friendly: true, is_vip: false,
  },
  {
    id: 'event-4', provider_id: 'biz-44', title: 'Tipaza Summer Comedy Show', description: 'Stand-up comedy night featuring Algeria\'s funniest comedians. Bring your friends!',
    category: 'event', price_dzd: 1500, wilaya: 'Tipaza', region: 'Tipaza',
    coordinates: { latitude: 36.59, longitude: 2.45 },
    metadata: { kind: 'event', event_type: 'comedy', event_date: '2026-07-05', start_time: '20:00', end_time: '22:30', venue: 'Tipaza Amphitheater', ticket_types: [{ name: 'Standard', price_dzd: 1500, quantity: 300 }, { name: 'Front Row', price_dzd: 2500, quantity: 30 }], total_capacity: 330, age_restriction: '14+' },
    created_at: '2026-05-10', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.3, review_count: 89,
    cover_image_url: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800', photo_urls: [],
    tags: ['comedy', 'stand-up', 'fun'], family_friendly: false, is_vip: false,
  },
  {
    id: 'event-5', provider_id: 'biz-45', title: 'Annaba Beach Music Festival', description: 'Three-day beach music festival with DJs, live bands, and food stalls.',
    category: 'event', price_dzd: 4000, wilaya: 'Annaba', region: 'Annaba',
    coordinates: { latitude: 36.9, longitude: 7.77 },
    metadata: { kind: 'event', event_type: 'music_festival', event_date: '2026-08-01', start_time: '16:00', end_time: '01:00', venue: 'Annaba Beach Club', ticket_types: [{ name: 'Day Pass', price_dzd: 4000, quantity: 400 }, { name: '3-Day Pass', price_dzd: 9000, quantity: 150 }], total_capacity: 550, age_restriction: '16+' },
    created_at: '2026-05-20', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 4.7, review_count: 234,
    cover_image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', photo_urls: [],
    tags: ['music', 'beach', 'festival'], family_friendly: false, is_vip: false,
  },
  {
    id: 'event-6', provider_id: 'biz-46', title: 'Tlemcen Crafts Fair', description: 'Annual traditional crafts fair showcasing Algerian artisans and their work.',
    category: 'event', price_dzd: 500, wilaya: 'Tlemcen', region: 'Tlemcen',
    coordinates: { latitude: 34.88, longitude: -1.32 },
    metadata: { kind: 'event', event_type: 'fair', event_date: '2026-07-25', start_time: '09:00', end_time: '18:00', venue: 'Tlemcen Grand Mosque Square', ticket_types: [{ name: 'Entry', price_dzd: 500, quantity: 1000 }], total_capacity: 1000, age_restriction: 'All ages' },
    created_at: '2026-04-01', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.5, review_count: 345,
    cover_image_url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800', photo_urls: [],
    tags: ['crafts', 'artisan', 'traditional'], family_friendly: true, is_vip: false,
  },
  {
    id: 'event-7', provider_id: 'biz-47', title: 'Djanet Desert Night Sky Show', description: 'Stargazing event with telescopes and an astronomer guide. Witness the Milky Way in the Sahara.',
    category: 'event', price_dzd: 2500, wilaya: 'Djanet', region: 'Djanet',
    coordinates: { latitude: 24.555, longitude: 9.484 },
    metadata: { kind: 'event', event_type: 'stargazing', event_date: '2026-08-05', start_time: '20:00', end_time: '00:00', venue: 'Djanet Desert Camp', ticket_types: [{ name: 'Standard', price_dzd: 2500, quantity: 50 }], total_capacity: 50, age_restriction: 'All ages' },
    created_at: '2026-05-15', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 4.9, review_count: 67,
    cover_image_url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800', photo_urls: [],
    tags: ['stargazing', 'desert', 'astronomy'], family_friendly: true, is_vip: false,
  },

  // ═══════════════════════════════════════════
  //  GUIDES (7 listings)
  // ═══════════════════════════════════════════
  {
    id: 'guide-1', provider_id: 'biz-9', title: 'Karim — Casbah Expert Guide', description: 'Licensed historian and certified guide. 15 years leading tours through the Casbah of Algiers.',
    category: 'guide', price_dzd: 4000, wilaya: 'Algiers', region: 'Algiers',
    coordinates: { latitude: 36.7882, longitude: 3.0594 },
    metadata: { kind: 'guide', specialization: 'Historical Heritage', languages: ['Arabic', 'French', 'English'], experience_years: 15, daily_rate_dzd: 4000, group_tours: true, max_group_size: 12, certifications: ['National Tourism License', 'First Aid'] },
    created_at: '2025-06-01', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.9, review_count: 412,
    cover_image_url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800', photo_urls: [],
    tags: ['historian', 'casbah', 'multilingual'], family_friendly: true, is_vip: false,
  },
  {
    id: 'guide-2', provider_id: 'biz-48', title: 'Fatima — Sahara Desert Guide', description: 'Born and raised in the Sahara. Specializes in desert treks, Berber culture, and astronomical tours.',
    category: 'guide', price_dzd: 5500, wilaya: 'Tamanrasset', region: 'Tamanrasset',
    coordinates: { latitude: 22.785, longitude: 5.523 },
    metadata: { kind: 'guide', specialization: 'Desert Expeditions', languages: ['Arabic', 'French', 'Tamazight'], experience_years: 10, daily_rate_dzd: 5500, group_tours: true, max_group_size: 8, certifications: ['Desert Survival Certified', 'First Aid', 'Astronomy Guide'] },
    created_at: '2025-09-01', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 4.9, review_count: 189,
    cover_image_url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800', photo_urls: [],
    tags: ['sahara', 'berber', 'astronomy'], family_friendly: true, is_vip: true,
  },
  {
    id: 'guide-3', provider_id: 'biz-49', title: 'Youcef — Constantine Bridges Tour', description: 'Expert on Constantine\'s famous bridges and Ottoman heritage. Walking and driving tours available.',
    category: 'guide', price_dzd: 3500, wilaya: 'Constantine', region: 'Constantine',
    coordinates: { latitude: 36.365, longitude: 6.615 },
    metadata: { kind: 'guide', specialization: 'Urban Heritage', languages: ['Arabic', 'French'], experience_years: 8, daily_rate_dzd: 3500, group_tours: true, max_group_size: 15, certifications: ['National Tourism License'] },
    created_at: '2026-01-15', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.7, review_count: 234,
    cover_image_url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800', photo_urls: [],
    tags: ['bridges', 'ottoman', 'urban'], family_friendly: true, is_vip: false,
  },
  {
    id: 'guide-4', provider_id: 'biz-50', title: 'Nadia — Tipaza Archaeology Guide', description: 'Archaeologist and certified guide. Deep knowledge of Roman ruins and Phoenician history.',
    category: 'guide', price_dzd: 4500, wilaya: 'Tipaza', region: 'Tipaza',
    coordinates: { latitude: 36.59, longitude: 2.45 },
    metadata: { kind: 'guide', specialization: 'Archaeology & Roman History', languages: ['Arabic', 'French', 'English', 'Spanish'], experience_years: 12, daily_rate_dzd: 4500, group_tours: true, max_group_size: 20, certifications: ['Archaeology Degree', 'National Tourism License', 'First Aid'] },
    created_at: '2025-07-01', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 4.8, review_count: 156,
    cover_image_url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800', photo_urls: [],
    tags: ['archaeology', 'roman', 'history'], family_friendly: true, is_vip: false,
  },
  {
    id: 'guide-5', provider_id: 'biz-51', title: 'Amine — Bejaia Nature Guide', description: 'Nature and adventure guide specializing in Djurdjura treks, coastal hikes, and wildlife spotting.',
    category: 'guide', price_dzd: 3000, wilaya: 'Bejaia', region: 'Bejaia',
    coordinates: { latitude: 36.75, longitude: 5.08 },
    metadata: { kind: 'guide', specialization: 'Nature & Adventure', languages: ['Arabic', 'French', 'Kabyle'], experience_years: 7, daily_rate_dzd: 3000, group_tours: true, max_group_size: 10, certifications: ['Mountain Guide Certified', 'First Aid', 'Wildlife Conservation'] },
    created_at: '2026-02-01', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.6, review_count: 123,
    cover_image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800', photo_urls: [],
    tags: ['nature', 'djurdjura', 'wildlife'], family_friendly: true, is_vip: false,
  },
  {
    id: 'guide-6', provider_id: 'biz-52', title: 'Meriem — Tlemcen Cultural Guide', description: 'Art historian and cultural guide. Specializes in Islamic architecture and traditional crafts.',
    category: 'guide', price_dzd: 3200, wilaya: 'Tlemcen', region: 'Tlemcen',
    coordinates: { latitude: 34.88, longitude: -1.32 },
    metadata: { kind: 'guide', specialization: 'Islamic Architecture & Crafts', languages: ['Arabic', 'French'], experience_years: 9, daily_rate_dzd: 3200, group_tours: true, max_group_size: 12, certifications: ['National Tourism License', 'Art History Degree'] },
    created_at: '2026-03-10', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.7, review_count: 98,
    cover_image_url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800', photo_urls: [],
    tags: ['architecture', 'crafts', 'islamic'], family_friendly: true, is_vip: false,
  },
  {
    id: 'guide-7', provider_id: 'biz-53', title: 'Omar — Djanet Rock Art Guide', description: 'Expert on Tassili n\'Ajjer rock art and prehistoric heritage. Multilingual and passionate.',
    category: 'guide', price_dzd: 6000, wilaya: 'Djanet', region: 'Djanet',
    coordinates: { latitude: 24.555, longitude: 9.484 },
    metadata: { kind: 'guide', specialization: 'Prehistoric Rock Art', languages: ['Arabic', 'French', 'English'], experience_years: 20, daily_rate_dzd: 6000, group_tours: true, max_group_size: 6, certifications: ['UNESCO Heritage Guide', 'Desert Survival', 'First Aid'] },
    created_at: '2025-03-01', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 5.0, review_count: 89,
    cover_image_url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800', photo_urls: [],
    tags: ['rock_art', 'tassili', 'prehistoric'], family_friendly: false, is_vip: true,
  },

  // ═══════════════════════════════════════════
  //  PHOTOGRAPHERS (7 listings)
  // ═══════════════════════════════════════════
  {
    id: 'photo-1', provider_id: 'biz-10', title: 'Amina — Beach & Sunset Photography', description: 'Professional photographer specializing in beach portraits, sunset shoots, and travel photography.',
    category: 'photographer', price_dzd: 5000, wilaya: 'Tipaza', region: 'Tipaza',
    coordinates: { latitude: 36.5898, longitude: 2.4497 },
    metadata: { kind: 'photographer', style: ['portrait', 'landscape', 'editorial'], packages: [{ name: 'Quick Shoot', price_dzd: 5000, description: '30 min, 20 edited photos', deliverables: '20 edited digital photos' }, { name: 'Golden Hour', price_dzd: 10000, description: '1 hour, 50 edited photos + prints', deliverables: '50 edited photos + 5 prints' }], turnaround_days: 3, drone_available: true, portfolio_urls: [] },
    created_at: '2026-02-01', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.8, review_count: 87,
    cover_image_url: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800', photo_urls: [],
    tags: ['sunset', 'beach', 'drone'], family_friendly: true, is_vip: false,
  },
  {
    id: 'photo-2', provider_id: 'biz-54', title: 'Rachid — Desert Landscape Photographer', description: 'Award-winning desert photographer. Captures the magic of the Sahara at golden hour.',
    category: 'photographer', price_dzd: 8000, wilaya: 'Tamanrasset', region: 'Tamanrasset',
    coordinates: { latitude: 22.785, longitude: 5.523 },
    metadata: { kind: 'photographer', style: ['landscape', 'travel', 'documentary'], packages: [{ name: 'Desert Session', price_dzd: 8000, description: '2 hours, 40 edited photos', deliverables: '40 edited digital photos' }, { name: 'Full Day Expedition', price_dzd: 20000, description: 'Full day, 100+ photos, drone footage', deliverables: '100+ edited photos + 4K drone video' }], turnaround_days: 5, drone_available: true, portfolio_urls: [] },
    created_at: '2025-11-01', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 4.9, review_count: 56,
    cover_image_url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800', photo_urls: [],
    tags: ['desert', 'landscape', 'drone'], family_friendly: true, is_vip: true,
  },
  {
    id: 'photo-3', provider_id: 'biz-55', title: 'Salima — Wedding & Events Photographer', description: 'Specializing in Algerian weddings and cultural events. Bilingual Arabic-French.',
    category: 'photographer', price_dzd: 15000, wilaya: 'Algiers', region: 'Algiers',
    coordinates: { latitude: 36.7538, longitude: 3.0588 },
    metadata: { kind: 'photographer', style: ['wedding', 'event', 'portrait'], packages: [{ name: 'Event Coverage', price_dzd: 15000, description: '4 hours, 150 edited photos', deliverables: '150 edited digital photos' }, { name: 'Premium Wedding', price_dzd: 35000, description: 'Full day, 300+ photos, album', deliverables: '300+ edited photos + leather album' }], turnaround_days: 7, drone_available: false, portfolio_urls: [] },
    created_at: '2025-08-01', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 4.9, review_count: 234,
    cover_image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', photo_urls: [],
    tags: ['wedding', 'events', 'premium'], family_friendly: true, is_vip: true,
  },
  {
    id: 'photo-4', provider_id: 'biz-56', title: 'Khaled — Food & Product Photographer', description: 'Commercial photographer for restaurants, cafes, and local businesses. Clean, modern aesthetic.',
    category: 'photographer', price_dzd: 7000, wilaya: 'Constantine', region: 'Constantine',
    coordinates: { latitude: 36.365, longitude: 6.615 },
    metadata: { kind: 'photographer', style: ['food', 'product', 'commercial'], packages: [{ name: 'Product Pack', price_dzd: 7000, description: '10 products, white background', deliverables: '10 high-res product photos' }, { name: 'Restaurant Menu', price_dzd: 12000, description: '20 dishes, styled shots', deliverables: '20 styled food photos + menu layout' }], turnaround_days: 4, drone_available: false, portfolio_urls: [] },
    created_at: '2026-04-01', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.6, review_count: 67,
    cover_image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', photo_urls: [],
    tags: ['food', 'commercial', 'product'], family_friendly: true, is_vip: false,
  },
  {
    id: 'photo-5', provider_id: 'biz-57', title: 'Yasmine — Portrait & Fashion Photographer', description: 'Fashion and portrait photographer with a editorial eye. Studio and outdoor shoots.',
    category: 'photographer', price_dzd: 6000, wilaya: 'Oran', region: 'Oran',
    coordinates: { latitude: 35.697, longitude: -0.633 },
    metadata: { kind: 'photographer', style: ['portrait', 'fashion', 'editorial'], packages: [{ name: 'Portrait Session', price_dzd: 6000, description: '1 hour, 30 edited photos', deliverables: '30 edited digital photos' }, { name: 'Fashion Editorial', price_dzd: 15000, description: 'Half day, 50 photos, retouching', deliverables: '50 fully retouched photos' }], turnaround_days: 5, drone_available: false, portfolio_urls: [] },
    created_at: '2026-01-20', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.7, review_count: 123,
    cover_image_url: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800', photo_urls: [],
    tags: ['fashion', 'portrait', 'editorial'], family_friendly: true, is_vip: false,
  },
  {
    id: 'photo-6', provider_id: 'biz-58', title: 'Djamel — Aerial & Real Estate Photographer', description: 'Drone specialist for real estate, events, and aerial landscapes. FAA certified.',
    category: 'photographer', price_dzd: 10000, wilaya: 'Algiers', region: 'Algiers',
    coordinates: { latitude: 36.7538, longitude: 3.0588 },
    metadata: { kind: 'photographer', style: ['aerial', 'real_estate', 'landscape'], packages: [{ name: 'Aerial Shoot', price_dzd: 10000, description: '1 hour drone, 30 aerial photos', deliverables: '30 high-res aerial photos' }, { name: 'Real Estate Package', price_dzd: 25000, description: 'Full property, 50 photos + drone', deliverables: '50 photos + 10 aerial + virtual tour' }], turnaround_days: 3, drone_available: true, portfolio_urls: [] },
    created_at: '2026-03-01', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.5, review_count: 89,
    cover_image_url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800', photo_urls: [],
    tags: ['aerial', 'drone', 'real_estate'], family_friendly: true, is_vip: false,
  },
  {
    id: 'photo-7', provider_id: 'biz-59', title: 'Ines — Family & Lifestyle Photographer', description: 'Warm, candid family photography. Beach sessions, home shoots, and lifestyle portraits.',
    category: 'photographer', price_dzd: 4000, wilaya: 'Annaba', region: 'Annaba',
    coordinates: { latitude: 36.9, longitude: 7.77 },
    metadata: { kind: 'photographer', style: ['family', 'lifestyle', 'candid'], packages: [{ name: 'Family Shoot', price_dzd: 4000, description: '45 min, 25 edited photos', deliverables: '25 edited digital photos' }, { name: 'Lifestyle Package', price_dzd: 8000, description: '2 hours, 60 photos + album', deliverables: '60 edited photos + mini album' }], turnaround_days: 5, drone_available: false, portfolio_urls: [] },
    created_at: '2026-05-01', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.8, review_count: 145,
    cover_image_url: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800', photo_urls: [],
    tags: ['family', 'lifestyle', 'candid'], family_friendly: true, is_vip: false,
  },

  // ═══════════════════════════════════════════
  //  DRIVERS (7 listings)
  // ═══════════════════════════════════════════
  {
    id: 'driver-1', provider_id: 'biz-11', title: 'Youcef — Airport Transfers', description: 'Reliable airport transfer service. Comfortable sedans and SUVs. Flight tracking included.',
    category: 'driver', price_dzd: 3000, wilaya: 'Algiers', region: 'Algiers',
    coordinates: { latitude: 36.7538, longitude: 3.0588 },
    metadata: { kind: 'driver', vehicle_type: 'sedan', vehicle_name: 'Toyota Camry 2024', price_per_km_dzd: 50, fixed_routes: [{ from: 'Houari Boumediene Airport', to: 'Algiers City Center', price_dzd: 3000 }, { from: 'Algiers', to: 'Tipaza', price_dzd: 5000 }], airport_transfer: true, multi_day_hire: true },
    created_at: '2026-03-15', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.7, review_count: 203,
    cover_image_url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800', photo_urls: [],
    tags: ['airport', 'transfer', 'reliable'], family_friendly: true, is_vip: false,
  },
  {
    id: 'driver-2', provider_id: 'biz-60', title: 'Bilal — Inter-City Luxury', description: 'Premium long-distance travel between Algerian cities. Mercedes E-Class with WiFi.',
    category: 'driver', price_dzd: 800, wilaya: 'Algiers', region: 'Algiers',
    coordinates: { latitude: 36.7538, longitude: 3.0588 },
    metadata: { kind: 'driver', vehicle_type: 'luxury', vehicle_name: 'Mercedes E-Class 2024', price_per_km_dzd: 80, fixed_routes: [{ from: 'Algiers', to: 'Oran', price_dzd: 12000 }, { from: 'Algiers', to: 'Constantine', price_dzd: 10000 }, { from: 'Algiers', to: 'Bejaia', price_dzd: 8000 }], airport_transfer: true, multi_day_hire: true },
    created_at: '2026-01-10', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 4.9, review_count: 156,
    cover_image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0abb?w=800', photo_urls: [],
    tags: ['luxury', 'intercity', 'wifi'], family_friendly: true, is_vip: true,
  },
  {
    id: 'driver-3', provider_id: 'biz-61', title: 'Samir — Oran City Shuttle', description: 'Affordable city shuttle service in Oran. Airport, hotels, and tourist spots.',
    category: 'driver', price_dzd: 2000, wilaya: 'Oran', region: 'Oran',
    coordinates: { latitude: 35.697, longitude: -0.633 },
    metadata: { kind: 'driver', vehicle_type: 'van', vehicle_name: 'Renault Trafic 2023', price_per_km_dzd: 35, fixed_routes: [{ from: 'Oran Airport', to: 'Oran City Center', price_dzd: 2000 }, { from: 'Oran', to: 'Arzew', price_dzd: 2500 }], airport_transfer: true, multi_day_hire: false },
    created_at: '2026-04-01', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.5, review_count: 89,
    cover_image_url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800', photo_urls: [],
    tags: ['shuttle', 'affordable', 'city'], family_friendly: true, is_vip: false,
  },
  {
    id: 'driver-4', provider_id: 'biz-62', title: 'Hassan — Sahara Expedition Driver', description: 'Experienced desert driver with 4x4 Land Cruiser. Specializes in Sahara road trips.',
    category: 'driver', price_dzd: 15000, wilaya: 'Tamanrasset', region: 'Tamanrasset',
    coordinates: { latitude: 22.785, longitude: 5.523 },
    metadata: { kind: 'driver', vehicle_type: 'suv', vehicle_name: 'Toyota Land Cruiser 2024', price_per_km_dzd: 120, fixed_routes: [{ from: 'Tamanrasset', to: 'Djanet', price_dzd: 25000 }, { from: 'Tamanrasset', to: 'In Salah', price_dzd: 15000 }], airport_transfer: false, multi_day_hire: true },
    created_at: '2026-02-01', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 4.8, review_count: 67,
    cover_image_url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800', photo_urls: [],
    tags: ['desert', '4x4', 'expedition'], family_friendly: false, is_vip: true,
  },
  {
    id: 'driver-5', provider_id: 'biz-63', title: 'Mohamed — Constantine Tour Driver', description: 'Local driver-guide in Constantine. Knows every bridge and hidden gem.',
    category: 'driver', price_dzd: 2500, wilaya: 'Constantine', region: 'Constantine',
    coordinates: { latitude: 36.365, longitude: 6.615 },
    metadata: { kind: 'driver', vehicle_type: 'sedan', vehicle_name: 'Hyundai Sonata 2024', price_per_km_dzd: 40, fixed_routes: [{ from: 'Constantine Airport', to: 'Constantine City', price_dzd: 2500 }, { from: 'Constantine', to: 'Djelfa', price_dzd: 8000 }], airport_transfer: true, multi_day_hire: true },
    created_at: '2026-03-20', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.6, review_count: 134,
    cover_image_url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800', photo_urls: [],
    tags: ['tour', 'local', 'knowledgeable'], family_friendly: true, is_vip: false,
  },
  {
    id: 'driver-6', provider_id: 'biz-64', title: 'Abdel — Bejaia Coastal Driver', description: 'Scenic coastal drives between Bejaia and surrounding towns. Comfortable and punctual.',
    category: 'driver', price_dzd: 3000, wilaya: 'Bejaia', region: 'Bejaia',
    coordinates: { latitude: 36.75, longitude: 5.08 },
    metadata: { kind: 'driver', vehicle_type: 'suv', vehicle_name: 'Peugeot 3008 2024', price_per_km_dzd: 45, fixed_routes: [{ from: 'Bejaia Airport', to: 'Bejaia Center', price_dzd: 3000 }, { from: 'Bejaia', to: 'Jijel', price_dzd: 4500 }], airport_transfer: true, multi_day_hire: true },
    created_at: '2026-05-01', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.4, review_count: 78,
    cover_image_url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800', photo_urls: [],
    tags: ['coastal', 'scenic', 'punctual'], family_friendly: true, is_vip: false,
  },
  {
    id: 'driver-7', provider_id: 'biz-65', title: 'Karim — Tipaza Wine Country Tour', description: 'Private driver for Tipaza winery tours and coastal sightseeing. SUV with cooler.',
    category: 'driver', price_dzd: 4000, wilaya: 'Tipaza', region: 'Tipaza',
    coordinates: { latitude: 36.59, longitude: 2.45 },
    metadata: { kind: 'driver', vehicle_type: 'suv', vehicle_name: 'Nissan X-Trail 2024', price_per_km_dzd: 55, fixed_routes: [{ from: 'Algiers', to: 'Tipaza', price_dzd: 5000 }, { from: 'Tipaza', to: 'Chrea', price_dzd: 4000 }], airport_transfer: true, multi_day_hire: true },
    created_at: '2026-04-15', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.7, review_count: 56,
    cover_image_url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800', photo_urls: [],
    tags: ['wine', 'coastal', 'private'], family_friendly: true, is_vip: false,
  },

  // ═══════════════════════════════════════════
  //  EXPERIENCES (7 listings)
  // ═══════════════════════════════════════════
  {
    id: 'exp-1', provider_id: 'biz-12', title: '3-Day Sahara Expedition', description: 'An unforgettable 3-day journey from Tamanrasset to the heart of the Hoggar Mountains. Includes camel trek, desert camp, and stargazing.',
    category: 'experience', price_dzd: 35000, wilaya: 'Tamanrasset', region: 'Tamanrasset',
    coordinates: { latitude: 22.7851, longitude: 5.5228 },
    metadata: { kind: 'experience', duration_days: 3, inclusions: ['transport', 'meals', 'desert camp', 'camel trek', 'guide', 'stargazing'], exclusions: ['flights', 'travel insurance', 'personal expenses'], max_group_size: 8, difficulty: 'moderate', departure_dates: ['2026-07-01', '2026-07-15', '2026-08-01'], price_per_person_dzd: 35000 },
    created_at: '2026-01-01', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 5.0, review_count: 67,
    cover_image_url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800', photo_urls: [],
    tags: ['sahara', 'desert', 'multi-day'], family_friendly: false, is_vip: true,
  },
  {
    id: 'exp-2', provider_id: 'biz-66', title: 'Djanet Tassili Rock Art Trek', description: '5-day guided trek through the Tassili n\'Ajjer UNESCO site. See prehistoric rock paintings and sandstone forests.',
    category: 'experience', price_dzd: 55000, wilaya: 'Djanet', region: 'Djanet',
    coordinates: { latitude: 24.555, longitude: 9.484 },
    metadata: { kind: 'experience', duration_days: 5, inclusions: ['transport', 'meals', 'camping', 'guide', 'camel trek', 'rock art tours'], exclusions: ['flights', 'travel insurance'], max_group_size: 6, difficulty: 'challenging', departure_dates: ['2026-07-10', '2026-08-10', '2026-09-01'], price_per_person_dzd: 55000 },
    created_at: '2026-02-01', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 4.9, review_count: 34,
    cover_image_url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800', photo_urls: [],
    tags: ['tassili', 'rock_art', 'unesco'], family_friendly: false, is_vip: true,
  },
  {
    id: 'exp-3', provider_id: 'biz-67', title: 'Algiers Historical Walking Tour', description: 'Full-day walking tour of Algiers. Casbah, Great Mosque, Jardin d\'Essai, and local lunch.',
    category: 'experience', price_dzd: 8000, wilaya: 'Algiers', region: 'Algiers',
    coordinates: { latitude: 36.7538, longitude: 3.0588 },
    metadata: { kind: 'experience', duration_days: 1, inclusions: ['guide', 'lunch', 'transport within city', 'museum entries'], exclusions: ['flights', 'accommodation'], max_group_size: 10, difficulty: 'easy', departure_dates: ['2026-07-01', '2026-07-08', '2026-07-15', '2026-07-22', '2026-08-01'], price_per_person_dzd: 8000 },
    created_at: '2026-03-01', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.7, review_count: 189,
    cover_image_url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800', photo_urls: [],
    tags: ['walking', 'historical', 'casbah'], family_friendly: true, is_vip: false,
  },
  {
    id: 'exp-4', provider_id: 'biz-68', title: 'Djurdjura Mountain Adventure', description: '4-day trekking adventure through Djurdjura National Park. Cedar forests, waterfalls, and Berber villages.',
    category: 'experience', price_dzd: 22000, wilaya: 'Tizi Ouzou', region: 'Tizi Ouzou',
    coordinates: { latitude: 36.43, longitude: 3.98 },
    metadata: { kind: 'experience', duration_days: 4, inclusions: ['guide', 'meals', 'camping', 'transport'], exclusions: ['personal gear', 'travel insurance'], max_group_size: 10, difficulty: 'moderate', departure_dates: ['2026-07-05', '2026-07-19', '2026-08-02'], price_per_person_dzd: 22000 },
    created_at: '2026-01-15', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.8, review_count: 112,
    cover_image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800', photo_urls: [],
    tags: ['trekking', 'djurdjura', 'mountain'], family_friendly: false, is_vip: false,
  },
  {
    id: 'exp-5', provider_id: 'biz-69', title: 'Ghardaia M\'zab Valley Cultural Tour', description: '3-day immersion in the UNESCO-listed M\'zab Valley. Visit Ghardaia, Melika, Beni Isguen, and Garaara.',
    category: 'experience', price_dzd: 18000, wilaya: 'Ghardaia', region: 'Ghardaia',
    coordinates: { latitude: 32.491, longitude: 3.674 },
    metadata: { kind: 'experience', duration_days: 3, inclusions: ['guide', 'meals', 'accommodation', 'transport', 'local crafts workshop'], exclusions: ['flights', 'personal expenses'], max_group_size: 8, difficulty: 'easy', departure_dates: ['2026-07-10', '2026-08-01', '2026-08-15'], price_per_person_dzd: 18000 },
    created_at: '2026-04-01', updated_at: '2026-06-01', is_active: true, is_featured: true, rating: 4.7, review_count: 78,
    cover_image_url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800', photo_urls: [],
    tags: ['mzab', 'unesco', 'cultural'], family_friendly: true, is_vip: false,
  },
  {
    id: 'exp-6', provider_id: 'biz-70', title: 'Tlemcen Heritage & Crafts Week', description: '5-day deep dive into Tlemcen\'s artisan traditions. weaving, pottery, calligraphy, and heritage sites.',
    category: 'experience', price_dzd: 25000, wilaya: 'Tlemcen', region: 'Tlemcen',
    coordinates: { latitude: 34.88, longitude: -1.32 },
    metadata: { kind: 'experience', duration_days: 5, inclusions: ['guide', 'meals', 'accommodation', 'craft workshops', 'transport'], exclusions: ['flights', 'personal expenses'], max_group_size: 12, difficulty: 'easy', departure_dates: ['2026-07-01', '2026-08-01', '2026-09-01'], price_per_person_dzd: 25000 },
    created_at: '2026-02-15', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.6, review_count: 45,
    cover_image_url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800', photo_urls: [],
    tags: ['tlemcen', 'crafts', 'artisan'], family_friendly: true, is_vip: false,
  },
  {
    id: 'exp-7', provider_id: 'biz-71', title: 'Bejaia & Kabylie Coastal Road Trip', description: '3-day road trip from Bejaia through Kabylie. Coastal views, mountain passes, and Berber villages.',
    category: 'experience', price_dzd: 15000, wilaya: 'Bejaia', region: 'Bejaia',
    coordinates: { latitude: 36.75, longitude: 5.08 },
    metadata: { kind: 'experience', duration_days: 3, inclusions: ['transport', 'guide', 'meals', 'accommodation'], exclusions: ['flights', 'personal expenses'], max_group_size: 6, difficulty: 'easy', departure_dates: ['2026-07-05', '2026-07-19', '2026-08-02', '2026-08-16'], price_per_person_dzd: 15000 },
    created_at: '2026-05-01', updated_at: '2026-06-01', is_active: true, is_featured: false, rating: 4.5, review_count: 56,
    cover_image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800', photo_urls: [],
    tags: ['road_trip', 'kabylie', 'coastal'], family_friendly: true, is_vip: false,
  },
];

// ═══════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════

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
