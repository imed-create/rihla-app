/**
 * RIHLA Polymorphic Listing Dispatcher Architecture
 * -------------------------------------------------
 * Maps each MarketplaceCategory to its specific interaction UI module.
 * Used by app/listing/[id].tsx to conditionally render the correct interface.
 */

import type {
  MarketplaceCategory,
  Listing,
  HotelMetadata,
  RestaurantMetadata,
  BeachMetadata,
  RentalMetadata,
  ActivityMetadata,
  EventMetadata,
  GuideMetadata,
  PhotographerMetadata,
  DriverMetadata,
  ExperienceMetadata,
} from './service';

// ─────────────────────────────────────────────
// 1. INTERACTION MODE PER VARIANT
// ─────────────────────────────────────────────

export type InteractionMode =
  | 'date_range_picker'      // Hotels, Rentals: check-in / check-out calendar
  | 'menu_browse'            // Restaurants: menu + table reservation
  | 'matrix_grid'            // Beaches: interactive tap-to-select grid
  | 'time_slot_queue'        // Activities, Guides: time-slot queue + participants
  | 'ticket_quantity'        // Events: ticket type + quantity
  | 'portfolio_package'      // Photographers: portfolio + package selector
  | 'route_picker'           // Drivers: route selection + vehicle info
  | 'itinerary_builder';     // Experiences: multi-day itinerary + group size

// ─────────────────────────────────────────────
// 2. LISTING UI CONFIG (per variant)
// ─────────────────────────────────────────────

type BaseListingUIConfig = {
  interaction_mode: InteractionMode;
  show_hold_timer: boolean;
  show_map_preview: boolean;
  show_reviews: boolean;
  primary_action_label: string;
  requires_auth: boolean;
};

export type HotelUIConfig = BaseListingUIConfig & {
  interaction_mode: 'date_range_picker';
  calendar_config: {
    min_nights: number;
    max_nights: number;
    show_room_selector: boolean;
    show_guest_count: boolean;
    show_price_breakdown: boolean;
  };
};

export type RestaurantUIConfig = BaseListingUIConfig & {
  interaction_mode: 'menu_browse';
  menu_config: {
    show_category_tabs: boolean;
    show_menu_photos: boolean;
    show_table_reservation: boolean;
    show_delivery_option: boolean;
  };
};

export type BeachUIConfig = BaseListingUIConfig & {
  interaction_mode: 'matrix_grid';
  grid_config: {
    show_zone_tabs: boolean;
    show_countdown_banner: boolean;
    highlight_occupied: boolean;
    show_legend: boolean;
  };
};

export type RentalUIConfig = BaseListingUIConfig & {
  interaction_mode: 'date_range_picker';
  calendar_config: {
    min_nights: number;
    max_nights: number;
    show_amenities: boolean;
    show_house_rules: boolean;
  };
};

export type ActivityUIConfig = BaseListingUIConfig & {
  interaction_mode: 'time_slot_queue';
  queue_config: {
    show_time_slots: boolean;
    show_participant_selector: boolean;
    show_duration_info: boolean;
    show_difficulty_badge: boolean;
  };
};

export type EventUIConfig = BaseListingUIConfig & {
  interaction_mode: 'ticket_quantity';
  ticket_config: {
    show_ticket_types: boolean;
    show_event_timeline: boolean;
    show_venue_map: boolean;
    show_age_restriction: boolean;
  };
};

export type GuideUIConfig = BaseListingUIConfig & {
  interaction_mode: 'time_slot_queue';
  guide_config: {
    show_languages: boolean;
    show_certifications: boolean;
    show_bio: boolean;
    show_schedule: boolean;
  };
};

export type PhotographerUIConfig = BaseListingUIConfig & {
  interaction_mode: 'portfolio_package';
  portfolio_config: {
    show_portfolio_gallery: boolean;
    show_packages: boolean;
    show_turnaround_time: boolean;
    show_drone_option: boolean;
  };
};

export type DriverUIConfig = BaseListingUIConfig & {
  interaction_mode: 'route_picker';
  route_config: {
    show_fixed_routes: boolean;
    show_vehicle_info: boolean;
    show_airport_transfer: boolean;
    show_price_per_km: boolean;
  };
};

export type ExperienceUIConfig = BaseListingUIConfig & {
  interaction_mode: 'itinerary_builder';
  experience_config: {
    show_day_by_day: boolean;
    show_inclusions: boolean;
    show_departure_dates: boolean;
    show_group_size: boolean;
  };
};

export type ListingUIConfig =
  | HotelUIConfig
  | RestaurantUIConfig
  | BeachUIConfig
  | RentalUIConfig
  | ActivityUIConfig
  | EventUIConfig
  | GuideUIConfig
  | PhotographerUIConfig
  | DriverUIConfig
  | ExperienceUIConfig;

// ─────────────────────────────────────────────
// 3. DISPATCH MAP
// ─────────────────────────────────────────────

export const LISTING_UI_CONFIGS: Record<MarketplaceCategory, ListingUIConfig> = {
  hotel: {
    interaction_mode: 'date_range_picker', show_hold_timer: false, show_map_preview: true, show_reviews: true,
    primary_action_label: 'Reserve Stay', requires_auth: true,
    calendar_config: { min_nights: 1, max_nights: 30, show_room_selector: true, show_guest_count: true, show_price_breakdown: true },
  },
  restaurant: {
    interaction_mode: 'menu_browse', show_hold_timer: false, show_map_preview: true, show_reviews: true,
    primary_action_label: 'Reserve Table', requires_auth: true,
    menu_config: { show_category_tabs: true, show_menu_photos: true, show_table_reservation: true, show_delivery_option: true },
  },
  beach: {
    interaction_mode: 'matrix_grid', show_hold_timer: true, show_map_preview: true, show_reviews: true,
    primary_action_label: 'Book Spot', requires_auth: true,
    grid_config: { show_zone_tabs: true, show_countdown_banner: true, highlight_occupied: true, show_legend: true },
  },
  rental: {
    interaction_mode: 'date_range_picker', show_hold_timer: false, show_map_preview: true, show_reviews: true,
    primary_action_label: 'Reserve House', requires_auth: true,
    calendar_config: { min_nights: 1, max_nights: 90, show_amenities: true, show_house_rules: true },
  },
  activity: {
    interaction_mode: 'time_slot_queue', show_hold_timer: false, show_map_preview: true, show_reviews: true,
    primary_action_label: 'Book Activity', requires_auth: true,
    queue_config: { show_time_slots: true, show_participant_selector: true, show_duration_info: true, show_difficulty_badge: true },
  },
  event: {
    interaction_mode: 'ticket_quantity', show_hold_timer: false, show_map_preview: true, show_reviews: true,
    primary_action_label: 'Get Tickets', requires_auth: true,
    ticket_config: { show_ticket_types: true, show_event_timeline: true, show_venue_map: true, show_age_restriction: true },
  },
  guide: {
    interaction_mode: 'time_slot_queue', show_hold_timer: false, show_map_preview: true, show_reviews: true,
    primary_action_label: 'Book Guide', requires_auth: true,
    guide_config: { show_languages: true, show_certifications: true, show_bio: true, show_schedule: true },
  },
  photographer: {
    interaction_mode: 'portfolio_package', show_hold_timer: false, show_map_preview: false, show_reviews: true,
    primary_action_label: 'Book Shoot', requires_auth: true,
    portfolio_config: { show_portfolio_gallery: true, show_packages: true, show_turnaround_time: true, show_drone_option: true },
  },
  driver: {
    interaction_mode: 'route_picker', show_hold_timer: false, show_map_preview: true, show_reviews: true,
    primary_action_label: 'Book Ride', requires_auth: true,
    route_config: { show_fixed_routes: true, show_vehicle_info: true, show_airport_transfer: true, show_price_per_km: true },
  },
  experience: {
    interaction_mode: 'itinerary_builder', show_hold_timer: false, show_map_preview: true, show_reviews: true,
    primary_action_label: 'Book Experience', requires_auth: true,
    experience_config: { show_day_by_day: true, show_inclusions: true, show_departure_dates: true, show_group_size: true },
  },
};

// ─────────────────────────────────────────────
// 4. HELPER FUNCTIONS
// ─────────────────────────────────────────────

export function getListingUIConfig(category: MarketplaceCategory): ListingUIConfig {
  return LISTING_UI_CONFIGS[category] ?? LISTING_UI_CONFIGS.activity;
}

export function getInteractionModeLabel(mode: InteractionMode): string {
  const labels: Record<InteractionMode, string> = {
    date_range_picker: 'Date Selection',
    menu_browse: 'Menu & Reservation',
    matrix_grid: 'Interactive Spot Grid',
    time_slot_queue: 'Time Slot Queue',
    ticket_quantity: 'Ticket Selection',
    portfolio_package: 'Portfolio & Packages',
    route_picker: 'Route Selection',
    itinerary_builder: 'Itinerary Builder',
  };
  return labels[mode] ?? mode;
}

export function getInteractionModeIcon(mode: InteractionMode): string {
  const icons: Record<InteractionMode, string> = {
    date_range_picker: 'calendar-outline',
    menu_browse: 'restaurant-outline',
    matrix_grid: 'grid-outline',
    time_slot_queue: 'time-outline',
    ticket_quantity: 'ticket-outline',
    portfolio_package: 'camera-outline',
    route_picker: 'car-outline',
    itinerary_builder: 'map-outline',
  };
  return icons[mode] ?? 'options-outline';
}

// ─────────────────────────────────────────────
// 5. CATEGORY METADATA HELPER
// ─────────────────────────────────────────────

/** Get the category icon (Ionicons name) for a marketplace category */
export function getCategoryIcon(category: MarketplaceCategory): string {
  const icons: Record<MarketplaceCategory, string> = {
    hotel: 'bed-outline',
    restaurant: 'restaurant-outline',
    beach: 'umbrella-outline',
    rental: 'home-outline',
    activity: 'bicycle-outline',
    event: 'musical-notes-outline',
    guide: 'compass-outline',
    photographer: 'camera-outline',
    driver: 'car-outline',
    experience: 'sparkles-outline',
  };
  return icons[category] ?? 'options-outline';
}

/** Get the display label for a marketplace category */
export function getCategoryLabel(category: MarketplaceCategory): string {
  const labels: Record<MarketplaceCategory, string> = {
    hotel: 'Hotels',
    restaurant: 'Restaurants',
    beach: 'Beaches',
    rental: 'Rentals',
    activity: 'Activities',
    event: 'Events',
    guide: 'Guides',
    photographer: 'Photographers',
    driver: 'Drivers',
    experience: 'Experiences',
  };
  return labels[category] ?? category;
}

/** Get all marketplace categories as an array with labels */
export function getAllCategories(): { key: MarketplaceCategory; label: string; icon: string }[] {
  return (Object.keys(LISTING_UI_CONFIGS) as MarketplaceCategory[]).map((key) => ({
    key,
    label: getCategoryLabel(key),
    icon: getCategoryIcon(key),
  }));
}
