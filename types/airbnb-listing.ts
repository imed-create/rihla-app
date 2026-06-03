/** Shape of each listing inside assets/data/airbnb-listings.json */
export interface AirbnbListing {
  id: string;
  name: string;
  summary?: string | null;
  medium_url: string;
  thumbnail_url?: string;
  price: number;
  room_type: string;
  property_type?: string;
  review_scores_rating: number;
  number_of_reviews?: number;
  latitude: string;
  longitude: string;
  city?: string;
  neighbourhood?: string | null;
  host_name?: string;
  accommodates?: number;
  beds?: number;
  bathrooms?: number;
  bedrooms?: number;
  amenities?: string[];
}

/** GeoJSON Feature wrapping an AirbnbListing for map clustering */
export interface AirbnbListingFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: AirbnbListing & {
    point_count?: number;
  };
}

/** GeoJSON FeatureCollection of listing features */
export interface AirbnbListingCollection {
  type: 'FeatureCollection';
  features: AirbnbListingFeature[];
}
