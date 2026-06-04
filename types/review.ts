/**
 * RIHLA — Review & Rating System
 * --------------------------------
 * Reviews are tied to listings and written by travelers after completing a booking.
 */

/** A single review left by a traveler on a listing */
export type Review = {
  /** Unique review ID */
  id: string;
  /** The listing being reviewed */
  listing_id: string;
  /** The traveler who wrote the review */
  reviewer_id: string;
  /** Display name of the reviewer */
  reviewer_name: string;
  /** Optional avatar URL */
  reviewer_avatar?: string;
  /** Rating from 1 to 5 */
  rating: number;
  /** Review title (optional) */
  title?: string;
  /** Review body text */
  body: string;
  /** Photo URLs attached to the review */
  photos: string[];
  /** When the review was written */
  created_at: string;
  /** Whether the review is verified (reviewer actually completed a booking) */
  verified: boolean;
  /** Owner response (optional) */
  owner_response?: {
    body: string;
    responded_at: string;
  };
};

/** Parameters for creating a new review */
export type CreateReviewParams = {
  listing_id: string;
  rating: number;
  title?: string;
  body: string;
  photos?: string[];
};

/** Aggregated rating summary for a listing */
export type RatingSummary = {
  /** Average rating */
  average: number;
  /** Total number of reviews */
  count: number;
  /** Rating distribution (1-5 stars) */
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
};

/** Category-specific rating dimensions */
export type RatingDimensions = {
  /** Overall quality */
  quality: number;
  /** Value for money */
  value: number;
  /** Cleanliness / Maintenance */
  cleanliness: number;
  /** Location accuracy */
  location: number;
  /** Communication (with host / provider) */
  communication: number;
};
