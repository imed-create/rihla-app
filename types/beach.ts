/** Beach zone labels for spot grid matrices */
export type ZoneType = 'Family' | 'VIP' | 'Free';

/** 0 = walkway (not bookable), 1 = available, 2 = locked/taken */
export type SpotCellStatus = 0 | 1 | 2;

export type Spot = {
  id: string;
  row: number;
  col: number;
  status: SpotCellStatus;
  zone: ZoneType;
  price: number;
};

export type SpotMatrix = Spot[][];

export type BeachLocation = {
  latitude: number;
  longitude: number;
};

export type Beach = {
  id: string;
  name: string;
  wilaya: string;
  location: BeachLocation;
  photos: string[];
  zones: ZoneType[];
  rating: number;
  isActive: boolean;
  spotMatrix?: SpotMatrix;
};

/** Legacy lowercase zone ids used by beachLayout.ts */
export type SandZoneId = 'family' | 'vip' | 'free';

export function zoneTypeToSandId(zone: ZoneType): SandZoneId {
  if (zone === 'VIP') return 'vip';
  if (zone === 'Free') return 'free';
  return 'family';
}

export function sandIdToZoneType(id: SandZoneId): ZoneType {
  if (id === 'vip') return 'VIP';
  if (id === 'free') return 'Free';
  return 'Family';
}

export type SpotBookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type BeachBooking = {
  id: string;
  userId: string;
  spotId: string;
  beachId: string;
  date: string;
  status: SpotBookingStatus;
  totalDZD: number;
  paid: boolean;
  expiresAt?: string;
};
