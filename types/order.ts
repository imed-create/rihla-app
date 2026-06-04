/**
 * SAHEL Order & Booking Type System
 * ---------------------------------
 * Supports polymorphic order/booking states across all marketplace
 * verticals. Each variant carries its own validation fields so that
 * business dashboards can process and display order data without
 * type collisions.
 */

import type { ServiceVariant } from './service';

// ─────────────────────────────────────────────
// 1. ORDER STATUS (universal lifecycle)
// ─────────────────────────────────────────────

/**
 * Universal order lifecycle states.
 * Maps cleanly across all four marketplace variants.
 */
export type OrderStatus = 'pending' | 'preparing' | 'on_the_way' | 'delivered';

/**
 * Maps an OrderStatus to a human-readable label.
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  preparing: 'Preparing',
  on_the_way: 'On the way',
  delivered: 'Delivered',
};

/**
 * Maps an OrderStatus to an Ionicons icon name.
 */
export const ORDER_STATUS_ICONS: Record<OrderStatus, string> = {
  pending: 'time-outline',
  preparing: 'restaurant-outline',
  on_the_way: 'bicycle-outline',
  delivered: 'checkmark-circle-outline',
};

// ─────────────────────────────────────────────
// 2. MENU & FOOD TYPES
// ─────────────────────────────────────────────

export type MenuCategory = 'drinks' | 'food' | 'snacks';

export type MenuItem = {
  id: string;
  beachId: string;
  name: string;
  nameAr: string;
  priceDZD: number;
  category: MenuCategory;
  imageUrl?: string;
  emoji?: string;
  isAvailable: boolean;
};

// ─────────────────────────────────────────────
// 3. ORDER ITEM (universal)
// ─────────────────────────────────────────────

export type OrderItem = {
  id: string;
  orderId: string;
  menuItemId: string;
  name: string;
  nameAr?: string;
  quantity: number;
  priceDZD: number;
};

// ─────────────────────────────────────────────
// 4. VARIANT-SPECIFIC ORDER FIELDS
// ─────────────────────────────────────────────

/**
 * Validation fields specific to beach_spot bookings.
 * Carries grid selection metadata and hold countdown info.
 */
export type BeachSpotOrderFields = {
  variant: 'beach';
  /** Human-readable grid selection label (e.g., "Row B - Spot 4") */
  grid_selection_label: string;
  /** ISO 8601 timestamp when the 20-minute hold expires */
  countdown_hold_expires: string;
  /** Zone where the spot is located */
  zone: 'family' | 'vip' | 'free';
  /** The specific spot ID within the matrix grid */
  spot_id: string;
  /** Row index in the grid (0-based) */
  grid_row: number;
  /** Column index in the grid (0-based) */
  grid_col: number;
};

/**
 * Validation fields specific to hotel_stay bookings.
 */
export type HotelStayOrderFields = {
  variant: 'hotel';
  /** ISO 8601 check-in date */
  check_in_date: string;
  /** ISO 8601 check-out date */
  check_out_date: string;
  /** Number of nights booked */
  nights_count: number;
  /** Room type selected (e.g., "single", "double", "suite") */
  room_type: string;
  /** Number of guests */
  guest_count: number;
};

/**
 * Validation fields specific to food_delivery orders.
 * Tracks the full cart contents with item-level pricing.
 */
export type FoodDeliveryOrderFields = {
  variant: 'restaurant';
  /** Full list of ordered items with individual tracking */
  items: FoodOrderLine[];
  /** Delivery destination (beach spot label or desk number) */
  delivery_spot_label: string;
  /** Estimated preparation time in minutes */
  estimated_prep_minutes: number;
};

/**
 * A single line item in a food delivery order.
 */
export type FoodOrderLine = {
  /** Unique item identifier */
  item_id: string;
  /** Display name shown to both traveler and business */
  name: string;
  /** Quantity ordered */
  quantity: number;
  /** Price per unit in DZD */
  unit_price_dzd: number;
  /** Line total (quantity × unit_price) in DZD */
  line_total_dzd: number;
};

/**
 * Validation fields specific to partner_activity bookings.
 */
export type PartnerActivityOrderFields = {
  variant: 'activity';
  /** The time slot booked (e.g., "10:00", "14:30") */
  time_slot: string;
  /** Duration of the session in minutes */
  session_duration_minutes: number;
  /** Number of participants in the booking */
  participant_count: number;
  /** The partner's name who will fulfill the service */
  partner_name: string;
  /** Activity category (e.g., "massage", "jetski") */
  activity_category: string;
};

/**
 * Discriminated union of all variant-specific order fields.
 * Narrow by `variant` to get the specific fields.
 */
export type VariantOrderFields =
  | BeachSpotOrderFields
  | HotelStayOrderFields
  | FoodDeliveryOrderFields
  | PartnerActivityOrderFields;

// ─────────────────────────────────────────────
// 5. UNIFIED ORDER INTERFACE
// ─────────────────────────────────────────────

/**
 * A polymorphic order in the SAHEL marketplace.
 *
 * Every order belongs to one of the four marketplace verticals.
 * The `variant_fields` field is a discriminated union — narrow it
 * by checking `variant_fields.variant` at runtime.
 */
export type Order = {
  /** Unique order identifier */
  id: string;
  /** User who placed the order */
  userId: string;
  /** Beach/location ID where this order originates */
  beachId: string;
  /** Optional associated booking ID */
  bookingId?: string;
  /** Optional spot label for delivery */
  spotLabel?: string;
  /** Current lifecycle status */
  status: OrderStatus;
  /** Total cost in DZD */
  totalDZD: number;
  /** Whether payment has been received */
  paid: boolean;
  /** ISO 8601 creation timestamp */
  createdAt: string;
  /** Universal order items (used primarily by restaurant orders) */
  items: OrderItem[];
  /** The marketplace vertical this order belongs to */
  service_variant?: ServiceVariant;
  /** Variant-specific validation fields — discriminant is `variant`. Optional for backward compat. */
  variant_fields?: VariantOrderFields;
};

// ─────────────────────────────────────────────
// 6. ORDER CREATION PARAMS
// ─────────────────────────────────────────────

/** Parameters for creating a new order (id, timestamps, status are auto-generated) */
export type CreateOrderParams = Omit<Order, 'id' | 'createdAt' | 'status'> & {
  status?: OrderStatus;
  variant_fields?: VariantOrderFields;
};

// ─────────────────────────────────────────────
// 7. HELPER: GET VARIANT FIELDS FROM ORDER
// ─────────────────────────────────────────────

/** Type guard: check if order is a beach_spot order */
export function isBeachSpotOrder(order: Order): order is Order & { variant_fields: BeachSpotOrderFields } {
  return order.variant_fields?.variant === 'beach';
}

/** Type guard: check if order is a hotel_stay order */
export function isHotelStayOrder(order: Order): order is Order & { variant_fields: HotelStayOrderFields } {
  return order.variant_fields?.variant === 'hotel';
}

/** Type guard: check if order is a food_delivery order */
export function isFoodDeliveryOrder(order: Order): order is Order & { variant_fields: FoodDeliveryOrderFields } {
  return order.variant_fields?.variant === 'restaurant';
}

/** Type guard: check if order is a partner_activity order */
export function isPartnerActivityOrder(order: Order): order is Order & { variant_fields: PartnerActivityOrderFields } {
  return order.variant_fields?.variant === 'activity';
}

/**
 * Calculate the total for a food delivery order from its line items.
 */
export function calculateFoodOrderTotal(lines: FoodOrderLine[]): number {
  return lines.reduce((sum, line) => sum + line.line_total_dzd, 0);
}

/**
 * Generate a human-readable order summary string based on variant.
 * Returns a generic fallback for legacy orders without variant_fields.
 */
export function getOrderSummary(order: Order): string {
  if (!order.variant_fields) {
    return `${order.items.length} item(s) · ${order.totalDZD} DZD`;
  }
  switch (order.variant_fields.variant) {
    case 'beach':
      return `Spot: ${order.variant_fields.grid_selection_label} (${order.variant_fields.zone} zone)`;
    case 'hotel':
      return `${order.variant_fields.nights_count} night(s) · ${order.variant_fields.room_type} · ${order.variant_fields.guest_count} guest(s)`;
    case 'restaurant':
      return `${order.variant_fields.items.length} item(s) → ${order.variant_fields.delivery_spot_label}`;
    case 'activity':
      return `${order.variant_fields.activity_category} · ${order.variant_fields.time_slot} · ${order.variant_fields.participant_count} pax`;
  }
}
