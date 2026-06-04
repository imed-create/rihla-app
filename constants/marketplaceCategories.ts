/**
 * RIHLA — Marketplace Category Constants
 * ----------------------------------------
 * Centralized definitions for all 10 marketplace categories.
 * Single source of truth for labels, icons, colors across the entire app.
 */

import type { MarketplaceCategory } from '@/types/service';

export type CategoryDef = {
  key: MarketplaceCategory;
  label: string;
  labelPlural: string;
  icon: string;
  color: string;
  description: string;
};

export const MARKETPLACE_CATEGORIES: CategoryDef[] = [
  { key: 'hotel', label: 'Hotel', labelPlural: 'Hotels', icon: 'bed-outline', color: '#1A6B3A', description: 'Stays, riads, and guesthouses' },
  { key: 'restaurant', label: 'Restaurant', labelPlural: 'Restaurants', icon: 'restaurant-outline', color: '#C56A39', description: 'Dining, cafes, and street food' },
  { key: 'beach', label: 'Beach', labelPlural: 'Beaches', icon: 'umbrella-outline', color: '#00a896', description: 'Beach spots, zones, and amenities' },
  { key: 'rental', label: 'Rental', labelPlural: 'Rentals', icon: 'home-outline', color: '#6C63FF', description: 'Houses, apartments, and villas' },
  { key: 'activity', label: 'Activity', labelPlural: 'Activities', icon: 'bicycle-outline', color: '#E76F51', description: 'Adventures, sports, and tours' },
  { key: 'event', label: 'Event', labelPlural: 'Events', icon: 'musical-notes-outline', color: '#A855F7', description: 'Concerts, festivals, and shows' },
  { key: 'guide', label: 'Guide', labelPlural: 'Guides', icon: 'compass-outline', color: '#8B5E3C', description: 'Local experts and tour guides' },
  { key: 'photographer', label: 'Photographer', labelPlural: 'Photographers', icon: 'camera-outline', color: '#FF499E', description: 'Photography and videography' },
  { key: 'driver', label: 'Driver', labelPlural: 'Drivers', icon: 'car-outline', color: '#0a2540', description: 'Transfers, tours, and hire' },
  { key: 'experience', label: 'Experience', labelPlural: 'Experiences', icon: 'sparkles-outline', color: '#f4a261', description: 'Curated multi-day trips' },
];

/** Get a category definition by key */
export function getCategoryDef(key: MarketplaceCategory): CategoryDef {
  return MARKETPLACE_CATEGORIES.find((c) => c.key === key) ?? MARKETPLACE_CATEGORIES[0];
}

/** Get the icon for a category */
export function getCatIcon(key: MarketplaceCategory): string {
  return getCategoryDef(key).icon;
}

/** Get the label for a category */
export function getCatLabel(key: MarketplaceCategory): string {
  return getCategoryDef(key).label;
}

/** Get the color for a category */
export function getCatColor(key: MarketplaceCategory): string {
  return getCategoryDef(key).color;
}
