/**
 * RIHLA — Booking Location Resolver
 * ─────────────────────────────────
 * Bookings store a title and subtitle but no coordinates, so map screens
 * had nothing real to point at. This resolves a booking to the best
 * coordinates available, in order of confidence:
 *
 *   1. exact title match against the marketplace catalogue
 *   2. the wilaya named in the subtitle, via any listing there
 *   3. the wilaya named in the subtitle, via the wilaya table
 *   4. Algiers city centre
 *
 * Wilaya naming differs between sources ('Alger' vs 'Algiers', accented
 * vs plain), so comparisons run through normalizeName().
 */

import { MOCK_LISTINGS } from '@/constants/mockListings';
import { WILAYAS } from '@/constants/wilayas';
import type { AppBooking } from '@/types/booking';

export type Coordinates = { latitude: number; longitude: number };

/** Algiers city centre — the last-resort fallback. */
export const ALGIERS_CENTER: Coordinates = { latitude: 36.7538, longitude: 3.0588 };

export type ResolvedLocation = Coordinates & {
  /** Human-readable place name, when one was found. */
  label?: string;
  /** How the coordinates were obtained — useful for deciding UI confidence. */
  source: 'listing' | 'wilaya' | 'fallback';
};

/** Lowercase, strip accents, and fold the Alger/Algiers spelling split. */
function normalizeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/^algiers$/, 'alger');
}

/**
 * Booking subtitles are written as "Wilaya · detail · detail" or
 * "Origin → Destination", so the leading segment is the place name.
 */
export function extractPlaceName(subtitle: string): string {
  const [first] = subtitle.split(/·|→|—|-{1,2}\s/);
  return (first ?? '').trim();
}

export function resolveBookingLocation(booking: AppBooking): ResolvedLocation {
  // 1. The listing this booking was made against.
  const byTitle = MOCK_LISTINGS.find(
    (listing) => normalizeName(listing.title) === normalizeName(booking.title)
  );
  if (byTitle) {
    return {
      latitude: byTitle.coordinates.latitude,
      longitude: byTitle.coordinates.longitude,
      label: `${byTitle.title}, ${byTitle.wilaya}`,
      source: 'listing',
    };
  }

  const place = extractPlaceName(booking.subtitle);
  if (place) {
    const normalizedPlace = normalizeName(place);

    // 2. Any listing in the same wilaya gets us into the right city.
    const byWilaya = MOCK_LISTINGS.find(
      (listing) => normalizeName(listing.wilaya) === normalizedPlace
    );
    if (byWilaya) {
      return {
        latitude: byWilaya.coordinates.latitude,
        longitude: byWilaya.coordinates.longitude,
        label: byWilaya.wilaya,
        source: 'wilaya',
      };
    }

    // 3. The wilaya table covers all 58, including ones with no listings yet.
    const wilaya = WILAYAS.find(
      (w) =>
        normalizeName(w.name) === normalizedPlace ||
        normalizeName(w.nameFr) === normalizedPlace ||
        normalizeName(w.code) === normalizedPlace
    );
    if (wilaya) {
      return { latitude: wilaya.lat, longitude: wilaya.lng, label: wilaya.name, source: 'wilaya' };
    }
  }

  // 4. Nothing matched.
  return { ...ALGIERS_CENTER, source: 'fallback' };
}

/**
 * A gentle curve between two points, for drawing an indicative route.
 * Offsets the midpoints perpendicular to the straight line so the path
 * reads as a road rather than a ruler.
 */
export function buildRoutePoints(from: Coordinates, to: Coordinates, steps = 5): Coordinates[] {
  const safeSteps = Math.max(2, steps);
  const dLat = to.latitude - from.latitude;
  const dLng = to.longitude - from.longitude;

  return Array.from({ length: safeSteps }, (_, index) => {
    const t = index / (safeSteps - 1);
    // Peaks at the midpoint, zero at both ends.
    const bow = Math.sin(t * Math.PI) * 0.12;
    return {
      latitude: from.latitude + dLat * t - dLng * bow,
      longitude: from.longitude + dLng * t + dLat * bow,
    };
  });
}

/** Great-circle distance in kilometres. */
export function distanceKm(from: Coordinates, to: Coordinates): number {
  const EARTH_RADIUS_KM = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(to.latitude - from.latitude);
  const dLng = toRad(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.latitude)) * Math.cos(toRad(to.latitude)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Rough travel time at Algerian mixed urban/road speeds (~38 km/h),
 * floored at 3 minutes so an arrived-at-destination case still reads sanely.
 */
export function estimateEtaMinutes(from: Coordinates, to: Coordinates): number {
  const AVERAGE_SPEED_KMH = 38;
  return Math.max(3, Math.round((distanceKm(from, to) / AVERAGE_SPEED_KMH) * 60));
}
