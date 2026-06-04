/**
 * SAHEL Polymorphic Listing Dispatcher Architecture
 * -------------------------------------------------
 * Defines the configuration layer that maps each ServiceVariant to
 * its specific interaction UI module. Used by app/listing/[id].tsx
 * to conditionally render the correct booking/ordering interface.
 *
 * Architecture:
 *   listing.type → ListingUIConfig → correct screen module
 */

import type {
  ServiceVariant,
  Listing,
  BeachSpotMetadata,
  HotelStayMetadata,
  FoodDeliveryMetadata,
  PartnerActivityMetadata,
} from './service';

// ─────────────────────────────────────────────
// 1. INTERACTION MODE PER VARIANT
// ─────────────────────────────────────────────

/**
 * Describes the primary interaction pattern for each marketplace vertical.
 * The detail screen reads this to decide which UI module to render.
 */
export type InteractionMode =
  | 'matrix_grid'       // Beach spots: interactive tap-to-select grid
  | 'date_range_picker' // Hotel stays: check-in / check-out calendar
  | 'menu_incrementor'  // Food delivery: menu items with +/- quantity controls
  | 'queue_selector';   // Partner activities: single-action reservation queue

// ─────────────────────────────────────────────
// 2. LISTING UI CONFIG (per variant)
// ─────────────────────────────────────────────

/**
 * Base config shared by all listing detail views.
 */
type BaseListingUIConfig = {
  /** Which tab / action bar style to show */
  interaction_mode: InteractionMode;
  /** Whether to show a countdown hold timer on the detail view */
  show_hold_timer: boolean;
  /** Whether to show a map preview of the listing location */
  show_map_preview: boolean;
  /** Primary action button label */
  primary_action_label: string;
  /** Whether the primary action requires authentication */
  requires_auth: boolean;
};

/**
 * Beach spot detail config.
 * Renders an interactive matrix grid where travelers tap to select spots.
 */
export type BeachSpotUIConfig = BaseListingUIConfig & {
  interaction_mode: 'matrix_grid';
  /** Hook configuration for the Interactive Matrix Grid UI */
  grid_config: {
    /** Whether to show the zone tabs (Family / VIP / Free) */
    show_zone_tabs: boolean;
    /** Whether to render the 20-minute hold countdown banner */
    show_countdown_banner: boolean;
    /** Whether taken/occupied spots are visually distinct */
    highlight_occupied: boolean;
    /** Whether to show the legend (Available / Selected / Taken) */
    show_legend: boolean;
    /** Whether tap-and-hold shows a spot info tooltip */
    show_spot_tooltip: boolean;
  };
};

/**
 * Hotel stay detail config.
 * Renders standard date-range calendar pickers.
 */
export type HotelStayUIConfig = BaseListingUIConfig & {
  interaction_mode: 'date_range_picker';
  /** Hook configuration for the calendar date picker */
  calendar_config: {
    /** Minimum number of nights bookable */
    min_nights: number;
    /** Maximum number of nights bookable */
    max_nights: number;
    /** Whether to show room type selector */
    show_room_selector: boolean;
    /** Whether to show guest count selector */
    show_guest_count: boolean;
    /** Whether to display per-night price breakdown */
    show_price_breakdown: boolean;
  };
};

/**
 * Food delivery detail config.
 * Renders menu item incrementor trays with +/- controls.
 */
export type FoodDeliveryUIConfig = BaseListingUIConfig & {
  interaction_mode: 'menu_incrementor';
  /** Hook configuration for the menu incrementor tray */
  menu_config: {
    /** Whether to show category tabs (Drinks / Food / Snacks) */
    show_category_tabs: boolean;
    /** Whether to show the floating cart bar at the bottom */
    show_floating_cart: boolean;
    /** Whether to show a delivery spot selector matrix */
    show_delivery_spot_selector: boolean;
    /** Whether to display item emojis alongside names */
    show_item_emojis: boolean;
    /** Whether quantity controls are inline or in a detail modal */
    inline_quantity_controls: boolean;
  };
};

/**
 * Partner activity detail config.
 * Renders a clean, single-action reservation queue selector.
 */
export type PartnerActivityUIConfig = BaseListingUIConfig & {
  interaction_mode: 'queue_selector';
  /** Hook configuration for the reservation queue selector */
  queue_config: {
    /** Whether to show available time slots */
    show_time_slots: boolean;
    /** Whether to show participant count selector (if max_participants > 1) */
    show_participant_selector: boolean;
    /** Whether to display the partner's online/offline status */
    show_partner_status: boolean;
    /** Whether to show session duration info */
    show_duration_info: boolean;
    /** Whether walk-in booking option is displayed */
    show_walkin_option: boolean;
  };
};

/**
 * Discriminated union of all listing UI configurations.
 * Narrow by `interaction_mode` to get the specific config.
 */
export type ListingUIConfig =
  | BeachSpotUIConfig
  | HotelStayUIConfig
  | FoodDeliveryUIConfig
  | PartnerActivityUIConfig;

// ─────────────────────────────────────────────
// 3. DISPATCH MAP
// ─────────────────────────────────────────────

/**
 * Maps each ServiceVariant to its default UI configuration.
 * Used by the detail screen dispatcher to select the correct module.
 */
export const LISTING_UI_CONFIGS: Record<ServiceVariant, ListingUIConfig> = {
  beach_spot: {
    interaction_mode: 'matrix_grid',
    show_hold_timer: true,
    show_map_preview: true,
    primary_action_label: 'Book Now',
    requires_auth: true,
    grid_config: {
      show_zone_tabs: true,
      show_countdown_banner: true,
      highlight_occupied: true,
      show_legend: true,
      show_spot_tooltip: true,
    },
  },
  hotel_stay: {
    interaction_mode: 'date_range_picker',
    show_hold_timer: false,
    show_map_preview: true,
    primary_action_label: 'Reserve Stay',
    requires_auth: true,
    calendar_config: {
      min_nights: 1,
      max_nights: 30,
      show_room_selector: true,
      show_guest_count: true,
      show_price_breakdown: true,
    },
  },
  food_delivery: {
    interaction_mode: 'menu_incrementor',
    show_hold_timer: false,
    show_map_preview: false,
    primary_action_label: 'Place Order',
    requires_auth: false,
    menu_config: {
      show_category_tabs: true,
      show_floating_cart: true,
      show_delivery_spot_selector: true,
      show_item_emojis: true,
      inline_quantity_controls: true,
    },
  },
  partner_activity: {
    interaction_mode: 'queue_selector',
    show_hold_timer: false,
    show_map_preview: true,
    primary_action_label: 'Reserve Spot',
    requires_auth: true,
    queue_config: {
      show_time_slots: true,
      show_participant_selector: true,
      show_partner_status: true,
      show_duration_info: true,
      show_walkin_option: true,
    },
  },
};

// ─────────────────────────────────────────────
// 4. DISPATCHER HELPER FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Get the UI config for a listing based on its variant type.
 * Falls back to 'partner_activity' config for unknown types.
 */
export function getListingUIConfig(type: ServiceVariant): ListingUIConfig {
  return LISTING_UI_CONFIGS[type] ?? LISTING_UI_CONFIGS.partner_activity;
}

/**
 * Get the interaction mode display label for a listing variant.
 */
export function getInteractionModeLabel(mode: InteractionMode): string {
  switch (mode) {
    case 'matrix_grid':
      return 'Interactive Spot Grid';
    case 'date_range_picker':
      return 'Date Range Selection';
    case 'menu_incrementor':
      return 'Menu & Cart';
    case 'queue_selector':
      return 'Reservation Queue';
  }
}

/**
 * Get the icon name for each interaction mode (Ionicons).
 */
export function getInteractionModeIcon(mode: InteractionMode): string {
  switch (mode) {
    case 'matrix_grid':
      return 'grid-outline';
    case 'date_range_picker':
      return 'calendar-outline';
    case 'menu_incrementor':
      return 'restaurant-outline';
    case 'queue_selector':
      return 'time-outline';
  }
}

// ─────────────────────────────────────────────
// 5. VARIANT-Specific UI PROPS INTERFACES
// ─────────────────────────────────────────────

/**
 * Props interface for the Beach Spot grid UI module.
 * Pass to the Interactive Matrix Grid component.
 */
export type BeachSpotDetailProps = {
  listing: Listing & { metadata: BeachSpotMetadata };
  onSpotSelected: (spotId: string, row: number, col: number) => void;
  onBookNow: () => void;
  occupiedSpotIds: string[];
  selectedSpotId: string | null;
  holdExpiresAt: string | null;
};

/**
 * Props interface for the Hotel Stay calendar UI module.
 * Pass to the Date Range Picker component.
 */
export type HotelStayDetailProps = {
  listing: Listing & { metadata: HotelStayMetadata };
  onDateRangeSelected: (checkIn: string, checkOut: string, roomType: string) => void;
  onReserve: () => void;
  selectedCheckIn: string | null;
  selectedCheckOut: string | null;
  selectedRoomType: string | null;
  guestCount: number;
  onGuestCountChange: (count: number) => void;
};

/**
 * Props interface for the Food Delivery menu UI module.
 * Pass to the Menu Incrementor Tray component.
 */
export type FoodDeliveryDetailProps = {
  listing: Listing & { metadata: FoodDeliveryMetadata };
  onAddToCart: (itemId: string, name: string, priceDZD: number) => void;
  onAdjustCart: (itemId: string, delta: number) => void;
  onPlaceOrder: () => void;
  cartItems: { id: string; name: string; priceDZD: number; qty: number }[];
  selectedDeliverySpot: string | null;
  onSelectDeliverySpot: (spotId: string) => void;
};

/**
 * Props interface for the Partner Activity queue UI module.
 * Pass to the Reservation Queue Selector component.
 */
export type PartnerActivityDetailProps = {
  listing: Listing & { metadata: PartnerActivityMetadata };
  onReserve: (timeSlot: string, participants: number) => void;
  availableTimeSlots: string[];
  selectedTimeSlot: string | null;
  onSelectTimeSlot: (slot: string) => void;
  participantCount: number;
  onParticipantCountChange: (count: number) => void;
};

// ─────────────────────────────────────────────
// 6. REVENUE MAPPING TYPES
// ─────────────────────────────────────────────
// Used by business dashboards to map revenue dynamically per listing variant.

/**
 * Revenue breakdown per listing variant.
 * Business dashboards aggregate these to build analytics views.
 */
export type ListingRevenueBreakdown = {
  listing_id: string;
  listing_type: ServiceVariant;
  /** Total revenue in DZD */
  total_revenue_dzd: number;
  /** Number of completed transactions */
  transaction_count: number;
  /** Average transaction value in DZD */
  avg_transaction_dzd: number;
  /** Revenue period start (ISO 8601) */
  period_start: string;
  /** Revenue period end (ISO 8601) */
  period_end: string;
  /** Variant-specific revenue metrics */
  variant_metrics:
    | { kind: 'beach_spot'; spots_sold: number; avg_occupancy_rate: number }
    | { kind: 'hotel_stay'; nights_booked: number; avg_occupancy_rate: number }
    | { kind: 'food_delivery'; orders_fulfilled: number; avg_prep_time_minutes: number }
    | { kind: 'partner_activity'; sessions_completed: number; avg_participants: number };
};
