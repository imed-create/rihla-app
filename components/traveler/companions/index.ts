/**
 * RIHLA — Companion Dispatch
 * ──────────────────────────
 * Maps a booking's category to its live companion screen — the surface a
 * traveller uses *during* a booking, as opposed to the generic booking
 * detail. Every companion takes the same { booking, onBack } contract.
 */

import type { ComponentType } from 'react';
import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type { AppBooking } from '@/types/booking';
import type { MarketplaceCategory } from '@/types/service';

import ActivityCompanion from './ActivityCompanion';
import BeachCompanion from './BeachCompanion';
import DriverCompanion from './DriverCompanion';
import EventCompanion from './EventCompanion';
import ExperienceCompanion from './ExperienceCompanion';
import GuideCompanion from './GuideCompanion';
import HotelCompanion from './HotelCompanion';
import PhotographerCompanion from './PhotographerCompanion';
import RentalCompanion from './RentalCompanion';
import RestaurantCompanion from './RestaurantCompanion';

export type CompanionProps = {
  booking: AppBooking;
  onBack: () => void;
};

export type CompanionComponent = ComponentType<CompanionProps>;

const COMPANIONS: Record<MarketplaceCategory, CompanionComponent> = {
  activity: ActivityCompanion,
  beach: BeachCompanion,
  driver: DriverCompanion,
  event: EventCompanion,
  experience: ExperienceCompanion,
  guide: GuideCompanion,
  hotel: HotelCompanion,
  photographer: PhotographerCompanion,
  rental: RentalCompanion,
  restaurant: RestaurantCompanion,
};

/** What the entry point into each companion is called and does. */
const COMPANION_LABELS: Record<
  MarketplaceCategory,
  { title: string; subtitle: string; icon: ComponentProps<typeof Ionicons>['name'] }
> = {
  activity: { title: 'Activity Companion', subtitle: 'Meeting point, kit list and safety brief', icon: 'bicycle-outline' },
  beach: { title: 'Beach Companion', subtitle: 'Your spot, food delivery and beach services', icon: 'umbrella-outline' },
  driver: { title: 'Ride Companion', subtitle: 'Live driver location, vehicle and contact', icon: 'car-outline' },
  event: { title: 'Event Companion', subtitle: 'Entry ticket, venue and running order', icon: 'musical-notes-outline' },
  experience: { title: 'Trip Companion', subtitle: 'Day-by-day itinerary and what to pack', icon: 'compass-outline' },
  guide: { title: 'Guide Companion', subtitle: 'Your guide, meeting point and route', icon: 'map-outline' },
  hotel: { title: 'Stay Companion', subtitle: 'Room key, concierge requests and messaging', icon: 'bed-outline' },
  photographer: { title: 'Shoot Companion', subtitle: 'Session plan, location and gallery', icon: 'camera-outline' },
  rental: { title: 'Rental Companion', subtitle: 'Access details, house rules and support', icon: 'home-outline' },
  restaurant: { title: 'Order Companion', subtitle: 'Live order status and table details', icon: 'restaurant-outline' },
};

function isCompanionCategory(type: string): type is MarketplaceCategory {
  return Object.prototype.hasOwnProperty.call(COMPANIONS, type);
}

/** The companion for this booking, or null when its category has none. */
export function getCompanion(bookingType: string): CompanionComponent | null {
  return isCompanionCategory(bookingType) ? COMPANIONS[bookingType] : null;
}

/** Entry-point copy for this booking's companion, or null. */
export function getCompanionLabel(bookingType: string) {
  return isCompanionCategory(bookingType) ? COMPANION_LABELS[bookingType] : null;
}

export {
  ActivityCompanion,
  BeachCompanion,
  DriverCompanion,
  EventCompanion,
  ExperienceCompanion,
  GuideCompanion,
  HotelCompanion,
  PhotographerCompanion,
  RentalCompanion,
  RestaurantCompanion,
};
