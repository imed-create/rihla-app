/**
 * RIHLA — AI Travel Itinerary Types
 * -----------------------------------
 * Defines the data model for AI-generated trip plans
 * that combine marketplace listings into curated multi-day experiences.
 */

/** A single activity/stop within an itinerary day */
export type ItineraryActivity = {
  /** Unique activity ID within the itinerary */
  id: string;
  /** Marketplace listing ID (links to a Listing) */
  listing_id?: string;
  /** Display title */
  title: string;
  /** Brief description */
  description: string;
  /** Start time (e.g., "09:00") */
  start_time: string;
  /** End time (e.g., "12:00") */
  end_time: string;
  /** Duration in minutes */
  duration_minutes: number;
  /** Cost in DZD (0 = free) */
  cost_dzd: number;
  /** Activity category icon (Ionicons name) */
  icon: string;
  /** GPS coordinates for map pin */
  coordinates?: { latitude: number; longitude: number };
  /** Whether this activity is already booked */
  is_booked: boolean;
};

/** A single day within an itinerary */
export type ItineraryDay = {
  /** Day number (1-based) */
  day: number;
  /** Date string (ISO 8601) */
  date: string;
  /** Human-readable day title (e.g., "Day 1: Arrival in Constantine") */
  title: string;
  /** Ordered list of activities */
  activities: ItineraryActivity[];
  /** Estimated daily cost in DZD */
  estimated_cost_dzd: number;
};

/** A complete multi-day itinerary */
export type Itinerary = {
  /** Unique itinerary ID */
  id: string;
  /** User who generated this itinerary */
  user_id: string;
  /** Trip title (e.g., "3 Days in Constantine") */
  title: string;
  /** Trip description */
  description: string;
  /** Destination name */
  destination: string;
  /** Wilaya / region */
  wilaya: string;
  /** Number of travelers */
  group_size: number;
  /** Start date (ISO 8601) */
  start_date: string;
  /** End date (ISO 8601) */
  end_date: string;
  /** Total trip cost in DZD */
  total_cost_dzd: number;
  /** Daily breakdown */
  days: ItineraryDay[];
  /** When the itinerary was generated */
  created_at: string;
  /** Whether the itinerary is saved/bookmarked */
  is_saved: boolean;
};

/** User input for generating an itinerary */
export type ItineraryRequest = {
  /** Destination name or wilaya */
  destination: string;
  /** Number of days */
  days: number;
  /** Number of travelers */
  group_size: number;
  /** Budget range in DZD */
  budget_min: number;
  budget_max: number;
  /** Preferences / interests */
  interests: ItineraryInterest[];
  /** Travel style */
  style: 'budget' | 'comfort' | 'luxury';
  /** Special requirements */
  notes?: string;
};

/** Available interest tags for itinerary generation */
export type ItineraryInterest =
  | 'culture'
  | 'adventure'
  | 'food'
  | 'nature'
  | 'history'
  | 'nightlife'
  | 'shopping'
  | 'photography'
  | 'relaxation'
  | 'family'
  | 'romance'
  | 'spiritual';
