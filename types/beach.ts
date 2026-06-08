/**
 * RIHLA Beach & Spot Types
 * ------------------------
 * Defines the beach zone architecture, spot grid matrix, and
 * booking types with polymorphic support for grid selection
 * labels and countdown hold timestamps.
 */

// ─────────────────────────────────────────────
// 1. ZONE TYPES
// ─────────────────────────────────────────────

/** Beach zone labels for spot grid matrices */
export type ZoneType = 'Family' | 'VIP' | 'Free';

/** 0 = walkway (not bookable), 1 = available, 2 = locked/taken */
export type SpotCellStatus = 0 | 1 | 2;

// ─────────────────────────────────────────────
// 2. SPOT & MATRIX
// ─────────────────────────────────────────────

export type Spot = {
  id: string;
  row: number;
  col: number;
  status: SpotCellStatus;
  zone: ZoneType;
  price: number;
};

export type SpotMatrix = Spot[][];

// ─────────────────────────────────────────────
// 3. BEACH LOCATION
// ─────────────────────────────────────────────

export type BeachLocation = {
  latitude: number;
  longitude: number;
};

export type Beach = {
  id: string;
  name: string;
  wilaya: string;
  location: BeachLocation;
  photos: string[];
  zones: ZoneType[];
  rating: number;
  isActive: boolean;
  spotMatrix?: SpotMatrix;
};

// ─────────────────────────────────────────────
// 4. LEGACY ZONE ID MAPPING
// ─────────────────────────────────────────────

/** Legacy lowercase zone ids used by beachLayout.ts */
export type SandZoneId = 'family' | 'vip' | 'free';

export function zoneTypeToSandId(zone: ZoneType): SandZoneId {
  if (zone === 'VIP') return 'vip';
  if (zone === 'Free') return 'free';
  return 'family';
}

export function sandIdToZoneType(id: SandZoneId): ZoneType {
  if (id === 'vip') return 'VIP';
  if (id === 'free') return 'Free';
  return 'Family';
}

// ─────────────────────────────────────────────
// 5. SPOT BOOKING (with polymorphic fields)
// ─────────────────────────────────────────────

export type SpotBookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

/**
 * A beach spot booking with polymorphic grid selection tracking.
 *
 * Carries both the raw grid coordinates and a human-readable
 * `grid_selection_label` (e.g., "Row B - Spot 4") for display
 * in business dashboards and traveler booking cards.
 */
export type BeachBooking = {
  /** Unique booking identifier */
  id: string;
  /** User who made the booking */
  userId: string;
  /** Spot ID within the matrix grid */
  spotId: string;
  /** Beach location ID */
  beachId: string;
  /** Booking date (ISO 8601) */
  date: string;
  /** Current booking status */
  status: SpotBookingStatus;
  /** Total cost in DZD */
  totalDZD: number;
  /** Whether payment has been received */
  paid: boolean;
  /** ISO 8601 timestamp when the hold expires (null for free zones) */
  expiresAt?: string;

  // ── Polymorphic grid selection fields ──

  /** Human-readable grid selection label (e.g., "Row B - Spot 4") */
  grid_selection_label: string;
  /** ISO 8601 timestamp when the 20-minute hold auto-cancels */
  countdown_hold_expires: string;
  /** Zone where the spot is located */
  zone: SandZoneId;
  /** Row index in the grid (0-based) */
  grid_row: number;
  /** Column index in the grid (0-based) */
  grid_col: number;
};

/**
 * Parameters for creating a new beach spot booking.
 * Auto-generates id, status, and timestamps.
 */
export type CreateBeachBookingParams = Omit<BeachBooking, 'id' | 'status' | 'date'> & {
  date?: string;
};

// ─────────────────────────────────────────────
// 6. SPOT HELPERS
// ─────────────────────────────────────────────

/**
 * Generate a human-readable grid selection label from row/col indices.
 * Row indices are mapped to letters (A, B, C...) and col to 1-based numbers.
 *
 * @example getGridSelectionLabel(1, 3) → "Row B - Spot 4"
 */
export function getGridSelectionLabel(row: number, col: number): string {
  const rowLetter = String.fromCharCode(65 + row); // 0 = A, 1 = B, ...
  return `Row ${rowLetter} - Spot ${col + 1}`;
}

/**
 * Check if a hold has expired based on the countdown timestamp.
 */
export function isHoldExpired(holdExpiresAt: string): boolean {
  return new Date(holdExpiresAt).getTime() <= Date.now();
}

/**
 * Calculate remaining hold time in seconds.
 * Returns 0 if the hold has already expired.
 */
export function getHoldRemainingSeconds(holdExpiresAt: string): number {
  const remaining = Math.floor((new Date(holdExpiresAt).getTime() - Date.now()) / 1000);
  return Math.max(0, remaining);
}

/**
 * Format remaining hold time as "MM:SS" string.
 */
export function formatHoldCountdown(holdExpiresAt: string): string {
  const totalSeconds = getHoldRemainingSeconds(holdExpiresAt);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Calculate a hold expiry timestamp N minutes from now.
 */
export function createHoldExpiry(minutes: number): string {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}
