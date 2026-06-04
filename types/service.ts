/**
 * SAHEL Polymorphic Service & Listing Type System
 * -----------------------------------------------
 * Defines the universal architecture for all marketplace verticals:
 *   'beach_spot' | 'hotel_stay' | 'food_delivery' | 'partner_activity'
 *
 * Every listing in the marketplace is one of these four variants.
 * The `metadata` field carries type-specific configuration so that
 * business dashboards can map revenue, queues, and assets dynamically
 * without type collisions.
 */

// ─────────────────────────────────────────────
// 1. SERVICE TYPE LITERAL UNION
// ─────────────────────────────────────────────

/**
 * The four marketplace verticals supported by SAHEL.
 * Each maps to a distinct interaction pattern and metadata shape.
 */
export type ServiceVariant =
  | 'beach_spot'
  | 'hotel_stay'
  | 'food_delivery'
  | 'partner_activity';

// ─────────────────────────────────────────────
// 2. METADATA SHAPES (per variant)
// ─────────────────────────────────────────────

/**
 * Metadata for beach spot listings.
 * Controls the interactive matrix grid UI.
 */
export type BeachSpotMetadata = {
  kind: 'beach_spot';
  /** Grid layout identifier (e.g., "4x6_family", "3x5_vip") */
  grid_layout: string;
  /** Total rows in the interactive spot matrix */
  total_rows: number;
  /** Total columns in the interactive spot matrix */
  total_cols: number;
  /** Zone classification for the spot area */
  zone: 'family' | 'vip' | 'free';
  /** Per-spot price tier in DZD (0 = free zone) */
  price_per_spot_dzd: number;
  /** Whether the 20-minute hold countdown is active for this listing */
  hold_enabled: boolean;
  /** Maximum hold duration in minutes before auto-cancel */
  hold_duration_minutes: number;
};

/**
 * Metadata for hotel stay listings.
 * Controls date-range calendar pickers and room inventory.
 */
export type HotelStayMetadata = {
  kind: 'hotel_stay';
  /** Total number of bookable rooms */
  room_count: number;
  /** Standard check-in time (24h format, e.g., "14:00") */
  check_in_time: string;
  /** Standard check-out time (24h format, e.g., "11:00") */
  check_out_time: string;
  /** Room types available (e.g., ["single", "double", "suite"]) */
  room_types: string[];
  /** Whether breakfast is included in the stay price */
  breakfast_included: boolean;
  /** Hotel star rating (1–5) */
  star_rating: number;
  /** Amenities offered (e.g., ["wifi", "pool", "parking"]) */
  amenities: string[];
};

/**
 * Metadata for food delivery listings.
 * Controls menu item incrementor trays and cart system.
 */
export type FoodDeliveryMetadata = {
  kind: 'food_delivery';
  /** Menu category keys (e.g., ["drinks", "food", "snacks"]) */
  menu_categories: string[];
  /** Whether delivery to beach spots is supported */
  delivery_to_spot: boolean;
  /** Estimated preparation time in minutes */
  prep_time_minutes: number;
  /** Minimum order amount in DZD (0 = no minimum) */
  min_order_dzd: number;
  /** Whether the listing is currently accepting orders */
  accepting_orders: boolean;
};

/**
 * Metadata for partner activity listings.
 * Controls single-action reservation queue selector.
 */
export type PartnerActivityMetadata = {
  kind: 'partner_activity';
  /** Activity category (e.g., "massage", "jetski", "guide") */
  activity_category: string;
  /** Duration of a single session in minutes */
  session_duration_minutes: number;
  /** Maximum concurrent participants per session */
  max_participants: number;
  /** Whether walk-in bookings are accepted */
  walkin_allowed: boolean;
  /** Whether the partner is currently online and accepting requests */
  partner_online: boolean;
  /** Pricing model: fixed, per_person, or per_hour */
  pricing_model: 'fixed' | 'per_person' | 'per_hour';
};

/**
 * Discriminated union of all metadata shapes.
 * Use `metadata.kind` to narrow to the specific variant.
 */
export type ListingMetadata =
  | BeachSpotMetadata
  | HotelStayMetadata
  | FoodDeliveryMetadata
  | PartnerActivityMetadata;

// ─────────────────────────────────────────────
// 3. UNIFIED LISTING INTERFACE
// ─────────────────────────────────────────────

/**
 * A polymorphic listing in the SAHEL marketplace.
 *
 * Every listing belongs to exactly one provider (Business Owner or
 * Service Partner) and serves one of the four marketplace verticals.
 *
 * The `metadata` field is a discriminated union — narrow it by
 * checking `metadata.kind` at runtime to access variant-specific
 * properties without type collisions.
 */
export type Listing = {
  /** Unique listing identifier */
  id: string;
  /** The provider (Business Owner or Service Partner) who owns this listing */
  provider_id: string;
  /** Display title shown to travelers */
  title: string;
  /** Longer description with details */
  description: string;
  /** Marketplace vertical — determines which metadata shape and UI to render */
  type: ServiceVariant;
  /** Base price in DZD (interpretation depends on variant: per spot, per night, per meal, per session) */
  price_dzd: number;
  /** Wilaya (province) where the listing is located */
  wilaya: string;
  /** GPS coordinates for map placement and geo-fencing */
  coordinates: {
    latitude: number;
    longitude: number;
  };
  /** Type-specific configuration — discriminated by `kind` */
  metadata: ListingMetadata;
  /** ISO 8601 creation timestamp */
  created_at: string;
  /** ISO 8601 last-update timestamp */
  updated_at: string;
  /** Whether this listing is currently visible and bookable */
  is_active: boolean;
  /** Average rating (0–5) */
  rating: number;
  /** Total number of reviews */
  review_count: number;
  /** Cover image URL (optional) */
  cover_image_url?: string;
  /** Additional photo URLs */
  photo_urls: string[];
};

// ─────────────────────────────────────────────
// 4. LISTING TYPE GUARDS
// ─────────────────────────────────────────────

/** Type guard: narrows a Listing to beach_spot variant */
export function isBeachSpotListing(listing: Listing): listing is Listing & { metadata: BeachSpotMetadata } {
  return listing.metadata.kind === 'beach_spot';
}

/** Type guard: narrows a Listing to hotel_stay variant */
export function isHotelStayListing(listing: Listing): listing is Listing & { metadata: HotelStayMetadata } {
  return listing.metadata.kind === 'hotel_stay';
}

/** Type guard: narrows a Listing to food_delivery variant */
export function isFoodDeliveryListing(listing: Listing): listing is Listing & { metadata: FoodDeliveryMetadata } {
  return listing.metadata.kind === 'food_delivery';
}

/** Type guard: narrows a Listing to partner_activity variant */
export function isPartnerActivityListing(listing: Listing): listing is Listing & { metadata: PartnerActivityMetadata } {
  return listing.metadata.kind === 'partner_activity';
}

// ─────────────────────────────────────────────
// 5. PARTNER SERVICE TYPES (legacy compat)
// ─────────────────────────────────────────────
// These remain for the existing Partner Dashboard flow.
// They will be gradually migrated to use Listing + PartnerActivityMetadata.

export type ServiceType =
  | 'massage'
  | 'jetski'
  | 'pedalo'
  | 'games'
  | 'parking'
  | 'photos'
  | 'powerbank'
  | 'showers';

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
// 6. LISTING CREATION PARAMS
// ─────────────────────────────────────────────

/** Parameters for creating a new listing (id, timestamps, and defaults are auto-generated) */
export type CreateListingParams = Omit<Listing, 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count' | 'photo_urls'> & {
  photo_urls?: string[];
};

/** Parameters for updating an existing listing (all fields optional except id) */
export type UpdateListingParams = Partial<Omit<Listing, 'id' | 'created_at'>> & {
  id: string;
};
