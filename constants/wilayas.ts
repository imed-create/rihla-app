/**
 * RIHLA — Algeria Wilayas
 * ─────────────────────────
 * All 58 Algerian administrative provinces (wilayas) with
 * geographic region classification and map coordinates.
 */

export type WilayaRegion = 'North Coast' | 'North West' | 'North Center' | 'North East' | 'High Plateaus' | 'Sahara';

export interface Wilaya {
  id: number;         // official wilaya number (1–58)
  code: string;       // URL-friendly slug
  name: string;       // official Arabic-transliterated name
  nameFr: string;     // French variant
  region: WilayaRegion;
  emoji: string;      // representative emoji
  lat: number;
  lng: number;
  hasBeach: boolean;
  hasDesert: boolean;
  hasMountain: boolean;
  highlight?: string; // one-line tourism hook
}

export const WILAYAS: Wilaya[] = [
  // ── NORTH COAST ────────────────────────────────────────────────
  { id: 6, code: 'bejaia', name: 'Béjaïa', nameFr: 'Béjaïa', region: 'North Coast', emoji: '🏖️', lat: 36.7528, lng: 5.0564, hasBeach: true, hasDesert: false, hasMountain: true, highlight: 'Crystal coves & Kabyle mountains' },
  { id: 9, code: 'blida', name: 'Blida', nameFr: 'Blida', region: 'North Coast', emoji: '🌹', lat: 36.4700, lng: 2.8277, hasBeach: false, hasDesert: false, hasMountain: true, highlight: 'City of roses & Atlas cedar forests' },
  { id: 16, code: 'alger', name: 'Alger', nameFr: 'Alger', region: 'North Coast', emoji: '🏙️', lat: 36.7538, lng: 3.0588, hasBeach: true, hasDesert: false, hasMountain: false, highlight: 'La Blanche — the white capital' },
  { id: 18, code: 'jijel', name: 'Jijel', nameFr: 'Jijel', region: 'North Coast', emoji: '🌊', lat: 36.8195, lng: 5.7662, hasBeach: true, hasDesert: false, hasMountain: false, highlight: 'Wild cliffs & turquoise bays' },
  { id: 19, code: 'setif', name: 'Sétif', nameFr: 'Sétif', region: 'North East', emoji: '🏛️', lat: 36.1898, lng: 5.4108, hasBeach: false, hasDesert: false, hasMountain: false, highlight: 'Gateway to the Roman East' },
  { id: 21, code: 'skikda', name: 'Skikda', nameFr: 'Skikda', region: 'North Coast', emoji: '⚓', lat: 36.8767, lng: 6.9000, hasBeach: true, hasDesert: false, hasMountain: false, highlight: 'Deep-blue coves & pine forests' },
  { id: 23, code: 'annaba', name: 'Annaba', nameFr: 'Annaba', region: 'North Coast', emoji: '🌸', lat: 36.9000, lng: 7.7667, hasBeach: true, hasDesert: false, hasMountain: false, highlight: 'City of coral & ancient Hippo Regius' },
  { id: 34, code: 'bordj-bou-arreridj', name: 'Bordj Bou Arréridj', nameFr: 'Bordj Bou Arréridj', region: 'North Center', emoji: '🏔️', lat: 36.0740, lng: 4.7630, hasBeach: false, hasDesert: false, hasMountain: true, highlight: 'High Atlas views & Hauts Plateaux' },
  { id: 35, code: 'boumerdes', name: 'Boumerdès', nameFr: 'Boumerdès', region: 'North Coast', emoji: '🏄', lat: 36.7628, lng: 3.4770, hasBeach: true, hasDesert: false, hasMountain: false, highlight: 'Near Algiers, surf & seafood' },
  { id: 36, code: 'el-tarf', name: 'El Tarf', nameFr: 'El Tarf', region: 'North East', emoji: '🦅', lat: 36.7674, lng: 8.3142, hasBeach: true, hasDesert: false, hasMountain: false, highlight: 'El Kala national park & wetlands' },
  { id: 38, code: 'tissemsilt', name: 'Tissemsilt', nameFr: 'Tissemsilt', region: 'North West', emoji: '🌾', lat: 35.6072, lng: 1.8120, hasBeach: false, hasDesert: false, hasMountain: true, highlight: 'Fertile highlands & Dahra forests' },
  { id: 42, code: 'tipaza', name: 'Tipaza', nameFr: 'Tipaza', region: 'North Coast', emoji: '🏛️', lat: 36.5898, lng: 2.4497, hasBeach: true, hasDesert: false, hasMountain: false, highlight: 'Roman ruins meet the Mediterranean' },

  // ── NORTH WEST ──────────────────────────────────────────────────
  { id: 13, code: 'tlemcen', name: 'Tlemcen', nameFr: 'Tlemcen', region: 'North West', emoji: '🕌', lat: 34.8828, lng: -1.3151, hasBeach: true, hasDesert: false, hasMountain: true, highlight: 'Pearl of the Maghreb & Andalusian heritage' },
  { id: 14, code: 'tiaret', name: 'Tiaret', nameFr: 'Tiaret', region: 'North West', emoji: '🐴', lat: 35.3707, lng: 1.3217, hasBeach: false, hasDesert: false, hasMountain: false, highlight: 'City of the horse & steppes' },
  { id: 22, code: 'sidi-bel-abbes', name: 'Sidi Bel Abbès', nameFr: 'Sidi Bel Abbès', region: 'North West', emoji: '🌺', lat: 35.1898, lng: -0.6306, hasBeach: false, hasDesert: false, hasMountain: false, highlight: 'Garden city of the west' },
  { id: 27, code: 'mostaganem', name: 'Mostaganem', nameFr: 'Mostaganem', region: 'North West', emoji: '🍊', lat: 35.9311, lng: 0.0890, hasBeach: true, hasDesert: false, hasMountain: false, highlight: 'Orange groves & golden beaches' },
  { id: 29, code: 'mascara', name: 'Mascara', nameFr: 'Mascara', region: 'North West', emoji: '🍇', lat: 35.3960, lng: 0.1409, hasBeach: false, hasDesert: false, hasMountain: false, highlight: 'Ancient vineyards & Beni-Chougrane' },
  { id: 31, code: 'oran', name: 'Oran', nameFr: 'Oran', region: 'North West', emoji: '🎶', lat: 35.6969, lng: -0.6331, hasBeach: true, hasDesert: false, hasMountain: false, highlight: 'The Radiant — capital of raï music' },
  { id: 44, code: 'ain-defla', name: 'Aïn Defla', nameFr: 'Aïn Defla', region: 'North West', emoji: '💧', lat: 36.2641, lng: 1.9673, hasBeach: false, hasDesert: false, hasMountain: true, highlight: 'River valleys & Chelif orchards' },
  { id: 45, code: 'naama', name: 'Naâma', nameFr: 'Naâma', region: 'North West', emoji: '🌵', lat: 33.2674, lng: -0.3064, hasBeach: false, hasDesert: true, hasMountain: false, highlight: 'Red dunes & nomadic trails' },
  { id: 46, code: 'ain-temouchent', name: 'Aïn Témouchent', nameFr: 'Aïn Témouchent', region: 'North West', emoji: '🏖️', lat: 35.3024, lng: -1.1405, hasBeach: true, hasDesert: false, hasMountain: false, highlight: 'Hidden coves & fig orchards' },

  // ── NORTH CENTER ─────────────────────────────────────────────────
  { id: 2, code: 'chlef', name: 'Chlef', nameFr: 'Chlef', region: 'North Center', emoji: '🌿', lat: 36.1681, lng: 1.3361, hasBeach: true, hasDesert: false, hasMountain: false, highlight: 'Chelif Valley & Ténès beaches' },
  { id: 10, code: 'bouira', name: 'Bouira', nameFr: 'Bouira', region: 'North Center', emoji: '🌲', lat: 36.3747, lng: 3.9006, hasBeach: false, hasDesert: false, hasMountain: true, highlight: 'Lakhdaria gorges & cedar forests' },
  { id: 15, code: 'tizi-ouzou', name: 'Tizi Ouzou', nameFr: 'Tizi Ouzou', region: 'North Center', emoji: '⛰️', lat: 36.7169, lng: 4.0497, hasBeach: false, hasDesert: false, hasMountain: true, highlight: 'Kabyle highlands & olive groves' },
  { id: 17, code: 'djelfa', name: 'Djelfa', nameFr: 'Djelfa', region: 'High Plateaus', emoji: '🌾', lat: 34.6836, lng: 3.2635, hasBeach: false, hasDesert: true, hasMountain: false, highlight: 'Chott El-Hodna & Saharan steppes' },
  { id: 26, code: 'medea', name: 'Médéa', nameFr: 'Médéa', region: 'North Center', emoji: '🕊️', lat: 36.2637, lng: 2.7526, hasBeach: false, hasDesert: false, hasMountain: true, highlight: 'Titteri mountains & pistachio forests' },
  { id: 43, code: 'mila', name: 'Mila', nameFr: 'Mila', region: 'North Center', emoji: '🏞️', lat: 36.4498, lng: 6.2648, hasBeach: false, hasDesert: false, hasMountain: false, highlight: 'Beni Haroun dam & rolling hills' },

  // ── NORTH EAST ───────────────────────────────────────────────────
  { id: 4, code: 'oum-el-bouaghi', name: 'Oum El Bouaghi', nameFr: 'Oum El Bouaghi', region: 'North East', emoji: '🦁', lat: 35.8820, lng: 7.1097, hasBeach: false, hasDesert: false, hasMountain: false, highlight: 'Aures gateway & Numidian history' },
  { id: 5, code: 'batna', name: 'Batna', nameFr: 'Batna', region: 'North East', emoji: '🏛️', lat: 35.5557, lng: 6.1740, hasBeach: false, hasDesert: false, hasMountain: true, highlight: 'Timgad ruins & Aurès highlands' },
  { id: 7, code: 'biskra', name: 'Biskra', nameFr: 'Biskra', region: 'North East', emoji: '🌴', lat: 34.8499, lng: 5.7290, hasBeach: false, hasDesert: true, hasMountain: false, highlight: 'Gateway to the Sahara & date palms' },
  { id: 25, code: 'constantine', name: 'Constantine', nameFr: 'Constantine', region: 'North East', emoji: '🌉', lat: 36.3650, lng: 6.6147, hasBeach: false, hasDesert: false, hasMountain: false, highlight: 'City of bridges above the gorge' },
  { id: 24, code: 'guelma', name: 'Guelma', nameFr: 'Guelma', region: 'North East', emoji: '🌡️', lat: 36.4623, lng: 7.4274, hasBeach: false, hasDesert: false, hasMountain: false, highlight: 'Hammam Debagh hot springs' },
  { id: 40, code: 'khenchela', name: 'Khenchela', nameFr: 'Khenchela', region: 'North East', emoji: '❄️', lat: 35.4288, lng: 7.1442, hasBeach: false, hasDesert: false, hasMountain: true, highlight: 'Aurès snowfields & Chélia peak' },
  { id: 41, code: 'souk-ahras', name: 'Souk Ahras', nameFr: 'Souk Ahras', region: 'North East', emoji: '🌿', lat: 36.2863, lng: 7.9506, hasBeach: false, hasDesert: false, hasMountain: true, highlight: 'Birthplace of Saint Augustine' },

  // ── HIGH PLATEAUS ─────────────────────────────────────────────────
  { id: 3, code: 'laghouat', name: 'Laghouat', nameFr: 'Laghouat', region: 'High Plateaus', emoji: '🌅', lat: 33.8002, lng: 2.8636, hasBeach: false, hasDesert: true, hasMountain: false, highlight: 'Northern gateway to the Sahara' },
  { id: 8, code: 'bechar', name: 'Béchar', nameFr: 'Béchar', region: 'High Plateaus', emoji: '🌟', lat: 31.6238, lng: -2.2164, hasBeach: false, hasDesert: true, hasMountain: true, highlight: 'Bechar gorges & Zousfana valley' },
  { id: 20, code: 'saida', name: 'Saïda', nameFr: 'Saïda', region: 'High Plateaus', emoji: '🦌', lat: 34.8302, lng: 0.1515, hasBeach: false, hasDesert: false, hasMountain: false, highlight: 'Moudjbara steppe & Roman citadel' },
  { id: 28, code: 'msila', name: 'M\'Sila', nameFr: 'M\'Sila', region: 'High Plateaus', emoji: '🏕️', lat: 35.7047, lng: 4.5441, hasBeach: false, hasDesert: true, hasMountain: false, highlight: 'Shotts & pastoral Hauts Plateaux' },
  { id: 32, code: 'el-bayadh', name: 'El Bayadh', nameFr: 'El Bayadh', region: 'High Plateaus', emoji: '🐑', lat: 33.6836, lng: 1.0139, hasBeach: false, hasDesert: true, hasMountain: false, highlight: 'White city of the southern steppes' },
  { id: 39, code: 'el-oued', name: 'El Oued', nameFr: 'El Oued', region: 'High Plateaus', emoji: '🏺', lat: 33.3683, lng: 6.8639, hasBeach: false, hasDesert: true, hasMountain: false, highlight: 'City of a thousand domes & the Souf' },

  // ── SAHARA ────────────────────────────────────────────────────────
  { id: 1, code: 'adrar', name: 'Adrar', nameFr: 'Adrar', region: 'Sahara', emoji: '🏜️', lat: 27.8742, lng: -0.2984, hasBeach: false, hasDesert: true, hasMountain: false, highlight: 'Timimoun oasis & Ksour architecture' },
  { id: 11, code: 'tamanrasset', name: 'Tamanrasset', nameFr: 'Tamanrasset', region: 'Sahara', emoji: '⭐', lat: 22.7851, lng: 5.5228, hasBeach: false, hasDesert: true, hasMountain: true, highlight: 'Hoggar mountains & Tuareg culture' },
  { id: 30, code: 'ouargla', name: 'Ouargla', nameFr: 'Ouargla', region: 'Sahara', emoji: '🛢️', lat: 31.9591, lng: 5.3480, hasBeach: false, hasDesert: true, hasMountain: false, highlight: 'Saharan oil capital & ancient ksour' },
  { id: 33, code: 'illizi', name: 'Illizi', nameFr: 'Illizi', region: 'Sahara', emoji: '🎨', lat: 26.5167, lng: 8.4833, hasBeach: false, hasDesert: true, hasMountain: true, highlight: 'Tassili prehistoric rock art — UNESCO' },
  { id: 37, code: 'tindouf', name: 'Tindouf', nameFr: 'Tindouf', region: 'Sahara', emoji: '🌍', lat: 27.6737, lng: -8.1479, hasBeach: false, hasDesert: true, hasMountain: false, highlight: 'Algeria\'s westernmost frontier' },
  { id: 47, code: 'ghardaia', name: 'Ghardaïa', nameFr: 'Ghardaïa', region: 'Sahara', emoji: '🕌', lat: 32.4908, lng: 3.6736, hasBeach: false, hasDesert: true, hasMountain: false, highlight: 'M\'Zab valley — UNESCO World Heritage' },
  { id: 48, code: 'relizane', name: 'Relizane', nameFr: 'Relizane', region: 'North West', emoji: '🌊', lat: 35.7377, lng: 0.5562, hasBeach: false, hasDesert: false, hasMountain: false, highlight: 'Chelif delta & wetlands' },
  { id: 49, code: 'el-mgair', name: 'El M\'Ghaïr', nameFr: 'El M\'Ghaïr', region: 'Sahara', emoji: '🌴', lat: 33.9500, lng: 5.9300, hasBeach: false, hasDesert: true, hasMountain: false, highlight: 'Oued Righ palm grove oases' },
  { id: 50, code: 'el-meniaa', name: 'El Ménéa', nameFr: 'El Ménéa', region: 'Sahara', emoji: '🌵', lat: 30.5900, lng: 2.8800, hasBeach: false, hasDesert: true, hasMountain: false, highlight: 'Gassi Touil & deep Sahara experience' },
  { id: 51, code: 'ouled-djellal', name: 'Ouled Djellal', nameFr: 'Ouled Djellal', region: 'Sahara', emoji: '🐪', lat: 34.4200, lng: 5.0700, hasBeach: false, hasDesert: true, hasMountain: false, highlight: 'Date capital of the Ziban valley' },
  { id: 52, code: 'bordj-badji-mokhtar', name: 'Bordj Badji Mokhtar', nameFr: 'Bordj Badji Mokhtar', region: 'Sahara', emoji: '🏺', lat: 21.3300, lng: 0.9500, hasBeach: false, hasDesert: true, hasMountain: false, highlight: 'At the edge of the world — remote Sahara' },
  { id: 53, code: 'beni-abbes', name: 'Béni Abbès', nameFr: 'Béni Abbès', region: 'Sahara', emoji: '🌊', lat: 30.1281, lng: -2.1619, hasBeach: false, hasDesert: true, hasMountain: false, highlight: 'White rose of the Saoura & red dunes' },
  { id: 54, code: 'timimoun', name: 'Timimoun', nameFr: 'Timimoun', region: 'Sahara', emoji: '🏯', lat: 29.2641, lng: 0.2306, hasBeach: false, hasDesert: true, hasMountain: false, highlight: 'The red oasis & rose salt lakes' },
  { id: 55, code: 'touggourt', name: 'Touggourt', nameFr: 'Touggourt', region: 'Sahara', emoji: '🌴', lat: 33.1000, lng: 6.0700, hasBeach: false, hasDesert: true, hasMountain: false, highlight: 'Oued Righ palm groves & ancient ksour' },
  { id: 56, code: 'djanet', name: 'Djanet', nameFr: 'Djanet', region: 'Sahara', emoji: '🎭', lat: 24.5553, lng: 9.4844, hasBeach: false, hasDesert: true, hasMountain: true, highlight: 'Tassili golden dunes — UNESCO rock art' },
  { id: 57, code: 'in-salah', name: 'In Salah', nameFr: 'In Salah', region: 'Sahara', emoji: '☀️', lat: 27.1966, lng: 2.4810, hasBeach: false, hasDesert: true, hasMountain: false, highlight: 'Heart of the Sahara — Tidikelt valley' },
  { id: 58, code: 'in-guezzam', name: 'In Guezzam', nameFr: 'In Guezzam', region: 'Sahara', emoji: '🌌', lat: 19.5667, lng: 5.7667, hasBeach: false, hasDesert: true, hasMountain: false, highlight: 'Algeria\'s southernmost frontier post' },
];

/** Featured wilayas shown on the home screen hero row */
export const FEATURED_WILAYAS: number[] = [16, 31, 25, 6, 23, 18, 42, 11, 47, 56, 13, 21];

/** Wilayas grouped by macro-region */
export const WILAYAS_BY_REGION: Record<WilayaRegion, Wilaya[]> = {
  'North Coast': WILAYAS.filter((w) => w.region === 'North Coast'),
  'North West': WILAYAS.filter((w) => w.region === 'North West'),
  'North Center': WILAYAS.filter((w) => w.region === 'North Center'),
  'North East': WILAYAS.filter((w) => w.region === 'North East'),
  'High Plateaus': WILAYAS.filter((w) => w.region === 'High Plateaus'),
  'Sahara': WILAYAS.filter((w) => w.region === 'Sahara'),
};

/** Beach wilayas (for beach filter) */
export const BEACH_WILAYAS = WILAYAS.filter((w) => w.hasBeach);

/** Desert wilayas */
export const DESERT_WILAYAS = WILAYAS.filter((w) => w.hasDesert);

/** Get wilaya by code */
export function getWilayaByCode(code: string): Wilaya | undefined {
  return WILAYAS.find((w) => w.code === code);
}

/** Get wilaya by id */
export function getWilayaById(id: number): Wilaya | undefined {
  return WILAYAS.find((w) => w.id === id);
}

/** Search wilayas by name */
export function searchWilayas(query: string): Wilaya[] {
  const q = query.trim().toLowerCase();
  if (!q) return WILAYAS;
  return WILAYAS.filter(
    (w) =>
      w.name.toLowerCase().includes(q) ||
      w.nameFr.toLowerCase().includes(q) ||
      w.region.toLowerCase().includes(q)
  );
}
