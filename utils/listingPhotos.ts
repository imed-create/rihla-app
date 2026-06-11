/**
 * RIHLA — Listing Photo Gallery Generator
 * ----------------------------------------
 * Generates realistic Unsplash photo galleries for every listing
 * based on category, wilaya, and listing metadata.
 */

const CATEGORY_PHOTOS: Record<string, string[]> = {
  hotel: [
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200', // hotel room
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200', // hotel lobby
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200', // hotel exterior
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200', // hotel pool
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200', // hotel bed
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200', // luxury hotel
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200', // resort pool
  ],
  restaurant: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200', // restaurant interior
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200', // fine dining
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200', // restaurant ambiance
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200', // restaurant bar
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200', // food plating
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200', // food closeup
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200', // dish
  ],
  beach: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200', // beach panorama
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200', // ocean
    'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1200', // beach waves
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200', // beach umbrellas
    'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1200', // turquoise water
  ],
  rental: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200', // villa exterior
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200', // living room
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200', // bedroom
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200', // kitchen
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200', // bathroom
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200', // apartment
  ],
  activity: [
    'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=1200', // adventure
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200', // activity
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200', // water sports
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200', // hiking
  ],
  event: [
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200', // concert
    'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1200', // music festival
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200', // event venue
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200', // crowd
  ],
  guide: [
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200', // architecture
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200', // guide walking
    'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200', // desert
    'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1200', // heritage
  ],
  photographer: [
    'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1200', // camera
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200', // wedding
    'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1200', // drone aerial
    'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200', // landscape
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200', // food photography
  ],
  driver: [
    'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200', // car road
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0abb?w=1200', // luxury car
    'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200', // desert road
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200', // van
  ],
  experience: [
    'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200', // sahara
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200', // experience
    'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1200', // cultural
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200', // adventure
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200', // traditional
  ],
};

const FALLBACK_PHOTOS = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200',
];

/**
 * Get a gallery photo array for a listing.
 * Uses the listing's cover_image_url as the first photo,
 * then adds category-specific photos.
 */
export function getListingGallery(
  coverUrl: string,
  category: string,
  maxPhotos: number = 6,
): string[] {
  const categoryPool = CATEGORY_PHOTOS[category] ?? FALLBACK_PHOTOS;
  const photos: string[] = coverUrl ? [coverUrl] : [];

  // Add category photos that aren't the same as cover
  for (const url of categoryPool) {
    if (photos.length >= maxPhotos) break;
    if (!photos.includes(url)) {
      photos.push(url);
    }
  }

  // Fill remaining with fallbacks if needed
  for (const url of FALLBACK_PHOTOS) {
    if (photos.length >= maxPhotos) break;
    if (!photos.includes(url)) {
      photos.push(url);
    }
  }

  return photos;
}

/**
 * Get hero gradient colors for a category.
 */
export function getCategoryHeroGradient(category: string): [string, string] {
  const gradients: Record<string, [string, string]> = {
    hotel: ['#1A6B3A', '#0a2540'],
    restaurant: ['#C56A39', '#8B4513'],
    beach: ['#00a896', '#0a2540'],
    rental: ['#6C63FF', '#4834D4'],
    activity: ['#E76F51', '#C1440E'],
    event: ['#7C3AED', '#5B21B6'],
    guide: ['#2D6A4F', '#1B4332'],
    photographer: ['#EC4899', '#BE185D'],
    driver: ['#1E40AF', '#1E3A5F'],
    experience: ['#8B5E3C', '#6B3F1E'],
  };
  return gradients[category] ?? ['#0a2540', '#061a2c'];
}
