/**
 * RIHLA Polymorphic Marketplace Type System
 * -------------------------------------------
 * Defines the universal architecture for ALL marketplace verticals:
 *   'hotel' | 'restaurant' | 'beach' | 'rental' | 'activity' |
 *   'event' | 'guide' | 'photographer' | 'driver' | 'experience'
 *
 * Every listing in the marketplace is one of these ten variants.
 * The `metadata` field carries type-specific configuration so that
 * business dashboards can map revenue, queues, and assets dynamically
 * without type collisions.
 */

// ─────────────────────────────────────────────
// 1. MARKETPLACE CATEGORY UNION
// ─────────────────────────────────────────────

/**
 * The ten marketplace verticals supported by RIHLA.
 * Each maps to a distinct interaction pattern and metadata shape.
 */
export type MarketplaceCategory =
  | 'hotel'
  | 'restaurant'
  | 'beach'
  | 'rental'
  | 'activity'
  | 'event'
  | 'guide'
  | 'photographer'
  | 'driver'
  | 'experience';

/** Legacy alias for backward compat */
export type ServiceVariant = MarketplaceCategory;

// ─────────────────────────────────────────────
// 2. METADATA SHAPES (per variant)
// ─────────────────────────────────────────────

/**
 * Metadata for hotel listings.
 * Controls date-range calendar pickers and room inventory.
 */
export type HotelMetadata = {
  kind: 'hotel';
  /** Total number of bookable rooms */
  room_count: number;
  /** Standard check-in time (24h, e.g. "14:00") */
  check_in_time: string;
  /** Standard check-out time (24h, e.g. "11:00") */
  check_out_time: string;
  /** Room types available (e.g. ["single", "double", "suite"]) */
  room_types: string[];
  /** Whether breakfast is included */
  breakfast_included: boolean;
  /** Hotel star rating (1–5) */
  star_rating: number;
  /** Amenities offered */
  amenities: string[];
  /** Price per night in DZD */
  price_per_night_dzd: number;
};

/**
 * Metadata for restaurant listings.
 * Controls menu browsing and table reservation.
 */
export type RestaurantMetadata = {
  kind: 'restaurant';
  /** Cuisine types (e.g. ["traditional", "seafood", "pizza"]) */
  cuisine_types: string[];
  /** Menu category keys */
  menu_categories: string[];
  /** Average meal price in DZD */
  avg_meal_price_dzd: number;
  /** Whether reservation is required */
  reservation_required: boolean;
  /** Opening hours (e.g. "08:00–22:00") */
  opening_hours: string;
  /** Whether delivery is available */
  delivery_available: boolean;
  /** Seating capacity */
  seating_capacity: number;
};

/**
 * Metadata for beach listings.
 * Controls interactive spot grid UI.
 */
export type BeachMetadata = {
  kind: 'beach';
  /** Grid layout identifier */
  grid_layout: string;
  /** Total rows in the interactive spot matrix */
  total_rows: number;
  /** Total columns */
  total_cols: number;
  /** Zone classification */
  zone: 'family' | 'vip' | 'free';
  /** Per-spot price tier in DZD */
  price_per_spot_dzd: number;
  /** Whether 20-min hold countdown is active */
  hold_enabled: boolean;
  /** Max hold duration in minutes */
  hold_duration_minutes: number;
  /** Available services at this beach */
  services: string[];
};

/**
 * Metadata for rental house listings.
 * Controls date-range calendar and amenity display.
 */
export type RentalMetadata = {
  kind: 'rental';
  /** Number of bedrooms */
  bedrooms: number;
  /** Number of bathrooms */
  bathrooms: number;
  /** Max guest capacity */
  max_guests: number;
  /** Price per night in DZD */
  price_per_night_dzd: number;
  /** Amenities list */
  amenities: string[];
  /** Whether monthly rental is available */
  monthly_available: boolean;
  /** Property type */
  property_type: 'apartment' | 'villa' | 'house' | 'riad' | 'studio';
};

/**
 * Metadata for activity listings.
 * Controls time-slot queue and participant picker.
 */
export type ActivityMetadata = {
  kind: 'activity';
  /** Activity type (e.g. "paragliding", "hiking", "diving") */
  activity_type: string;
  /** Duration of a single session in minutes */
  session_duration_minutes: number;
  /** Maximum concurrent participants */
  max_participants: number;
  /** Whether walk-in bookings are accepted */
  walkin_allowed: boolean;
  /** Pricing model */
  pricing_model: 'fixed' | 'per_person' | 'per_hour';
  /** Equipment included */
  equipment_included: boolean;
  /** Difficulty level */
  difficulty: 'easy' | 'moderate' | 'challenging' | 'extreme';
};

/**
 * Metadata for event listings.
 * Controls ticket quantity and date picker.
 */
export type EventMetadata = {
  kind: 'event';
  /** Event type */
  event_type: string;
  /** Event date (ISO 8601) */
  event_date: string;
  /** Event start time */
  start_time: string;
  /** Event end time */
  end_time: string;
  /** Venue name */
  venue: string;
  /** Ticket types available */
  ticket_types: { name: string; price_dzd: number; quantity: number }[];
  /** Total capacity */
  total_capacity: number;
  /** Age restriction */
  age_restriction?: string;
};

/**
 * Metadata for tour guide listings.
 * Controls schedule picker and review display.
 */
export type GuideMetadata = {
  kind: 'guide';
  /** Guide specialization */
  specialization: string;
  /** Languages spoken */
  languages: string[];
  /** Years of experience */
  experience_years: number;
  /** Available daily rates in DZD */
  daily_rate_dzd: number;
  /** Whether group tours are offered */
  group_tours: boolean;
  /** Max group size */
  max_group_size: number;
  /** Certifications */
  certifications: string[];
};

/**
 * Metadata for photographer listings.
 * Controls portfolio display and package selector.
 */
export type PhotographerMetadata = {
  kind: 'photographer';
  /** Photography style */
  style: string[];
  /** Package options */
  packages: { name: string; price_dzd: number; description: string; deliverables: string }[];
  /** Average turnaround time in days */
  turnaround_days: number;
  /** Whether drone photography is available */
  drone_available: boolean;
  /** Portfolio image URLs */
  portfolio_urls: string[];
};

/**
 * Metadata for driver listings.
 * Controls route picker and vehicle display.
 */
export type DriverMetadata = {
  kind: 'driver';
  /** Vehicle type */
  vehicle_type: 'sedan' | 'suv' | 'van' | 'bus' | 'luxury';
  /** Vehicle make and model */
  vehicle_name: string;
  /** Price per km in DZD */
  price_per_km_dzd: number;
  /** Fixed route prices */
  fixed_routes: { from: string; to: string; price_dzd: number }[];
  /** Whether airport transfer is available */
  airport_transfer: boolean;
  /** Whether the driver is available for multi-day hire */
  multi_day_hire: boolean;
};

/**
 * Metadata for experience listings.
 * Controls multi-day itinerary builder and group size.
 */
export type ExperienceMetadata = {
  kind: 'experience';
  /** Number of days */
  duration_days: number;
  /** What's included */
  inclusions: string[];
  /** What's excluded */
  exclusions: string[];
  /** Maximum group size */
  max_group_size: number;
  /** Difficulty level */
  difficulty: 'easy' | 'moderate' | 'challenging';
  /** Available departure dates */
  departure_dates: string[];
  /** Price per person in DZD */
  price_per_person_dzd: number;
};

/**
 * Discriminated union of all metadata shapes.
 * Use `metadata.kind` to narrow to the specific variant.
 */
export type ListingMetadata =
  | HotelMetadata
  | RestaurantMetadata
  | BeachMetadata
  | RentalMetadata
  | ActivityMetadata
  | EventMetadata
  | GuideMetadata
  | PhotographerMetadata
  | DriverMetadata
  | ExperienceMetadata;

// ─────────────────────────────────────────────
// 3. UNIFIED LISTING INTERFACE
// ─────────────────────────────────────────────

/**
 * A polymorphic listing in the RIHLA marketplace.
 *
 * Every listing belongs to exactly one provider (Business Owner or
 * Service Partner) and serves one of the ten marketplace verticals.
 *
 * The `metadata` field is a discriminated union — narrow it by
 * checking `metadata.kind` at runtime.
 */
export type Listing = {
  /** Unique listing identifier */
  id: string;
  /** The provider who owns this listing */
  provider_id: string;
  /** Display title shown to travelers */
  title: string;
  /** Longer description */
  description: string;
  /** Marketplace vertical */
  category: MarketplaceCategory;
  /** Base price in DZD */
  price_dzd: number;
  /** Wilaya (province) */
  wilaya: string;
  /** Region / city name */
  region: string;
  /** GPS coordinates */
  coordinates: { latitude: number; longitude: number };
  /** Type-specific configuration */
  metadata: ListingMetadata;
  /** ISO 8601 creation timestamp */
  created_at: string;
  /** ISO 8601 last-update timestamp */
  updated_at: string;
  /** Whether this listing is currently visible and bookable */
  is_active: boolean;
  /** Whether the listing is featured/promoted */
  is_featured: boolean;
  /** Average rating (0–5) */
  rating: number;
  /** Total number of reviews */
  review_count: number;
  /** Cover image URL */
  cover_image_url?: string;
  /** Additional photo URLs */
  photo_urls: string[];
  /** Tags for search and filtering */
  tags: string[];
  /** Whether family friendly */
  family_friendly: boolean;
  /** Whether VIP / premium */
  is_vip: boolean;
};

// ─────────────────────────────────────────────
// 4. LISTING TYPE GUARDS
// ─────────────────────────────────────────────

export function isHotelListing(listing: Listing): listing is Listing & { metadata: HotelMetadata } {
  return listing.metadata.kind === 'hotel';
}
export function isRestaurantListing(listing: Listing): listing is Listing & { metadata: RestaurantMetadata } {
  return listing.metadata.kind === 'restaurant';
}
export function isBeachListing(listing: Listing): listing is Listing & { metadata: BeachMetadata } {
  return listing.metadata.kind === 'beach';
}
export function isRentalListing(listing: Listing): listing is Listing & { metadata: RentalMetadata } {
  return listing.metadata.kind === 'rental';
}
export function isActivityListing(listing: Listing): listing is Listing & { metadata: ActivityMetadata } {
  return listing.metadata.kind === 'activity';
}
export function isEventListing(listing: Listing): listing is Listing & { metadata: EventMetadata } {
  return listing.metadata.kind === 'event';
}
export function isGuideListing(listing: Listing): listing is Listing & { metadata: GuideMetadata } {
  return listing.metadata.kind === 'guide';
}
export function isPhotographerListing(listing: Listing): listing is Listing & { metadata: PhotographerMetadata } {
  return listing.metadata.kind === 'photographer';
}
export function isDriverListing(listing: Listing): listing is Listing & { metadata: DriverMetadata } {
  return listing.metadata.kind === 'driver';
}
export function isExperienceListing(listing: Listing): listing is Listing & { metadata: ExperienceMetadata } {
  return listing.metadata.kind === 'experience';
}

// ─────────────────────────────────────────────
// 5. LEGACY COMPAT (gradual migration)
// ─────────────────────────────────────────────

export type ServiceType =
  | 'massage' | 'jetski' | 'pedalo' | 'games'
  | 'parking' | 'photos' | 'powerbank' | 'showers';

export type ServiceRequestStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type Service = {
  id: string;
  partnerId: string;
  type: ServiceType;
  name: string;
  priceDZD: number;
  isAvailable: boolean;
};

export type ServiceRequest = {
  id: string;
  userId: string;
  serviceId: string;
  serviceType: ServiceType;
  customerName: string;
  status: ServiceRequestStatus;
  date: string;
  totalDZD: number;
  createdAt: string;
};

// ─────────────────────────────────────────────
// 6. LISTING CREATION / UPDATE PARAMS
// ─────────────────────────────────────────────

export type CreateListingParams = Omit<Listing, 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count' | 'photo_urls'> & {
  photo_urls?: string[];
};

export type UpdateListingParams = Partial<Omit<Listing, 'id' | 'created_at'>> & {
  id: string;
};
