import type { AppBooking } from '@/types/booking';
import {
  ALGIERS_CENTER,
  buildRoutePoints,
  distanceKm,
  estimateEtaMinutes,
  extractPlaceName,
  resolveBookingLocation,
} from '../bookingLocation';

function makeBooking(overrides: Partial<AppBooking>): AppBooking {
  return {
    id: 'test-1',
    type: 'hotel',
    icon: 'bed',
    iconFamily: 'Ionicons',
    color: '#0a2540',
    title: 'Test Booking',
    subtitle: 'Algiers · Test',
    price: 1000,
    status: 'active',
    createdAt: new Date().toISOString(),
    details: {},
    ...overrides,
  };
}

describe('extractPlaceName', () => {
  it('takes the leading segment of a dot-separated subtitle', () => {
    expect(extractPlaceName('Tipaza · Spot A3 · Family Zone')).toBe('Tipaza');
  });

  it('takes the origin of an arrow-separated subtitle', () => {
    expect(extractPlaceName('Algiers Airport → City Center')).toBe('Algiers Airport');
  });

  it('returns an empty string for an empty subtitle', () => {
    expect(extractPlaceName('')).toBe('');
  });
});

describe('resolveBookingLocation', () => {
  it('resolves a booking whose title matches a catalogue listing', () => {
    const result = resolveBookingLocation(
      makeBooking({ title: 'Hotel El Djazair', subtitle: 'Algiers · Seafront Suite' })
    );
    expect(result.source).toBe('listing');
    // Algiers sits around 36.7N, 3.0E.
    expect(result.latitude).toBeGreaterThan(36);
    expect(result.latitude).toBeLessThan(37.5);
    expect(result.longitude).toBeGreaterThan(2);
    expect(result.longitude).toBeLessThan(4);
  });

  it('resolves the seeded beach booking to Tipaza, not Algiers', () => {
    const result = resolveBookingLocation(
      makeBooking({
        type: 'beach',
        title: 'Sidi Fredj Family Zone',
        subtitle: 'Tipaza · Spot A3 · Family Zone',
      })
    );
    expect(result.source).toBe('listing');
    // Tipaza is west of Algiers — the old hardcoded pin was wrong for this.
    expect(result.longitude).toBeLessThan(ALGIERS_CENTER.longitude);
  });

  it('falls back to the wilaya when the title is unknown', () => {
    const result = resolveBookingLocation(
      makeBooking({ title: 'Some Unlisted Provider', subtitle: 'Oran · Custom booking' })
    );
    expect(result.source).toBe('wilaya');
    expect(result.label).toBeTruthy();
    // Oran is well west of Algiers.
    expect(result.longitude).toBeLessThan(0);
  });

  it('matches wilaya names across spelling and accent differences', () => {
    const plain = resolveBookingLocation(
      makeBooking({ title: 'Unlisted', subtitle: 'Bejaia · Something' })
    );
    const accented = resolveBookingLocation(
      makeBooking({ title: 'Unlisted', subtitle: 'Béjaïa · Something' })
    );
    expect(plain.source).not.toBe('fallback');
    expect(accented.source).not.toBe('fallback');
    expect(accented.latitude).toBeCloseTo(plain.latitude, 1);
  });

  it('falls back to Algiers when nothing matches', () => {
    const result = resolveBookingLocation(
      makeBooking({ title: 'Nowhere At All', subtitle: 'Atlantis · Nothing' })
    );
    expect(result.source).toBe('fallback');
    expect(result.latitude).toBe(ALGIERS_CENTER.latitude);
    expect(result.longitude).toBe(ALGIERS_CENTER.longitude);
  });
});

describe('buildRoutePoints', () => {
  const from = { latitude: 36.75, longitude: 3.05 };
  const to = { latitude: 36.59, longitude: 2.45 };

  it('starts at the origin and ends at the destination', () => {
    const points = buildRoutePoints(from, to);
    expect(points[0].latitude).toBeCloseTo(from.latitude, 6);
    expect(points[0].longitude).toBeCloseTo(from.longitude, 6);
    expect(points[points.length - 1].latitude).toBeCloseTo(to.latitude, 6);
    expect(points[points.length - 1].longitude).toBeCloseTo(to.longitude, 6);
  });

  it('returns the requested number of points', () => {
    expect(buildRoutePoints(from, to, 7)).toHaveLength(7);
  });

  it('never returns fewer than two points', () => {
    expect(buildRoutePoints(from, to, 1)).toHaveLength(2);
  });

  it('bows away from the straight line at the midpoint', () => {
    const points = buildRoutePoints(from, to, 5);
    const mid = points[2];
    const straightMidLat = (from.latitude + to.latitude) / 2;
    const straightMidLng = (from.longitude + to.longitude) / 2;
    const offset = Math.hypot(mid.latitude - straightMidLat, mid.longitude - straightMidLng);
    expect(offset).toBeGreaterThan(0);
  });
});

describe('distanceKm', () => {
  it('is zero for the same point', () => {
    expect(distanceKm(ALGIERS_CENTER, ALGIERS_CENTER)).toBeCloseTo(0, 5);
  });

  it('gives a sane Algiers → Oran distance (~350km)', () => {
    const oran = { latitude: 35.6969, longitude: -0.6331 };
    const km = distanceKm(ALGIERS_CENTER, oran);
    expect(km).toBeGreaterThan(300);
    expect(km).toBeLessThan(400);
  });

  it('is symmetric', () => {
    const oran = { latitude: 35.6969, longitude: -0.6331 };
    expect(distanceKm(ALGIERS_CENTER, oran)).toBeCloseTo(distanceKm(oran, ALGIERS_CENTER), 6);
  });
});

describe('estimateEtaMinutes', () => {
  it('never drops below the 3 minute floor', () => {
    expect(estimateEtaMinutes(ALGIERS_CENTER, ALGIERS_CENTER)).toBe(3);
  });

  it('scales with distance', () => {
    const near = { latitude: 36.76, longitude: 3.06 };
    const far = { latitude: 35.69, longitude: -0.63 };
    expect(estimateEtaMinutes(ALGIERS_CENTER, far)).toBeGreaterThan(
      estimateEtaMinutes(ALGIERS_CENTER, near)
    );
  });
});
