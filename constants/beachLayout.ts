import { SAHEL } from '@/constants/Colors';

export type SandZoneId = 'family' | 'vip' | 'free';
export type BeachAssetKind = 'umbrella' | 'lounger' | 'table';

export const BEACH_ACCENT = SAHEL.accent;

export const ZONE_CONFIG: Record<
  SandZoneId,
  { label: string; tint: string; border: string; accent: string; spots: number }
> = {
  family: {
    label: 'Family Zone',
    tint: '#E8F4FC',
    border: '#B8D4E8',
    accent: SAHEL.primary,
    spots: 20,
  },
  vip: {
    label: 'VIP Zone',
    tint: '#FFF8F0',
    border: '#F5D5B8',
    accent: SAHEL.highlight,
    spots: 10,
  },
  free: {
    label: 'Free Zone',
    tint: '#E6FAF7',
    border: '#A8E6DC',
    accent: SAHEL.accent,
    spots: 30,
  },
};

export const SPOT_STATE_COLORS = {
  available: { bg: SAHEL.card, border: SAHEL.border, icon: SAHEL.mutedText },
  selected: { bg: '#E6FAF7', border: SAHEL.accent, icon: SAHEL.accent },
  occupied: { bg: SAHEL.border, border: SAHEL.border, icon: '#bbbbbb' },
  deliveryPulse: { bg: '#FFF8F0', border: SAHEL.highlight, icon: SAHEL.highlightDark },
} as const;

export const SLOT_AVAILABLE = { bg: '#E6FAF7', border: SAHEL.accent, label: SAHEL.accent };
export const SLOT_OCCUPIED = { bg: '#FEF2F2', border: '#EF4444', label: '#B91C1C' };
export const SLOT_SELECTED = { bg: SAHEL.primary, border: SAHEL.primary, label: SAHEL.white };

export function assetKindForIndex(index: number): BeachAssetKind {
  if (index % 5 === 0) return 'table';
  if (index % 2 === 0) return 'lounger';
  return 'umbrella';
}

export function makeZoneSpots(zone: SandZoneId, count: number) {
  const prefix = zone === 'family' ? 'F' : zone === 'vip' ? 'V' : 'G';
  return Array.from({ length: count }, (_, i) => {
    const index = i + 1;
    return {
      id: `${prefix}-${String(index).padStart(2, '0')}`,
      zone,
      index,
      asset: assetKindForIndex(index),
    };
  });
}

export type SandSpot = ReturnType<typeof makeZoneSpots>[number];
