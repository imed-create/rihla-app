export interface Service {
  id: string;
  category: 'beach' | 'desert' | 'mountain' | 'historical' | 'city';
  title: string;
  tagline: string;
  icon: string;
  iconFamily: 'Ionicons' | 'MaterialCommunityIcons' | 'Feather';
  color: string;
  route: string;
  basePrice: number;
  priceUnit: string;
}

function comingSoonRoute(title: string) {
  return `/services/coming-soon?name=${encodeURIComponent(title)}`;
}

/** Routes with implemented screens */
const LIVE_ROUTES = new Set([
  '/services/beach/parking',
  '/services/beach/spots',
  '/services/beach/food',
  '/services/beach/clothes',
  '/services/beach/games',
  '/services/beach/beach-items',
  '/services/beach/massage',
  '/services/beach/hotels',
  '/services/beach/showers',
  '/services/beach/events',
  '/services/beach/powerbank',
  '/services/beach/photos',
  '/services/beach/guide',
  '/services/desert/camel',
  '/services/desert/camp',
  '/services/desert/dune-buggy',
  '/services/desert/stargazing',
  '/services/desert/desert-guide',
]);

const RAW_SERVICES: Service[] = [
  // ───── BEACH SERVICES (13) ─────
  { id: 'parking', category: 'beach', title: 'Parking', tagline: 'Reserve your spot', icon: 'car-outline', iconFamily: 'Ionicons', color: '#023E58', route: '/services/beach/parking', basePrice: 200, priceUnit: 'DA/day' },
  { id: 'spots', category: 'beach', title: 'Beach Spots', tagline: 'Umbrella & chairs', icon: 'umbrella-outline', iconFamily: 'Ionicons', color: '#00a896', route: '/services/beach/spots', basePrice: 1500, priceUnit: 'DA/day' },
  { id: 'food', category: 'beach', title: 'Food & Drinks', tagline: 'Order to your spot', icon: 'restaurant-outline', iconFamily: 'Ionicons', color: '#F4A261', route: '/services/beach/food', basePrice: 800, priceUnit: 'DA/meal' },
  { id: 'clothes', category: 'beach', title: 'Swim Shop', tagline: 'Swimwear & gear', icon: 'shirt-outline', iconFamily: 'Ionicons', color: '#FF6B6B', route: '/services/beach/clothes', basePrice: 1200, priceUnit: 'DA/item' },
  { id: 'games', category: 'beach', title: 'Games & Fun', tagline: 'Rentals & activities', icon: 'game-controller-outline', iconFamily: 'Ionicons', color: '#20C997', route: '/services/beach/games', basePrice: 500, priceUnit: 'DA/hour' },
  { id: 'beach-items', category: 'beach', title: 'Water Rides', tagline: 'Jet-ski & pedalo', icon: 'water-outline', iconFamily: 'Ionicons', color: '#0a2540', route: '/services/beach/beach-items', basePrice: 3500, priceUnit: 'DA/session' },
  { id: 'massage', category: 'beach', title: 'Massage', tagline: 'Seaside relaxation', icon: 'hand-heart-outline', iconFamily: 'MaterialCommunityIcons', color: '#845EC2', route: '/services/beach/massage', basePrice: 2500, priceUnit: 'DA/session' },
  { id: 'hotels', category: 'beach', title: 'Stay & Rent', tagline: 'Nearby hotels', icon: 'bed-outline', iconFamily: 'Ionicons', color: '#1A6B3A', route: '/services/beach/hotels', basePrice: 9500, priceUnit: 'DA/night' },
  { id: 'showers', category: 'beach', title: 'Showers', tagline: 'Fresh & clean', icon: 'shower-head', iconFamily: 'MaterialCommunityIcons', color: '#48CAE4', route: '/services/beach/showers', basePrice: 100, priceUnit: 'DA/use' },
  { id: 'events', category: 'beach', title: 'Events', tagline: 'Parties & tickets', icon: 'musical-notes-outline', iconFamily: 'Ionicons', color: '#FF70A6', route: '/services/beach/events', basePrice: 2000, priceUnit: 'DA/ticket' },
  { id: 'powerbank', category: 'beach', title: 'Power Bank', tagline: 'Stay charged', icon: 'battery-charging-outline', iconFamily: 'Ionicons', color: '#06D6A0', route: '/services/beach/powerbank', basePrice: 200, priceUnit: 'DA/hour' },
  { id: 'photos', category: 'beach', title: 'Photo Service', tagline: 'Beach photography', icon: 'camera-outline', iconFamily: 'Ionicons', color: '#FF499E', route: '/services/beach/photos', basePrice: 1500, priceUnit: 'DA/session' },
  { id: 'guide', category: 'beach', title: 'Beach Guide', tagline: 'Rules & safety', icon: 'compass-outline', iconFamily: 'Ionicons', color: '#A8763E', route: '/services/beach/guide', basePrice: 1000, priceUnit: 'DA/day' },

  // ───── DESERT SERVICES (12) ─────
  { id: 'camel', category: 'desert', title: 'Camel Ride', tagline: 'Half-day / full-day camel trek', icon: 'image-outline', iconFamily: 'Ionicons', color: '#E76F51', route: '/services/desert/camel', basePrice: 2500, priceUnit: 'DA/ride' },
  { id: 'camp', category: 'desert', title: 'Desert Camp', tagline: 'Luxury tent under the stars', icon: 'home-outline', iconFamily: 'Ionicons', color: '#C1440E', route: '/services/desert/camp', basePrice: 12000, priceUnit: 'DA/night' },
  { id: 'dune-buggy', category: 'desert', title: 'Quad & Buggy', tagline: 'ATV dunes tour', icon: 'speedometer-outline', iconFamily: 'Ionicons', color: '#F4A261', route: '/services/desert/dune-buggy', basePrice: 5000, priceUnit: 'DA/hour' },
  { id: 'desert-trek', category: 'desert', title: 'Desert Trek', tagline: 'Guided hiking adventure', icon: 'walk-outline', iconFamily: 'Ionicons', color: '#2D6A4F', route: '/services/desert/desert-trek', basePrice: 6000, priceUnit: 'DA/day' },
  { id: 'traditional-food', category: 'desert', title: 'Traditional Food', tagline: 'Tagine & mint tea at camp', icon: 'restaurant-outline', iconFamily: 'Ionicons', color: '#D4A373', route: '/services/desert/traditional-food', basePrice: 1800, priceUnit: 'DA/person' },
  { id: 'desert-photos', category: 'desert', title: 'Photoshoot', tagline: 'Sunrise & sunset photoshoot', icon: 'camera-outline', iconFamily: 'Ionicons', color: '#E76F51', route: '/services/desert/desert-photos', basePrice: 3000, priceUnit: 'DA/session' },
  { id: 'stargazing', category: 'desert', title: 'Stargazing', tagline: 'Telescope & guide', icon: 'telescope-outline', iconFamily: 'MaterialCommunityIcons', color: '#3F37C9', route: '/services/desert/stargazing', basePrice: 1500, priceUnit: 'DA/session' },
  { id: 'cultural-show', category: 'desert', title: 'Tuareg Show', tagline: 'Traditional music & dance', icon: 'musical-notes-outline', iconFamily: 'Ionicons', color: '#7209B7', route: '/services/desert/cultural-show', basePrice: 2000, priceUnit: 'DA/ticket' },
  { id: 'safari-4x4', category: 'desert', title: '4x4 Sahara Safari', tagline: 'Full-day off-road tour', icon: 'car-outline', iconFamily: 'Ionicons', color: '#E76F51', route: '/services/desert/safari-4x4', basePrice: 15000, priceUnit: 'DA/day' },
  { id: 'desert-hotels', category: 'desert', title: 'Sahara Riads', tagline: 'Local desert guesthouses', icon: 'bed-outline', iconFamily: 'Ionicons', color: '#1B4332', route: '/services/desert/desert-hotels', basePrice: 8000, priceUnit: 'DA/night' },
  { id: 'desert-guide', category: 'desert', title: 'Private Guide', tagline: 'Hire a certified local expert', icon: 'compass-outline', iconFamily: 'Ionicons', color: '#A8763E', route: '/services/desert/desert-guide', basePrice: 4000, priceUnit: 'DA/day' },
  { id: 'safety-kit', category: 'desert', title: 'Safety Kit', tagline: 'Rent GPS & emergency water', icon: 'shield-checkmark-outline', iconFamily: 'Ionicons', color: '#E63946', route: '/services/desert/safety-kit', basePrice: 1000, priceUnit: 'DA/day' },

  // ───── MOUNTAIN SERVICES (10) ─────
  { id: 'hiking-guide', category: 'mountain', title: 'Hiking Guide', tagline: 'Local trail expert', icon: 'walk-outline', iconFamily: 'Ionicons', color: '#2D6A4F', route: '/services/mountain/hiking-guide', basePrice: 3500, priceUnit: 'DA/day' },
  { id: 'mountain-chalet', category: 'mountain', title: 'Chalet Rent', tagline: 'Cosy wood chalets & gites', icon: 'home-outline', iconFamily: 'Ionicons', color: '#1B4332', route: '/services/mountain/mountain-chalet', basePrice: 10000, priceUnit: 'DA/night' },
  { id: 'paragliding', category: 'mountain', title: 'Paragliding', tagline: 'Tandem flight with instructor', icon: 'airplane-outline', iconFamily: 'Ionicons', color: '#4EA8DE', route: '/services/mountain/paragliding', basePrice: 8000, priceUnit: 'DA/flight' },
  { id: 'rock-climbing', category: 'mountain', title: 'Rock Climbing', tagline: 'Guided climb & gear hire', icon: 'shield-outline', iconFamily: 'Ionicons', color: '#52B788', route: '/services/mountain/rock-climbing', basePrice: 4000, priceUnit: 'DA/session' },
  { id: 'mountain-biking', category: 'mountain', title: 'Mountain Bike', tagline: 'Rent premium trails bikes', icon: 'bicycle-outline', iconFamily: 'Ionicons', color: '#74C69D', route: '/services/mountain/mountain-biking', basePrice: 2000, priceUnit: 'DA/day' },
  { id: 'camping-spot', category: 'mountain', title: 'Camping Spot', tagline: 'Reserve a secure campsite', icon: 'leaf-outline', iconFamily: 'Ionicons', color: '#40916C', route: '/services/mountain/camping-spot', basePrice: 1500, priceUnit: 'DA/night' },
  { id: 'bbq-package', category: 'mountain', title: 'BBQ Package', tagline: 'Meat, charcoal & grill setup', icon: 'restaurant-outline', iconFamily: 'Ionicons', color: '#E76F51', route: '/services/mountain/bbq-package', basePrice: 2500, priceUnit: 'DA/pack' },
  { id: 'nature-photos', category: 'mountain', title: 'Nature Photos', tagline: 'Professional trip photographer', icon: 'camera-outline', iconFamily: 'Ionicons', color: '#52B788', route: '/services/mountain/nature-photos', basePrice: 3000, priceUnit: 'DA/session' },
  { id: 'foraging-tour', category: 'mountain', title: 'Foraging Tour', tagline: 'Wild herb & plant walk', icon: 'eye-outline', iconFamily: 'Ionicons', color: '#2D6A4F', route: '/services/mountain/foraging-tour', basePrice: 1500, priceUnit: 'DA/tour' },
  { id: 'first-aid-kit', category: 'mountain', title: 'Safety Kit', tagline: 'Rent emergency first-aid', icon: 'heart-outline', iconFamily: 'Ionicons', color: '#E63946', route: '/services/mountain/first-aid-kit', basePrice: 800, priceUnit: 'DA/day' },

  // ───── HERITAGE SERVICES (8) ─────
  { id: 'expert-guide', category: 'historical', title: 'Historian Guide', tagline: 'Licensed expert archaeologist', icon: 'school-outline', iconFamily: 'Ionicons', color: '#8B5E3C', route: '/services/historical/expert-guide', basePrice: 4000, priceUnit: 'DA/day' },
  { id: 'audio-tour', category: 'historical', title: 'Audio Guide', tagline: 'Multilingual device rental', icon: 'volume-high-outline', iconFamily: 'Ionicons', color: '#6B3F1E', route: '/services/historical/audio-tour', basePrice: 800, priceUnit: 'DA/device' },
  { id: 'heritage-photos', category: 'historical', title: 'Heritage Photos', tagline: 'Historic photoshoot session', icon: 'camera-outline', iconFamily: 'Ionicons', color: '#A0522D', route: '/services/historical/heritage-photos', basePrice: 3500, priceUnit: 'DA/session' },
  { id: 'craft-workshop', category: 'historical', title: 'Craft Workshop', tagline: 'Pottery or weaving class', icon: 'brush-outline', iconFamily: 'Ionicons', color: '#B07D62', route: '/services/historical/craft-workshop', basePrice: 2000, priceUnit: 'DA/class' },
  { id: 'traditional-tea', category: 'historical', title: 'Tea & Sweets', tagline: 'Mint tea at ancient cafe', icon: 'cafe-outline', iconFamily: 'Ionicons', color: '#8B5E3C', route: '/services/historical/traditional-tea', basePrice: 500, priceUnit: 'DA/person' },
  { id: 'artisan-market', category: 'historical', title: 'Artisan Market', tagline: 'Curated local crafts shop', icon: 'basket-outline', iconFamily: 'Ionicons', color: '#7F5539', route: '/services/historical/artisan-market', basePrice: 1500, priceUnit: 'DA/box' },
  { id: 'day-trip', category: 'historical', title: 'Day Trip Pack', tagline: 'All-inclusive tour + lunch', icon: 'map-outline', iconFamily: 'Ionicons', color: '#8B5E3C', route: '/services/historical/day-trip', basePrice: 7000, priceUnit: 'DA/person' },
  { id: 'ar-experience', category: 'historical', title: 'AR History', tagline: 'Augmented reality overlay', icon: 'eye-outline', iconFamily: 'Ionicons', color: '#6C63FF', route: '/services/historical/ar-experience', basePrice: 1000, priceUnit: 'DA/use' },

  // ───── CITY SERVICES (10) ─────
  { id: 'restaurant', category: 'city', title: 'Restaurant', tagline: 'Book table at top eateries', icon: 'restaurant-outline', iconFamily: 'Ionicons', color: '#6C63FF', route: '/services/city/restaurant', basePrice: 1000, priceUnit: 'DA/table' },
  { id: 'nightlife', category: 'city', title: 'Nightlife', tagline: 'Cafes, music & lounges', icon: 'musical-notes-outline', iconFamily: 'Ionicons', color: '#4834D4', route: '/services/city/nightlife', basePrice: 2500, priceUnit: 'DA/ticket' },
  { id: 'hammam', category: 'city', title: 'Hammam & Spa', tagline: 'Traditional bath & scrub', icon: 'water-outline', iconFamily: 'Ionicons', color: '#0a2540', route: '/services/city/hammam', basePrice: 3000, priceUnit: 'DA/session' },
  { id: 'shopping-tour', category: 'city', title: 'Shopping Tour', tagline: 'Souk guide & personal shopper', icon: 'bag-handle-outline', iconFamily: 'Ionicons', color: '#6C63FF', route: '/services/city/shopping-tour', basePrice: 3000, priceUnit: 'DA/tour' },
  { id: 'city-tour', category: 'city', title: 'Private City Tour', tagline: 'Private driver & guide for a day', icon: 'car-outline', iconFamily: 'Ionicons', color: '#4834D4', route: '/services/city/city-tour', basePrice: 12000, priceUnit: 'DA/day' },
  { id: 'events', category: 'city', title: 'Concerts & Shows', tagline: 'Local events ticket booking', icon: 'ticket-outline', iconFamily: 'Ionicons', color: '#A855F7', route: '/services/city/events', basePrice: 2500, priceUnit: 'DA/ticket' },
  { id: 'hotel-riad', category: 'city', title: 'Boutique Riads', tagline: 'Stay in the historical heart', icon: 'bed-outline', iconFamily: 'Ionicons', color: '#6C63FF', route: '/services/city/hotel-riad', basePrice: 14000, priceUnit: 'DA/night' },
  { id: 'city-photos', category: 'city', title: 'City Photoshoot', tagline: 'Urban sunset photo session', icon: 'camera-outline', iconFamily: 'Ionicons', color: '#FF70A6', route: '/services/city/city-photos', basePrice: 3500, priceUnit: 'DA/session' },
  { id: 'food-tour', category: 'city', title: 'Street Food Tour', tagline: 'Taste Algerias best bites', icon: 'restaurant-outline', iconFamily: 'Ionicons', color: '#6C63FF', route: '/services/city/food-tour', basePrice: 2000, priceUnit: 'DA/tour' },
  { id: 'culture-class', category: 'city', title: 'Darija Class', tagline: 'Language & culture intro', icon: 'book-outline', iconFamily: 'Ionicons', color: '#4834D4', route: '/services/city/culture-class', basePrice: 1500, priceUnit: 'DA/class' },
];

export const SERVICES: Service[] = RAW_SERVICES.map((s) => ({
  ...s,
  route: LIVE_ROUTES.has(s.route) ? s.route : comingSoonRoute(s.title),
}));

export function getServicesByCategory(category: 'beach' | 'desert' | 'mountain' | 'historical' | 'city'): Service[] {
  return SERVICES.filter((s) => s.category === category);
}

export function getServiceById(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}
