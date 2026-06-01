export type DestinationType = 'beach' | 'desert' | 'mountain' | 'historical' | 'city';

export interface Destination {
  id: string;
  type: DestinationType;
  name: string;
  region: string;
  tagline: string;
  gradient: [string, string, ...string[]];
  rating: number;
  reviews: number;
  distance: string;
  flag?: 'green' | 'yellow' | 'red'; // beaches only
  features: string[];
  services: string[]; // service IDs available at this destination
  lat: number;
  lng: number;
}

export const DESTINATIONS: Destination[] = [
  // ───── BEACHES ─────
  {
    id: 'sidi-fredj',
    type: 'beach',
    name: 'Sidi Fredj',
    region: 'Algiers',
    tagline: 'The classic Algiers escape — calm waters & full amenities',
    gradient: ['#0096C7', '#023E58'],
    rating: 4.7,
    reviews: 1243,
    distance: '28 km',
    flag: 'green',
    features: ['Family Zone', 'VIP Area', 'Water Sports'],
    services: ['parking', 'spots', 'food', 'clothes', 'games', 'activities', 'massage', 'hotels', 'showers', 'events', 'powerbank', 'photos', 'guide'],
    lat: 36.7369,
    lng: 2.8658,
  },
  {
    id: 'bejaia',
    type: 'beach',
    name: 'Cap Carbon',
    region: 'Béjaïa',
    tagline: 'Crystal-clear waters surrounded by dramatic cliffs',
    gradient: ['#00B4D8', '#0077B6'],
    rating: 4.9,
    reviews: 892,
    distance: '260 km',
    flag: 'green',
    features: ['Snorkeling', 'Rock Diving', 'Hiking Trails'],
    services: ['parking', 'spots', 'food', 'clothes', 'games', 'activities', 'massage', 'hotels', 'showers', 'events', 'powerbank', 'photos', 'guide'],
    lat: 36.7767,
    lng: 5.0994,
  },
  {
    id: 'tipaza',
    type: 'beach',
    name: 'Tipaza Beach',
    region: 'Tipaza',
    tagline: 'Where Roman ruins meet the Mediterranean sea',
    gradient: ['#48CAE4', '#0096C7'],
    rating: 4.6,
    reviews: 654,
    distance: '70 km',
    flag: 'green',
    features: ['Historic Site', 'Sandy Beach', 'Photography'],
    services: ['parking', 'spots', 'food', 'clothes', 'games', 'activities', 'massage', 'hotels', 'showers', 'events', 'powerbank', 'photos', 'guide'],
    lat: 36.5898,
    lng: 2.4497,
  },
  {
    id: 'ain-taya',
    type: 'beach',
    name: 'Ain Taya',
    region: 'Algiers East',
    tagline: 'Popular family beach close to the capital',
    gradient: ['#90E0EF', '#0096C7'],
    rating: 4.3,
    reviews: 421,
    distance: '20 km',
    flag: 'yellow',
    features: ['Family Friendly', 'Promenade', 'Cafes'],
    services: ['parking', 'spots', 'food', 'clothes', 'games', 'activities', 'massage', 'hotels', 'showers', 'events', 'powerbank', 'photos', 'guide'],
    lat: 36.7883,
    lng: 3.2999,
  },
  {
    id: 'les-andalouses',
    type: 'beach',
    name: 'Les Andalouses',
    region: 'Oran',
    tagline: 'Oran\'s most beautiful bay with turquoise waters',
    gradient: ['#0096C7', '#03045E'],
    rating: 4.8,
    reviews: 1102,
    distance: '375 km',
    flag: 'green',
    features: ['Crystal Waters', 'Cliffs', 'Diving'],
    services: ['parking', 'spots', 'food', 'clothes', 'games', 'activities', 'massage', 'hotels', 'showers', 'events', 'powerbank', 'photos', 'guide'],
    lat: 35.7308,
    lng: -1.0097,
  },

  // ───── DESERT ─────
  {
    id: 'tamanrasset',
    type: 'desert',
    name: 'Tamanrasset',
    region: 'Hoggar',
    tagline: 'The gateway to the Sahara — heart of the Tuareg world',
    gradient: ['#E76F51', '#C1440E'],
    rating: 4.9,
    reviews: 387,
    distance: '1,900 km',
    features: ['Hoggar Mountains', 'Tuareg Culture', 'Stargazing'],
    services: ['camel', 'camp', 'dune-buggy', 'desert-trek', 'traditional-food', 'desert-photos', 'stargazing', 'cultural-show', 'safari-4x4', 'desert-hotels', 'desert-guide', 'safety-kit'],
    lat: 22.7851,
    lng: 5.5228,
  },
  {
    id: 'djanet',
    type: 'desert',
    name: 'Djanet',
    region: 'Tassili n\'Ajjer',
    tagline: 'UNESCO World Heritage — prehistoric rock art & golden dunes',
    gradient: ['#F4A261', '#E76F51'],
    rating: 5.0,
    reviews: 241,
    distance: '2,500 km',
    features: ['Rock Art', 'UNESCO Site', 'Untouched Dunes'],
    services: ['camel', 'camp', 'dune-buggy', 'desert-trek', 'traditional-food', 'desert-photos', 'stargazing', 'cultural-show', 'safari-4x4', 'desert-hotels', 'desert-guide', 'safety-kit'],
    lat: 24.5553,
    lng: 9.4844,
  },
  {
    id: 'timimoun',
    type: 'desert',
    name: 'Timimoun',
    region: 'Adrar',
    tagline: 'The Red Oasis — mud-brick architecture & rose salt lakes',
    gradient: ['#E9C46A', '#E76F51'],
    rating: 4.8,
    reviews: 198,
    distance: '1,500 km',
    features: ['Red Oasis', 'Salt Lake', 'Traditional Architecture'],
    services: ['camel', 'camp', 'dune-buggy', 'desert-trek', 'traditional-food', 'desert-photos', 'stargazing', 'cultural-show', 'safari-4x4', 'desert-hotels', 'desert-guide', 'safety-kit'],
    lat: 29.2641,
    lng: 0.2306,
  },

  // ───── MOUNTAINS ─────
  {
    id: 'djurdjura',
    type: 'mountain',
    name: 'Djurdjura',
    region: 'Béjaïa / Tizi Ouzou',
    tagline: 'Cedar forests, dramatic peaks & Amazigh highland culture',
    gradient: ['#2D6A4F', '#1B4332'],
    rating: 4.7,
    reviews: 312,
    distance: '120 km',
    features: ['National Park', 'Cedar Forests', 'Winter Snow'],
    services: ['hiking-guide', 'mountain-chalet', 'paragliding', 'rock-climbing', 'mountain-biking', 'camping-spot', 'bbq-package', 'nature-photos', 'foraging-tour', 'first-aid-kit'],
    lat: 36.4634,
    lng: 4.1673,
  },
  {
    id: 'chelia',
    type: 'mountain',
    name: 'Mount Chélia',
    region: 'Batna',
    tagline: 'Highest peak in northern Algeria — snow-capped in winter',
    gradient: ['#52B788', '#2D6A4F'],
    rating: 4.5,
    reviews: 187,
    distance: '440 km',
    features: ['Highest Peak', 'Aurès Mountains', 'Pine Forests'],
    services: ['hiking-guide', 'mountain-chalet', 'paragliding', 'rock-climbing', 'mountain-biking', 'camping-spot', 'bbq-package', 'nature-photos', 'foraging-tour', 'first-aid-kit'],
    lat: 35.3256,
    lng: 6.6324,
  },

  // ───── HISTORICAL SITES ─────
  {
    id: 'timgad',
    type: 'historical',
    name: 'Timgad',
    region: 'Batna',
    tagline: 'The Pompeii of Africa — perfectly preserved Roman city',
    gradient: ['#8B5E3C', '#6B3F1E'],
    rating: 4.9,
    reviews: 529,
    distance: '440 km',
    features: ['UNESCO Site', 'Roman Ruins', 'Well Preserved'],
    services: ['expert-guide', 'audio-tour', 'heritage-photos', 'craft-workshop', 'traditional-tea', 'artisan-market', 'day-trip', 'ar-experience'],
    lat: 35.4881,
    lng: 6.4671,
  },
  {
    id: 'tlemcen',
    type: 'historical',
    name: 'Tlemcen',
    region: 'Tlemcen',
    tagline: 'The Pearl of the Maghreb — Andalusian mosques & medina',
    gradient: ['#A0522D', '#8B5E3C'],
    rating: 4.8,
    reviews: 643,
    distance: '520 km',
    features: ['Islamic Architecture', 'Medina', 'Andalusian Heritage'],
    services: ['expert-guide', 'audio-tour', 'heritage-photos', 'craft-workshop', 'traditional-tea', 'artisan-market', 'day-trip', 'ar-experience'],
    lat: 34.8828,
    lng: -1.3151,
  },
  {
    id: 'casbah-algiers',
    type: 'historical',
    name: 'Casbah of Algiers',
    region: 'Algiers',
    tagline: 'UNESCO-listed Ottoman citadel — a labyrinth of history',
    gradient: ['#C17A3A', '#8B5E3C'],
    rating: 4.7,
    reviews: 921,
    distance: '5 km',
    features: ['UNESCO Site', 'Ottoman Architecture', 'Street Art'],
    services: ['expert-guide', 'audio-tour', 'heritage-photos', 'craft-workshop', 'traditional-tea', 'artisan-market', 'day-trip', 'ar-experience'],
    lat: 36.7882,
    lng: 3.0594,
  },

  // ───── CITIES ─────
  {
    id: 'algiers',
    type: 'city',
    name: 'Algiers',
    region: 'Capital',
    tagline: 'La Blanche — the white city on the Mediterranean hill',
    gradient: ['#6C63FF', '#4834D4'],
    rating: 4.6,
    reviews: 2103,
    distance: '0 km',
    features: ['Nightlife', 'Restaurants', 'Culture'],
    services: ['restaurant', 'nightlife', 'hammam', 'shopping-tour', 'city-tour', 'events', 'hotel-riad', 'city-photos', 'food-tour', 'culture-class'],
    lat: 36.7538,
    lng: 3.0588,
  },
  {
    id: 'oran',
    type: 'city',
    name: 'Oran',
    region: 'West Algeria',
    tagline: 'The Radiant — capital of raï music & vibrant street life',
    gradient: ['#A855F7', '#6C63FF'],
    rating: 4.7,
    reviews: 1456,
    distance: '360 km',
    features: ['Raï Music', 'Seafront', 'Nightlife'],
    services: ['restaurant', 'nightlife', 'hammam', 'shopping-tour', 'city-tour', 'events', 'hotel-riad', 'city-photos', 'food-tour', 'culture-class'],
    lat: 35.6969,
    lng: -0.6331,
  },
  {
    id: 'constantine',
    type: 'city',
    name: 'Constantine',
    region: 'East Algeria',
    tagline: 'City of Bridges — perched dramatically above the Rhumel gorge',
    gradient: ['#7C3AED', '#6C63FF'],
    rating: 4.8,
    reviews: 987,
    distance: '430 km',
    features: ['Suspension Bridges', 'Gorge Views', 'Berber Heritage'],
    services: ['restaurant', 'nightlife', 'hammam', 'shopping-tour', 'city-tour', 'events', 'hotel-riad', 'city-photos', 'food-tour', 'culture-class'],
    lat: 36.3650,
    lng: 6.6147,
  },
];

export const DESTINATION_TYPES: { id: DestinationType; label: string; emoji: string }[] = [
  { id: 'beach', label: 'Beaches', emoji: '🏖️' },
  { id: 'desert', label: 'Desert', emoji: '🏜️' },
  { id: 'mountain', label: 'Mountains', emoji: '⛰️' },
  { id: 'historical', label: 'Heritage', emoji: '🏛️' },
  { id: 'city', label: 'Cities', emoji: '🏙️' },
];

export function getDestinationsByType(type: DestinationType | 'all'): Destination[] {
  if (type === 'all') return DESTINATIONS;
  return DESTINATIONS.filter((d) => d.type === type);
}

export function getDestinationById(id: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.id === id);
}
